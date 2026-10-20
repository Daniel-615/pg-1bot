import axios from "axios";
import type { ClientPlatform } from "../screens/platform";
import { attachAccessToken } from "./access-token";
const CLOUD_API_URL =
  import.meta.env.VITE_ARDUINO_API_URL_CLOUD ||
  import.meta.env.VITE_ARDUINO_BACKEND_API_URL ||
  import.meta.env.VITE_ARDUINO_API_URL;
const LOCAL_AGENT_API_URL =
  import.meta.env.VITE_ARDUINO_API ||
  import.meta.env.VITE_ARDUINO_LOCAL_API_URL ||
  "http://localhost:3000";
type CompileSketchParams = {
  code: string;
  board: string;
  filename?: string;
  port?: string;
  upload?: boolean;
};

type CompileSketchResult = {
  ok: boolean;
  message: string;
  data: unknown;
};

export type CompileTransport = "local" | "backend";
export type CompileMode = "cloud" | "local";

export type CompileTarget = {
  apiUrl: string;
  transport: CompileTransport;
  platform: ClientPlatform;
};

type BackendErrorPayload = {
  ok?: boolean;
  message?: string;
  error?: string;
};

const BOARD_FQBN_MAP: Record<string, string> = {
  uno: "arduino:avr:uno",
  mega: "arduino:avr:mega",
  nano: "arduino:avr:nano",
  esp32: "esp32:esp32:esp32",
};

export type CompiledArtifact = {
  bytes: ArrayBuffer;
  format: "intel-hex" | "binary";
  fileName: string;
  fqbn?: string;
  compileLog?: string;
};

// Send both the JWT header and the auth cookie when the browser has one.
// The local agent normally bypasses auth on loopback, while the cloud backend
// validates the bearer token.
const arduinoApi = attachAccessToken(axios.create({ withCredentials: true }));

function sanitizeFilename(value: string) {
  return value
    .replace(/[<>:"/\\|?*]/g, "_")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32;
    })
    .join("");
}

function normalizeApiUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
     return CLOUD_API_URL;
  }

  return trimmed.replace(/\/+$/, "");
}

function normalizeFilename(value: string | undefined) {
  const baseName = value?.trim() || "sketch";
  const sanitized = sanitizeFilename(baseName);
  return sanitized.toLowerCase().endsWith(".ino") ? sanitized : `${sanitized}.ino`;
}

function normalizeCodeyFilename(value: string | undefined) {
  const baseName = value?.trim() || "main";
  const sanitized = sanitizeFilename(baseName).replace(/\.(ino|py)$/i, "");
  return `${sanitized.toLowerCase().endsWith(".py") ? sanitized.slice(0, -3) : sanitized}.py`;
}

export class ArduinoApi {
  readonly apiUrl: string;

  constructor(apiUrl = import.meta.env.VITE_API_URL as string | undefined) {
    this.apiUrl = normalizeApiUrl(apiUrl);
  }

  async postCompile({ code, board, filename, port, upload = false }: CompileSketchParams): Promise<CompileSketchResult> {
    /*
      Converts code to arduino sketch (ino), and call the api to compile this returns a status and message
    */
    const formData = new FormData();
    const isCodey = board === "codey";
    const resolvedFilename = isCodey ? normalizeCodeyFilename(filename) : normalizeFilename(filename);
    const file = new Blob([code], { type: "text/plain" });
    const fqbn = BOARD_FQBN_MAP[board];

    if (!fqbn && !isCodey) {
      throw new Error(`La placa "${board}" no tiene un fqbn configurado para compilar.`);
    }

    formData.append("file", file, resolvedFilename);
    formData.append("upload", String(upload));
    if (fqbn) {
      formData.append("fqbn", fqbn);
    }
    if (board === "codey") {
      if (filename) formData.append("filename", resolvedFilename);
      formData.append("board", board);
    }
    if (port) {
      formData.append("port", port);
    }

    const endpoint = isCodey ? "/api/codey/compile" : "/api/arduino/compile";
    const response = await arduinoApi.post(`${this.apiUrl}${endpoint}`, formData, { timeout: 300000 });

    const payload = response.data as { ok?: boolean; message?: string };

    return {
      ok: payload.ok ?? true,
      message: payload.message ?? "Compilacion completada.",
      data: response.data,
    };
  }

  async compileArtifact({ code, board, filename }: CompileSketchParams): Promise<CompiledArtifact> {
    const formData = new FormData();
    const fileName = board === "codey" ? normalizeCodeyFilename(filename) : normalizeFilename(filename);
    formData.append("file", new Blob([code], { type: "text/plain" }), fileName);
    const fqbn = BOARD_FQBN_MAP[board];
    if (!fqbn) throw new Error(`La placa "${board}" no tiene un FQBN compilable configurado.`);
    formData.append("fqbn", fqbn);
    const response = await arduinoApi.post(`${this.apiUrl}/api/arduino/compile/artifact`, formData, {
      responseType: "arraybuffer",
      timeout: 300000,
    });
    const responseFileName = /filename="?([^";]+)"?/i.exec(String(response.headers["content-disposition"] || ""))?.[1] || "firmware.bin";
    const format = String(response.headers["x-firmware-format"] || responseFileName.split(".").pop() || "bin").toLowerCase() === "hex" ? "intel-hex" : "binary";
    return { bytes: response.data as ArrayBuffer, format, fileName: responseFileName, fqbn: String(response.headers["x-firmware-fqbn"] || fqbn), compileLog: String(response.headers["x-firmware-compile-log"] || "") };
  }
}

export function resolveCompileTarget(platform: ClientPlatform, mode: CompileMode = platform === "desktop" ? "local" : "cloud"): CompileTarget {
  if (mode === "local") {
    return {
      apiUrl: normalizeApiUrl(LOCAL_AGENT_API_URL),
      transport: "local",
      platform,
    };
  }

  return {
    apiUrl: normalizeApiUrl(
      CLOUD_API_URL,
    ),
    transport: "backend",
    platform,
  };
}

export async function compileFirmware(params: CompileSketchParams & { target: CompileTarget }): Promise<CompiledArtifact> {
  return new ArduinoApi(params.target.apiUrl).compileArtifact(params);
}

export async function compileSketch(
  params: CompileSketchParams & {
    target: CompileTarget;
  },
): Promise<CompileSketchResult> {
  const client = new ArduinoApi(params.target.apiUrl);

  return client.postCompile({
    ...params,
    upload: params.target.transport === "local",
  });
}

export function getArduinoCompileErrorMessage(
  error: unknown,
  fallback = "No se pudo compilar el programa."
) {
  return getArduinoUserErrorMessage(error, fallback);
}

export function getArduinoUserErrorMessage(error: unknown, fallback = "No se pudo completar la operación con Arduino.") {
  let rawMessage = "";

  if (axios.isAxiosError(error)) {
    let payload = error.response?.data as BackendErrorPayload | undefined;
    if (payload instanceof ArrayBuffer) {
      try {
        payload = JSON.parse(new TextDecoder().decode(payload)) as BackendErrorPayload;
      } catch {
        payload = undefined;
      }
    }
    rawMessage = payload?.message || payload?.error || error.message || "";

    if (error.code === "ERR_NETWORK") {
      return fallback;
    }
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "string") {
    rawMessage = error;
  }

  const message = rawMessage.toLowerCase();

  if (
    message.includes("abort") ||
    message.includes("cancel") ||
    message.includes("canceled") ||
    message.includes("cancelled") ||
    message.includes("no port selected") ||
    message.includes("user denied")
  ) {
    return "Operación cancelada. No se realizaron cambios en la placa.";
  }

  if (
    message.includes("no arduino port detected") ||
    message.includes("no device found") ||
    message.includes("port is not available") ||
    message.includes("cannot open port") ||
    message.includes("access is denied") ||
    message.includes("resource busy")
  ) {
    return "No se encontró el puerto de la placa. Conecta la placa y selecciona un puerto disponible.";
  }

  if (message.includes("spawn udevadm") || message.includes("udevadm")) {
    return "No se pudieron consultar los puertos del sistema. Conecta la placa e inténtalo de nuevo.";
  }

  if (message.includes("timed out") || message.includes("timeout")) {
    return "La placa no respondió a tiempo. Comprueba la conexión USB e inténtalo de nuevo.";
  }

  return rawMessage || fallback;
}

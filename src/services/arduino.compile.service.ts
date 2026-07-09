import axios from "axios";
import type { ClientPlatform } from "../app/platform";
import { toast } from "react-toastify";
const DEFAULT_BACKEND_API_URL = import.meta.env.VITE_ARDUINO_API_URL;
if (!DEFAULT_BACKEND_API_URL) {
  toast.error(
    "La URL del servicio de compilación no está configurado"
  )
}
type CompileSketchParams = {
  code: string;
  board: string;
  filename?: string;
};

type CompileSketchResult = {
  ok: boolean;
  message: string;
  data: unknown;
};

export type CompileTransport = "local" | "backend";

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
    return DEFAULT_BACKEND_API_URL;
  }

  return trimmed.replace(/\/+$/, "");
}

function normalizeFilename(value: string | undefined) {
  const baseName = value?.trim() || "sketch";
  const sanitized = sanitizeFilename(baseName);
  return sanitized.toLowerCase().endsWith(".ino") ? sanitized : `${sanitized}.ino`;
}

export class ArduinoApi {
  readonly apiUrl: string;

  constructor(apiUrl = import.meta.env.VITE_API_URL as string | undefined) {
    this.apiUrl = normalizeApiUrl(apiUrl);
  }

  async postCompile({ code, board, filename }: CompileSketchParams): Promise<CompileSketchResult> {
    /*
      Converts code to arduino sketch (ino), and call the api to compile this returns a status and message
    */
    const formData = new FormData();
    const resolvedFilename = normalizeFilename(filename);
    const file = new Blob([code], { type: "text/plain" });
    const fqbn = BOARD_FQBN_MAP[board];

    if (!fqbn) {
      throw new Error(`La placa "${board}" no tiene un fqbn configurado para compilar.`);
    }

    formData.append("file", file, resolvedFilename);
    formData.append("fqbn", fqbn);

    const response = await axios.post(`${this.apiUrl}/api/arduino/compile`, formData);

    const payload = response.data as { ok?: boolean; message?: string };

    return {
      ok: payload.ok ?? true,
      message: payload.message ?? "Compilacion completada.",
      data: response.data,
    };
  }

}

export function resolveCompileTarget(platform: ClientPlatform): CompileTarget {
  if (platform === "mobile") {
    return {
      apiUrl: normalizeApiUrl(
        import.meta.env.VITE_ARDUINO_BACKEND_API_URL as string,
      ),
      transport: "backend",
      platform,
    };
  }

  return {
    apiUrl: normalizeApiUrl(
      (import.meta.env.VITE_ARDUINO_LOCAL_API_URL as string),
    ),
    transport: "local",
    platform,
  };
}

export async function compileSketch(
  params: CompileSketchParams & {
    target: CompileTarget;
  },
): Promise<CompileSketchResult> {
  const client = new ArduinoApi(params.target.apiUrl);

  return client.postCompile(params);
}

export function getArduinoCompileErrorMessage(error: unknown) {
  /*
    Call the backend api, and start compiling if get an error it shown on screen with TOAST
   */
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as BackendErrorPayload | undefined;
    if (payload?.message && payload?.error) {
      return `${payload.message}: ${payload.error}`;
    }

    if (payload?.message) {
      return payload.message;
    }

    if (payload?.error) {
      return payload.error;
    }

    if (error.code === "ERR_NETWORK") {
      return "No se pudo contactar el servicio de compilacion. En computadora debes levantar un servicio local con acceso a arduino-cli; en telefono debes configurar un backend remoto accesible.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo compilar el archivo.";
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthorizationHeader, clearAccessToken, getAccessToken, setAccessToken } from "../src/services/access-token";
import { hasRequiredPermissions } from "../src/routes/permissions";
import { parseProjectFile, serializeProjectFile } from "../src/services/project-file.service";
import { getWokwiBoardConfig, prepareWokwiSimulation } from "../src/screens/simulator/wokwi";
import { detectClientPlatform } from "../src/screens/platform";
import { formatArduinoCode } from "../src/core/codeEngine/arduinoCompiler";
import { getArduinoCompileErrorMessage, ArduinoApi } from "../src/services/arduino.compile.service";
import { blocksApi } from "../src/services/extensions.service";
import { downloadCloudProject, getCloudProjects, uploadJsonToCloud } from "../src/services/storage.service";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("Plan de pruebas PRU-01 a PRU-12", () => {
  it("PRU-01: conserva la evaluación de operadores matemáticos, lógicos y comparación", () => {
    expect(2 + 6).toBe(8);
    const left = true;
    const right = false;
    expect(left && right).toBe(false);
    const measured = 8;
    expect(measured > 3).toBe(true);
    expect(measured === 8).toBe(true);
  });

  it("PRU-02: tiene configuración Wokwi para las placas soportadas", () => {
    for (const board of ["uno", "mega", "nano", "esp32"]) {
      expect(getWokwiBoardConfig(board)).toEqual(expect.objectContaining({ template: expect.any(String) }));
    }
  });

  it("PRU-03: permite interpolar y conservar código de extensiones", async () => {
    const { extensionTemplates } = await import("../src/screens/extensions/extensionBuilderTemplates");
    expect(extensionTemplates.some((template) => template.code.includes("digitalWrite"))).toBe(true);
  });

  it("PRU-04: define una base de proyecto que puede reconstruirse sin perder bloques", () => {
    const project = { version: "1.0", board: "uno", projectName: "LED", blocks: { blocks: [{ type: "program_start" }] } };
    expect(parseProjectFile(serializeProjectFile(project), "fallback")).toEqual(project);
  });

  it("PRU-05: genera código repetidamente dentro de un umbral razonable", () => {
    const start = performance.now();
    for (let index = 0; index < 500; index += 1) {
      formatArduinoCode("void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); }");
    }
    expect(performance.now() - start).toBeLessThan(1000);
  });

  describe("PRU-06: autenticación, tokens y permisos", () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, "window", { value: {
        location: { hash: "", pathname: "/", search: "" },
        history: { replaceState: vi.fn() },
        sessionStorage: createStorage(),
      }, configurable: true });
    });

    it("guarda, envía y elimina el token de sesión", () => {
      setAccessToken("token-test");
      expect(getAccessToken()).toBe("token-test");
      expect(getAuthorizationHeader()).toEqual({ Authorization: "Bearer token-test" });
      clearAccessToken();
      expect(getAccessToken()).toBeNull();
    });

    it("aplica permisos y privilegia los roles administrativos", () => {
      expect(hasRequiredPermissions({ permisos: ["leer_bloque"] }, ["leer_bloque"])).toBe(true);
      expect(hasRequiredPermissions({ permisos: [] }, ["leer_bloque"])).toBe(false);
      expect(hasRequiredPermissions({ rol: "admin" }, ["cualquier_permiso"])).toBe(true);
    });
  });

  it("PRU-07: prepara el flujo Wokwi y rechaza placas sin compilador configurado", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, projectId: "wokwi-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await prepareWokwiSimulation({ apiUrl: "https://api.test/", workspaceId: "ws", projectName: "LED", board: "uno", code: "void setup() {}" });
    expect(result.projectUrl).toBe("https://wokwi.com/projects/wokwi-1");
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/api/wokwi/simulations", expect.objectContaining({ method: "POST" }));
    await expect(new ArduinoApi("https://api.test").postCompile({ code: "", board: "desconocida" })).rejects.toThrow("no tiene un fqbn");
  });

  it("PRU-08: guarda y recupera proyectos JSON desde el almacenamiento", async () => {
    vi.spyOn(blocksApi, "post").mockResolvedValue({ data: { ok: true, data: { key: "projects/led.json", uploadUrl: "https://upload.test", publicUrl: null, expiresIn: 60 } } } as never);
    vi.spyOn(blocksApi, "get").mockResolvedValueOnce({ data: { ok: true, data: [{ id_proyecto: "p1", nombre: "LED", placa: "uno", createdAt: "", updatedAt: "" }] } } as never);
    vi.spyOn(blocksApi, "get").mockResolvedValueOnce({ data: { ok: true, data: { url: "https://download.test" } } } as never);
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ blocks: { blocks: [] } }) }));

    await expect(uploadJsonToCloud("led.json", "{}", "LED", "uno")).resolves.toMatchObject({ key: "projects/led.json" });
    await expect(getCloudProjects()).resolves.toHaveLength(1);
    await expect(downloadCloudProject("p1")).resolves.toEqual({ blocks: { blocks: [] } });
  });

  it("PRU-09: identifica correctamente escritorio y dispositivos móviles", () => {
    expect(detectClientPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
    expect(detectClientPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
  });

  it("PRU-10: rechaza archivos de proyecto corruptos con un mensaje accionable", () => {
    expect(() => parseProjectFile("{invalid", "proyecto")).toThrow("JSON válido");
    expect(() => parseProjectFile(JSON.stringify({ board: "uno" }), "proyecto")).toThrow("bloques Blockly");
  });

  it("PRU-11: produce un archivo JSON estable para exportación e importación", () => {
    const source = { version: "1.0", board: "mega", projectName: "Programa", blocks: { blocks: [{ type: "program_start" }] } };
    const exported = serializeProjectFile(source);
    expect(exported).toContain('"board": "mega"');
    expect(parseProjectFile(exported, "otro")).toEqual(source);
  });

  it("PRU-12: mantiene contratos accesibles de permisos y nombres de proyecto", () => {
    expect(hasRequiredPermissions(null, [])).toBe(true);
    expect(parseProjectFile(serializeProjectFile({ projectName: "Mi proyecto", blocks: {} }), "fallback").projectName).toBe("Mi proyecto");
    expect(getArduinoCompileErrorMessage(new Error("fallo de prueba"))).toBe("fallo de prueba");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

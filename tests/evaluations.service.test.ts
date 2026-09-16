import { describe, expect, it } from "vitest";
import { validateEvaluationPayload } from "../src/services/evaluations.service";

const validPayload = {
  momento: "pretest" as const,
  puntuacion: 0,
  puntuacion_maxima: 10,
  duracion_segundos: 60,
  intentos: 1,
};

describe("validateEvaluationPayload", () => {
  it("acepta una puntuación cero y valores opcionales omitidos", () => {
    expect(validateEvaluationPayload("user-1", validPayload)).toBe(true);
  });

  it("acepta únicamente pretest y postest", () => {
    expect(validateEvaluationPayload("user-1", { ...validPayload, momento: "postest" })).toBe(true);
    expect(validateEvaluationPayload("user-1", { ...validPayload, momento: "final" as never })).toBe(false);
  });

  it("rechaza puntuaciones fuera del rango y máximos inválidos", () => {
    expect(validateEvaluationPayload("user-1", { ...validPayload, puntuacion: -1 })).toBe(false);
    expect(validateEvaluationPayload("user-1", { ...validPayload, puntuacion: 11 })).toBe(false);
    expect(validateEvaluationPayload("user-1", { ...validPayload, puntuacion_maxima: 0 })).toBe(false);
  });

  it("rechaza duración e intentos inválidos", () => {
    expect(validateEvaluationPayload("user-1", { ...validPayload, duracion_segundos: -1 })).toBe(false);
    expect(validateEvaluationPayload("user-1", { ...validPayload, duracion_segundos: 1.5 })).toBe(false);
    expect(validateEvaluationPayload("user-1", { ...validPayload, intentos: 0 })).toBe(false);
    expect(validateEvaluationPayload("user-1", { ...validPayload, intentos: 2.5 })).toBe(false);
  });

  it("rechaza usuarios e instrumentos inválidos", () => {
    expect(validateEvaluationPayload("", validPayload)).toBe(false);
    expect(validateEvaluationPayload("user-1", { ...validPayload, instrumento: "x".repeat(121) })).toBe(false);
  });
});

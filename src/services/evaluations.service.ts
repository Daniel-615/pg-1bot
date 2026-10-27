import axios from "axios";
import { attachAccessToken } from "./access-token";

const API_URL = ((import.meta.env.VITE_ERRORS_API_URL as string | undefined) ?? "http://localhost:3003").replace(/\/+$/, "");
const api = attachAccessToken(axios.create());

export type EvaluationMetrics = {
  inicial: number | null;
  final: number | null;
  mejoraPorcentual: number | null;
  muestraPretest: number;
  muestraPostest: number;
  fechaInicial: string | null;
  fechaFinal: string | null;
};

export type EvaluationRecord = EvaluationPayload & {
  id_evaluacion: string;
  id_usuario: string;
  createdAt: string;
};

export type EvaluationProgress = {
  metrics: EvaluationMetrics;
  evaluations: EvaluationRecord[];
};

export type EvaluationPayload = {
  momento: "pretest" | "postest";
  puntuacion: number;
  puntuacion_maxima: number;
  instrumento?: string;
  duracion_segundos?: number;
  intentos?: number;
};

export function validateEvaluationPayload(userId: string, payload: EvaluationPayload) {
  const instrument = payload.instrumento?.trim() || "Evaluación de programación";
  if (!userId || instrument.length > 120 || !["pretest", "postest"].includes(payload.momento)) return false;
  if (!Number.isFinite(payload.puntuacion) || !Number.isFinite(payload.puntuacion_maxima) || payload.puntuacion_maxima <= 0 || payload.puntuacion < 0 || payload.puntuacion > payload.puntuacion_maxima) return false;
  if (payload.duracion_segundos !== undefined && (!Number.isInteger(payload.duracion_segundos) || payload.duracion_segundos < 0)) return false;
  if (payload.intentos !== undefined && (!Number.isInteger(payload.intentos) || payload.intentos < 1)) return false;
  return true;
}

export async function getEvaluationMetrics(userId: string): Promise<EvaluationMetrics> {
  const response = await api.get<{ data: EvaluationMetrics }>(`${API_URL}/api/evaluations/${userId}/metrics`);
  return response.data.data;
}

export async function getOwnEvaluationProgress(): Promise<EvaluationProgress> {
  const response = await api.get<{ data: EvaluationProgress }>(`${API_URL}/api/evaluations/me/progress`);
  return response.data.data;
}

export async function getGlobalEvaluationMetrics(ageMin?: number, ageMax?: number): Promise<EvaluationMetrics> {
  const params = ageMin === undefined && ageMax === undefined ? undefined : { edadMin: ageMin, edadMax: ageMax };
  const response = await api.get<{ data: EvaluationMetrics }>(`${API_URL}/api/evaluations/metrics`, { params });
  return response.data.data;
}

export async function createEvaluation(userId: string, payload: EvaluationPayload) {
  const instrument = payload.instrumento?.trim() || "Evaluación de programación";
  if (!validateEvaluationPayload(userId, payload)) throw new Error("Los datos de la evaluación son inválidos.");
  return api.post(`${API_URL}/api/evaluations/${userId}`, { ...payload, instrumento: instrument });
}

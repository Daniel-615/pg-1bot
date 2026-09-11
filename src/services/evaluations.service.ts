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
};

export async function getEvaluationMetrics(userId: string): Promise<EvaluationMetrics> {
  const response = await api.get<{ data: EvaluationMetrics }>(`${API_URL}/api/evaluations/${userId}/metrics`);
  return response.data.data;
}

export async function createEvaluation(userId: string, payload: {
  momento: "pretest" | "postest";
  puntuacion: number;
  puntuacion_maxima: number;
  instrumento?: string;
  duracion_segundos?: number;
  intentos?: number;
}) {
  return api.post(`${API_URL}/api/evaluations/${userId}`, payload);
}

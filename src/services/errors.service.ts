import axios from "axios";
import type { Issue } from "../core/blockEngine/semantic/arduinoSemanticAnalyzer";
import { attachAccessToken } from "./access-token";

const ERRORS_API_URL = ((import.meta.env.VITE_ERRORS_API_URL as string | undefined) ?? "http://localhost:3003").replace(/\/+$/, "");
const errorsApi = attachAccessToken(axios.create());

export async function reportCriticalErrors(params: {
  userId: string;
  age?: number;
  program: string;
  issues: Issue[];
}) {
  const reports = params.issues.map((issue) =>
    errorsApi.post(`${ERRORS_API_URL}/api/errors/${params.userId}`, {
      message: issue.message,
      severity: issue.severity,
      nombre_programa: params.program,
      edad: params.age,
    })
  );

  const results = await Promise.allSettled(reports);
  return results.filter((result) => result.status === "fulfilled").length;
}

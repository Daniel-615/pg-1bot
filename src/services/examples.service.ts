import { getBlocksUrl, blocksApi, type BlocksServiceResponse } from "./extensions.service";

export type StoredExample = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  placa: string;
  dificultad: "beginner" | "intermediate" | "advanced";
  icono: string;
  workspace: {
    version?: string;
    board?: string;
    projectName?: string;
    blocks?: unknown;
  };
};

export type CreateExamplePayload = {
  nombre: string;
  descripcion?: string;
  placa: string;
  dificultad: StoredExample["dificultad"];
  icono: string;
  workspace: StoredExample["workspace"];
};

export type CreateExampleInput = Omit<CreateExamplePayload, "workspace">;

export async function getExamples() {
  const response = await blocksApi.get<BlocksServiceResponse<StoredExample[]>>(
    getBlocksUrl("examples"),
    { withCredentials: true },
  );
  return response.data.data ?? [];
}

export async function createExample(payload: CreateExamplePayload) {
  const response = await blocksApi.post<BlocksServiceResponse<StoredExample>>(
    getBlocksUrl("examples"),
    payload,
    { withCredentials: true },
  );
  return response.data;
}

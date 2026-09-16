import { blocksApi, getBlocksUrl, type BlocksServiceResponse } from "./extensions.service";

type PresignedUpload = {
  key: string;
  uploadUrl: string;
  publicUrl: string | null;
  expiresIn: number;
};

export type CloudProject = {
  id_proyecto: string;
  nombre: string;
  placa: string;
  createdAt: string;
  updatedAt: string;
};

export async function uploadJsonToCloud(filename: string, content: string, projectName: string, board: string) {
  const response = await blocksApi.post<BlocksServiceResponse<PresignedUpload>>(
    getBlocksUrl("storage/presign-upload"),
    { filename, contentType: "application/json", folder: "projects", projectName, board },
    { withCredentials: true },
  );
  const upload = response.data.data;
  if (!response.data.ok || !upload) {
    throw new Error(response.data.message || "No se pudo preparar el guardado en la nube.");
  }

  const uploadResponse = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: content,
  });
  if (!uploadResponse.ok) {
    throw new Error(`S3 respondió con HTTP ${uploadResponse.status}.`);
  }

  return upload;
}

export async function getCloudProjects() {
  const response = await blocksApi.get<BlocksServiceResponse<CloudProject[]>>(
    getBlocksUrl("storage/projects"),
    { withCredentials: true },
  );
  return response.data.data ?? [];
}

export async function downloadCloudProject(id: string) {
  const response = await blocksApi.get<BlocksServiceResponse<{ url: string }>>(
    getBlocksUrl(`storage/projects/${id}/download`),
    { withCredentials: true },
  );
  if (!response.data.ok || !response.data.data) throw new Error(response.data.message || "No se pudo abrir el proyecto.");
  const projectResponse = await fetch(response.data.data.url);
  if (!projectResponse.ok) throw new Error(`S3 respondió con HTTP ${projectResponse.status}.`);
  return projectResponse.json();
}

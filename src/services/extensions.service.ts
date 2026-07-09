import axios from "axios";

const BLOCKS_API_URL = (import.meta.env.VITE_BLOCKS_API_URL as string | undefined) ?? "";

function getBlocksUrl(path: string) {
  const baseUrl = BLOCKS_API_URL.endsWith("/") ? BLOCKS_API_URL : `${BLOCKS_API_URL}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${baseUrl}${normalizedPath}`;
}

export type BlocksServiceResponse<T> = {
  ok: boolean;
  message?: string;
  data?: T;
};

export type ExtensionBlockParameter = {
  nombre: string;
  etiqueta?: string;
  orden?: number;
  tipo_dato?: {
    nombre?: string;
  };
  opciones?: Array<{
    etiqueta: string;
    valor: string | number;
    orden?: number;
    activo?: boolean;
  }>;
};

export type ExtensionBlockDefinition = {
  id_bloque: string;
  nombre: string;
  descripcion?: string | null;
  orden?: number;
  extension?: {
    id_extension?: string;
    nombre?: string;
    descripcion?: string | null;
  };
  tipo?: {
    nombre?: string;
    color?: string;
    forma?: {
      nombre?: string;
    };
  };
  parametros?: ExtensionBlockParameter[];
  placas?: Array<{
    nombre?: string;
  }>;
  conexiones?: Array<{
    nombre?: string;
    tipo_conexion?: {
      nombre?: string;
    };
  }>;
};

export async function getExtensionBlocks() {
  const response = await axios.get<BlocksServiceResponse<ExtensionBlockDefinition[]>>(
    getBlocksUrl("blocks"),
    { withCredentials: true }
  );

  return response.data.data ?? [];
}

export type CreateExtensionPayload = {
  nombre: string;
  descripcion?: string;
  version: string;
  id_usuario: string;
  id_estado_extension: string;
};

export async function createExtension(payload: CreateExtensionPayload) {
  const response = await axios.post<BlocksServiceResponse<unknown>>(
    getBlocksUrl("extension"),
    payload,
    { withCredentials: true }
  );

  return response.data;
}

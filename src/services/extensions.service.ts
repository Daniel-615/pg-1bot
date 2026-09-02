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

export type ExtensionStatus = {
  id_estado_extension: string;
  nombre: string;
};

export type Extension = {
  id_extension: string;
  nombre: string;
  descripcion?: string | null;
  version: string;
  id_usuario: string;
  id_estado_extension: string;
  estado?: ExtensionStatus;
  createdAt?: string;
};

export type BlockType = {
  id_tipo_bloque: string;
  nombre: string;
  color?: string;
  id_forma_bloque?: string;
  forma?: { nombre?: string };
};

export type BlockStatus = { id_estado_bloque: string; nombre: string };
export type CatalogItem = { [key: string]: unknown; nombre?: string; descripcion?: string | null };

export type Block = {
  id_bloque: string;
  nombre: string;
  descripcion?: string | null;
  id_tipo_bloque: string;
  id_extension: string;
  id_estado_bloque: string;
  orden: number;
  extension?: Extension;
  tipo?: BlockType;
  estado?: BlockStatus;
  parametros?: ExtensionBlockParameter[];
};

export type Parameter = {
  id_parametro_bloque: string;
  id_bloque: string;
  nombre: string;
  etiqueta: string;
  id_tipo_dato: string;
  requerido: boolean;
  orden: number;
  tipo_dato?: { nombre?: string };
};

export type ParameterOption = {
  id_opcion_parametro: string;
  id_parametro: string;
  etiqueta: string;
  valor: string | number;
  orden: number;
  activo: boolean;
  parametro?: Parameter;
};

async function getResource<T>(path: string) {
  const response = await axios.get<BlocksServiceResponse<T>>(getBlocksUrl(path), { withCredentials: true });
  return response.data.data ?? ([] as T);
}

async function postResource<T>(path: string, payload: unknown) {
  const response = await axios.post<BlocksServiceResponse<T>>(getBlocksUrl(path), payload, { withCredentials: true });
  return response.data;
}

async function putResource<T>(path: string, payload: unknown) {
  const response = await axios.put<BlocksServiceResponse<T>>(getBlocksUrl(path), payload, { withCredentials: true });
  return response.data;
}

export const getBlocks = () => getResource<Block[]>("blocks");
export const getBlockTypes = () => getResource<BlockType[]>("type/block");
export const getBlockStatuses = () => getResource<BlockStatus[]>("status/block");
export const getDataTypes = () => getResource<Array<{ id_tipo_dato: string; nombre: string }>>("type/data");
export const getParameters = () => getResource<Parameter[]>("parameter");
export const getParameterOptions = () => getResource<ParameterOption[]>("option/parameter");
export const getPlates = () => getResource<CatalogItem[]>("../extension/plate");
export const getCategories = () => getResource<CatalogItem[]>("category");
export const getExtensionCategories = () => getResource<CatalogItem[]>("extension/category");
export const getBlockShapes = () => getResource<CatalogItem[]>("shape/block");
export const getConnectionTypes = () => getResource<CatalogItem[]>("type/connection");
export const getBlockConnections = () => getResource<CatalogItem[]>("connection/block");
export const getBlockPlates = () => getResource<CatalogItem[]>("blocks-placa");

export type CreateBlockPayload = Omit<Block, "id_bloque" | "extension" | "tipo" | "estado" | "parametros">;

export const createBlock = (payload: CreateBlockPayload) => postResource<Block>("blocks", payload);
export const updateBlock = ({ id, ...payload }: { id: string; nombre: string; descripcion?: string; orden: number }) =>
  putResource<Block>(`blocks/${id}`, payload);

export type CreateParameterPayload = Omit<Parameter, "id_parametro_bloque" | "tipo_dato">;
export const createParameter = (payload: CreateParameterPayload) => postResource<Parameter>("parameter", payload);
export const updateParameter = ({ id, ...payload }: { id: string } & CreateParameterPayload) =>
  putResource<Parameter>(`parameter/${id}`, payload);

export type CreateOptionPayload = Omit<ParameterOption, "id_opcion_parametro" | "activo" | "parametro">;
export const createParameterOption = (payload: CreateOptionPayload) => postResource<ParameterOption>("option/parameter", payload);
export const updateParameterOption = ({ id, ...payload }: { id: string } & CreateOptionPayload) =>
  putResource<ParameterOption>(`option/parameter/${id}`, payload);

export async function getExtensions() {
  const response = await axios.get<BlocksServiceResponse<Extension[]>>(
    getBlocksUrl("extension"),
    { withCredentials: true }
  );

  return response.data.data ?? [];
}

export async function getExtensionStatuses() {
  const response = await axios.get<BlocksServiceResponse<ExtensionStatus[]>>(
    getBlocksUrl("status/extension"),
    { withCredentials: true }
  );

  return response.data.data ?? [];
}

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

export type UpdateExtensionPayload = {
  id: string;
  nombre: string;
  descripcion?: string;
  version: string;
  id_estado_extension: string;
};

export async function updateExtension({ id, ...payload }: UpdateExtensionPayload) {
  const response = await axios.put<BlocksServiceResponse<Extension>>(
    getBlocksUrl(`extension/${id}`),
    payload,
    { withCredentials: true }
  );

  return response.data;
}

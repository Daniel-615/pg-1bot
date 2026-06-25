export const DEFAULT_WORKSPACE_ID = "default";

const ACTIVE_WORKSPACE_KEY = "1bot.activeWorkspaceId";
const WORKSPACE_LIST_KEY = "1bot.workspaceIds";
const WORKSPACE_PROJECT_PREFIX = "1bot.workspace.";

export type StoredWorkspaceProject = {
  version: "1.0";
  workspaceId: string;
  projectName: string;
  board: string;
  blocks: unknown | null;
  wokwiProjectId?: string;
  updatedAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getProjectKey(workspaceId: string) {
  return `${WORKSPACE_PROJECT_PREFIX}${workspaceId}`;
}

export function normalizeWorkspaceId(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || DEFAULT_WORKSPACE_ID;
}

export function getWorkspaceIdFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(window.location.href);
  const value = url.searchParams.get("workspace") ?? url.searchParams.get("user");

  return value ? normalizeWorkspaceId(value) : null;
}

export function getActiveWorkspaceId() {
  if (!canUseStorage()) {
    return DEFAULT_WORKSPACE_ID;
  }

  return normalizeWorkspaceId(
    window.localStorage.getItem(ACTIVE_WORKSPACE_KEY) ?? DEFAULT_WORKSPACE_ID
  );
}

export function getInitialWorkspaceId() {
  return getWorkspaceIdFromUrl() ?? getActiveWorkspaceId();
}

export function setActiveWorkspaceId(workspaceId: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, normalizeWorkspaceId(workspaceId));
}

export function getWorkspaceIds() {
  const ids = readJson<string[]>(WORKSPACE_LIST_KEY) ?? [];
  const normalizedIds = ids.map(normalizeWorkspaceId);
  const activeId = getActiveWorkspaceId();

  return Array.from(new Set([activeId, DEFAULT_WORKSPACE_ID, ...normalizedIds])).sort();
}

export function loadWorkspaceProject(workspaceId: string) {
  const project = readJson<StoredWorkspaceProject>(
    getProjectKey(normalizeWorkspaceId(workspaceId))
  );

  if (!project || project.version !== "1.0") {
    return null;
  }

  return {
    ...project,
    workspaceId: normalizeWorkspaceId(project.workspaceId),
  };
}

export function createDefaultWorkspaceProject(
  workspaceId: string,
  projectName: string,
  board = "esp32"
): StoredWorkspaceProject {
  return {
    version: "1.0",
    workspaceId: normalizeWorkspaceId(workspaceId),
    projectName,
    board,
    blocks: null,
    updatedAt: new Date().toISOString(),
  };
}

export function saveWorkspaceProject(project: StoredWorkspaceProject) {
  if (!canUseStorage()) {
    return;
  }

  const workspaceId = normalizeWorkspaceId(project.workspaceId);
  const nextProject: StoredWorkspaceProject = {
    ...project,
    workspaceId,
    updatedAt: new Date().toISOString(),
  };
  const workspaceIds = new Set(getWorkspaceIds());

  workspaceIds.add(workspaceId);

  window.localStorage.setItem(getProjectKey(workspaceId), JSON.stringify(nextProject));
  window.localStorage.setItem(WORKSPACE_LIST_KEY, JSON.stringify([...workspaceIds].sort()));
  setActiveWorkspaceId(workspaceId);
}

export function syncWorkspaceIdInUrl(workspaceId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  url.searchParams.set("workspace", normalizeWorkspaceId(workspaceId));
  window.history.replaceState({}, "", url);
}

export type ProjectFileData = {
  version?: string;
  board?: string;
  projectName?: string;
  blocks?: unknown;
};

export function serializeProjectFile(project: ProjectFileData) {
  return JSON.stringify(project, null, 2);
}

export function parseProjectFile(content: string, fallbackName: string): Required<Pick<ProjectFileData, "board" | "projectName" | "blocks">> & { version?: string } {
  let project: ProjectFileData;

  try {
    project = JSON.parse(content) as ProjectFileData;
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }

  if (!project.blocks || typeof project.blocks !== "object") {
    throw new Error("El archivo no contiene bloques Blockly válidos.");
  }

  return {
    ...project,
    board: project.board || "esp32",
    projectName: project.projectName || fallbackName,
    blocks: project.blocks,
  };
}

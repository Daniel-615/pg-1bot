import * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../devices/base/generator/generator";
import { getExtensionBlocks, type ExtensionBlockDefinition, type ExtensionBlockParameter } from "../api/extensions";

const dynamicBlockTypes = new Map<string, ExtensionBlockDefinition>();

function normalizeIdentifier(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getBlockType(block: ExtensionBlockDefinition) {
  return `extension_${normalizeIdentifier(block.id_bloque || block.nombre)}`;
}

function getDataCheck(parameter: ExtensionBlockParameter) {
  const typeName = parameter.tipo_dato?.nombre?.toLowerCase() ?? "";

  if (typeName.includes("bool")) return "Boolean";
  if (typeName.includes("texto") || typeName.includes("string") || typeName.includes("char")) return "String";
  if (typeName.includes("json")) return "String";

  return "Number";
}

function getParameterArg(parameter: ExtensionBlockParameter) {
  const options = [...(parameter.opciones ?? [])]
    .filter((option) => option.activo !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  if (options.length > 0) {
    return {
      type: "field_dropdown",
      name: parameter.nombre,
      options: options.map((option) => [option.etiqueta, String(option.valor)]),
    };
  }

  return {
    type: "input_value",
    name: parameter.nombre,
    check: getDataCheck(parameter),
  };
}

function getBlockShape(block: ExtensionBlockDefinition) {
  const shape = `${block.tipo?.forma?.nombre ?? block.tipo?.nombre ?? ""}`.toLowerCase();
  const connections = (block.conexiones ?? [])
    .map((connection) => `${connection.nombre ?? ""} ${connection.tipo_conexion?.nombre ?? ""}`.toLowerCase())
    .join(" ");

  if (shape.includes("valor") || shape.includes("report") || shape.includes("output") || connections.includes("salida")) {
    return "output";
  }

  return "statement";
}

function boardMatches(block: ExtensionBlockDefinition, board: string) {
  if (!block.placas || block.placas.length === 0) return true;

  const normalizedBoard = normalizeIdentifier(board);

  return block.placas.some((placa) => {
    const name = normalizeIdentifier(placa.nombre ?? "");
    return name.includes(normalizedBoard) || normalizedBoard.includes(name);
  });
}

function defineDynamicBlocks(blocks: ExtensionBlockDefinition[]) {
  const jsonBlocks = blocks.map((block) => {
    const parameters = [...(block.parametros ?? [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const args = parameters.map(getParameterArg);
    const message = [block.nombre, ...parameters.map((parameter, index) => `${parameter.etiqueta ?? parameter.nombre} %${index + 1}`)]
      .join(" ");
    const type = getBlockType(block);
    const shape = getBlockShape(block);

    dynamicBlockTypes.set(type, block);

    return {
      type,
      message0: message,
      args0: args,
      previousStatement: shape === "statement" ? null : undefined,
      nextStatement: shape === "statement" ? null : undefined,
      output: shape === "output" ? "Number" : undefined,
      colour: block.tipo?.color || "#7c3aed",
      tooltip: block.descripcion || "",
      helpUrl: "",
    };
  });

  Blockly.common.defineBlocksWithJsonArray(jsonBlocks);
}

export async function loadDynamicExtensionCategories(board: string): Promise<Blockly.utils.toolbox.ToolboxItemInfo[]> {
  try {
    const blocks = (await getExtensionBlocks()).filter((block) => boardMatches(block, board));

    if (blocks.length === 0) {
      return [];
    }

    defineDynamicBlocks(blocks);

    const groups = new Map<string, ExtensionBlockDefinition[]>();

    for (const block of blocks) {
      const groupName = block.extension?.nombre || "Extensiones";
      groups.set(groupName, [...(groups.get(groupName) ?? []), block]);
    }

    return Array.from(groups.entries()).map(([name, groupBlocks]) => ({
      kind: "category",
      name,
      colour: groupBlocks[0]?.tipo?.color || "#7c3aed",
      contents: groupBlocks
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((block) => ({ kind: "block", type: getBlockType(block) })),
    }));
  } catch (error) {
    console.warn("No se pudieron cargar las extensiones", error);
    return [];
  }
}

export function registerDynamicExtensionGenerators(generator: ArduinoBaseGenerator) {
  for (const [type, block] of dynamicBlockTypes) {
    generator.forBlock[type] = () => `// Extension: ${block.nombre}\n`;
  }
}

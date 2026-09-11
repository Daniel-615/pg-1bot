import * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../../devices/base/generator/generator";
import type { ExtensionBlockDefinition, ExtensionBlockParameter } from "../../services/extensions.service";
import { fetchExtensionBlocks } from "../../hooks/extensions/extensionsHook";

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

function isActive(value?: { nombre?: string }) {
  const status = normalizeIdentifier(value?.nombre ?? "");
  return !status || !status.includes("inactiv") && !status.includes("desactiv") && !status.includes("inactive");
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
      output: shape === "output" ? getDataCheck(parameters[0] ?? { tipo_dato: { nombre: "Number" }, nombre: "value" }) : undefined,
      colour: block.tipo?.color || "#7c3aed",
      tooltip: block.descripcion || "",
      helpUrl: "",
    };
  });

  Blockly.common.defineBlocksWithJsonArray(jsonBlocks);
}

function createCategory(name: string, blocks: ExtensionBlockDefinition[], colour: string): Blockly.utils.toolbox.ToolboxItemInfo {
  return {
    kind: "category",
    name,
    colour,
    contents: blocks
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((block) => ({ kind: "block", type: getBlockType(block) })),
  } as Blockly.utils.toolbox.ToolboxItemInfo;
}

export async function loadDynamicExtensionCategories(board: string, installedExtensionIds: string[] = []): Promise<Blockly.utils.toolbox.ToolboxItemInfo[]> {
  try {
    const blocks = (await fetchExtensionBlocks()).filter((block) =>
      boardMatches(block, board) &&
      isActive(block.estado) &&
      isActive(block.extension?.estado) &&
      installedExtensionIds.includes(block.extension?.id_extension ?? "")
    );

    if (blocks.length === 0) {
      return [];
    }

    defineDynamicBlocks(blocks);

    const groups = new Map<string, ExtensionBlockDefinition[]>();

    for (const block of blocks) {
      const categories = block.extension?.categorias ?? [];
      const groupNames = categories.length > 0
        ? categories.map((category) => category.nombre)
        : [block.extension?.nombre || "Otros"];

      for (const groupName of groupNames) {
        groups.set(groupName, [...(groups.get(groupName) ?? []), block]);
      }
    }

    const categories = Array.from(groups.entries())
      .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
      .map(([name, groupBlocks]) => createCategory(name, groupBlocks, groupBlocks[0]?.tipo?.color || "#7c3aed"));

    return categories;
  } catch (error) {
    console.warn("No se pudieron cargar las extensiones", error);
    return [];
  }
}

function parseLibraries(value: string | undefined) {
  if (!value?.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // The catalog also accepts one include per line or comma-separated values.
  }

  return value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean);
}

function interpolate(template: string, values: Record<string, string>, orderedValues: string[]) {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}|%([a-zA-Z_][\w]*)%|%(\d+)/g, (_match, braces, percent, index) => {
    if (index) return orderedValues[Number(index) - 1] ?? "";
    return values[braces ?? percent] ?? "";
  });
}

export function registerDynamicExtensionGenerators(generator: ArduinoBaseGenerator) {
  for (const [type, block] of dynamicBlockTypes) {
    generator.forBlock[type] = (workspaceBlock: Blockly.Block) => {
      const plate = block.placas?.[0];
      const values: Record<string, string> = {};
      const orderedValues: string[] = [];

      for (const parameter of block.parametros ?? []) {
        values[parameter.nombre] = workspaceBlock.getFieldValue(parameter.nombre) ??
          (generator.valueToCode(workspaceBlock, parameter.nombre, 0) || "");
        orderedValues.push(values[parameter.nombre]);
      }

      for (const library of parseLibraries(plate?.BloquePlaca?.librerias_requeridas)) {
        generator.addInclude(library.startsWith("#include") ? library : `#include ${library}`);
      }

      const setupCode = interpolate(plate?.BloquePlaca?.codigo_setup ?? "", values, orderedValues).trim();
      if (setupCode) generator.addSetupDefinition(setupCode);

      const generatedCode = interpolate(
        plate?.BloquePlaca?.codigo_generado || plate?.BloquePlaca?.codigo_loop || "",
        values,
        orderedValues,
      ).trim();

      const code = generatedCode ? `${generatedCode}\n` : `/* ${block.nombre} */\n`;
      return getBlockShape(block) === "output" ? [code.trim(), 0] : code;
    };
  }
}

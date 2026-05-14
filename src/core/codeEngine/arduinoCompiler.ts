import type * as Blockly from "blockly";
import { BoardFactory } from "../../boards/BoardFactory";
import type { AnalyzerIssueRow } from "../blockEngine/semantic/arduinoSemanticAnalyzer";

export function formatArduinoCode(code: string) {
  const normalized = code.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const compactBlankLines: string[] = [];
  let previousWasBlank = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const isBlank = trimmed.length === 0;
    if (isBlank && previousWasBlank) {
      return;
    }

    compactBlankLines.push(trimmed);
    previousWasBlank = isBlank;
  });

  const formattedLines: string[] = [];
  let indentLevel = 0;

  compactBlankLines.forEach((line) => {
    if (!line) {
      formattedLines.push("");
      return;
    }

    if (line.startsWith("}")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    if (line.startsWith("#")) {
      formattedLines.push(line);
    } else {
      formattedLines.push(`${"    ".repeat(indentLevel)}${line}`);
    }

    const openBraces = (line.match(/\{/g) ?? []).length;
    const closeBraces = (line.match(/\}/g) ?? []).length;
    indentLevel += openBraces - closeBraces;
    if (line.startsWith("}")) {
      indentLevel += 1;
    }
    indentLevel = Math.max(0, indentLevel);
  });

  return formattedLines.join("\n").trim();
}

export interface CompileResult {
  success: boolean;
  code?: string;
  errors?: { message: string; severity: string; blockType: string }[];
}

export async function compileArduino(
  workspace: Blockly.Workspace,
  boardType: string
): Promise<CompileResult> {
  const analyzer = (workspace as any).semanticAnalyzer;
  
  if (analyzer) {
    const issues: AnalyzerIssueRow[] = analyzer.getIssueRows(workspace);
    const criticalErrors = issues.filter((issue: AnalyzerIssueRow) => issue.severity === "error");
    
    if (criticalErrors.length > 0) {
      return {
        success: false,
        errors: criticalErrors.map((e: AnalyzerIssueRow) => ({
          message: e.message,
          severity: e.severity,
          blockType: e.blockType
        }))
      };
    }
  }

  const board = await BoardFactory.create(boardType);
  const generator = board.getGenerator();

  generator.init(workspace);

  const code = generator.workspaceToCode(workspace);
  return {
    success: true,
    code: formatArduinoCode(code)
  };
}

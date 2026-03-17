import type { Board } from "../../boards/Board";
import { CodeyGenerator } from "./generator";

export class CodeyBoard implements Board<CodeyGenerator> {
  type = "codey";

  getGenerator(): CodeyGenerator {
    return new CodeyGenerator();
  }
}
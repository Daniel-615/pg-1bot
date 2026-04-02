import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { getEsp32DisplayCategories } from "./esp32DisplayCategories";
import { getEsp32LightCategories } from "./esp32LightCategories";
import { getEsp32PinCategories } from "./esp32PinCategories";
import { getEsp32SensorCategories } from "./esp32SensorCategories";
import { getEsp32WifiCategories } from "./esp32WifiCategories";

type WorkspaceOptions = {
    onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceEsp32(container:HTMLDivElement, options: WorkspaceOptions = {}){
    return createWorkspace(
        container,
        [
            ...getEsp32PinCategories(),
            ...getEsp32LightCategories(),
            ...getEsp32WifiCategories(),
            ...getEsp32SensorCategories(),
            ...getEsp32DisplayCategories()
        ],
        options
    )
}

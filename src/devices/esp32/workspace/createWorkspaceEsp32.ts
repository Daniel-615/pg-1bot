import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { esp32Categories } from "./esp32Categories";
export function createWorkspaceEsp32(container:HTMLDivElement){
    return createWorkspace(container,esp32Categories)
}
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { unoCategories } from "./unoCategories";
export function createWorkspaceUno(container: HTMLDivElement){
    return createWorkspace(container,unoCategories);
}
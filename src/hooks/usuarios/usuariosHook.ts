import { useQuery } from "@tanstack/react-query";
import { findAllUsuarios, findAllUsuariosActivos } from "../../services/usuario.service";

export type UsuarioFilter = "todos" | "activos" | "inactivos";

export function useUsuarios(filter: UsuarioFilter) {
    const queryFilter = filter === "activos" ? "activos" : "todos";

    return useQuery({
        queryKey: ["usuarios", queryFilter],
        queryFn: () => queryFilter === "activos" ? findAllUsuariosActivos() : findAllUsuarios(),
        staleTime: 1000 * 60 * 5,
    });
}

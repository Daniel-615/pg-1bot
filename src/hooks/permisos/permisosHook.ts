import { useQuery } from "@tanstack/react-query";
import { getPermisos } from "../../services/permiso.service";
export function usePermisos(page = 1, limit = 10) {
    return useQuery({
        queryKey: ["permisos", page, limit],
        queryFn: () => getPermisos(page, limit),
        staleTime: 1000 * 60 * 5,
    })
}
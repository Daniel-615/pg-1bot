import { useQuery } from "@tanstack/react-query";
import { getPermisoById } from "../../services/permiso.service";
export function usePermiso(id: number) {
    return useQuery({
        queryKey: ["permiso", id],
        queryFn: () => getPermisoById(id),
        enabled: !!id,
    });
}
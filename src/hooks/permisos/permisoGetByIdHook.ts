import { useQuery } from "@tanstack/react-query";
import { getPermisoById } from "../../services/permiso.service";

export function usePermiso(id: number | string | null) {
    return useQuery({
        queryKey: ["permiso", id],
        queryFn: () => getPermisoById(id as number | string),
        enabled: Boolean(id),
    });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createRolPermiso,
    deleteRolPermiso,
    getRolPermisoById,
    getRolPermisos,
    getPermisosNoAsignados,
} from "../../services/rol.permiso.service";

export function useRolPermisos(page = 1, limit = 10) {
    return useQuery({
        queryKey: ["rolPermisos", page, limit],
        queryFn: () => getRolPermisos(page, limit),
        staleTime: 1000 * 60 * 5,
    });
}

export function useRolPermiso(rolId: number | string | null, permisoId: number | string | null) {
    return useQuery({
        queryKey: ["rolPermiso", rolId, permisoId],
        queryFn: () => getRolPermisoById(rolId as number | string, permisoId as number | string),
        enabled: Boolean(rolId) && Boolean(permisoId),
        staleTime: 1000 * 60 * 5,
    });
}

export function usePermisosNoAsignados(rolId: number | string | null) {
    return useQuery({
        queryKey: ["permisosNoAsignados", rolId],
        queryFn: () => getPermisosNoAsignados(rolId as number | string),
        enabled: Boolean(rolId),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateRolPermiso() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRolPermiso,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rolPermisos"] });
            queryClient.invalidateQueries({ queryKey: ["permisosNoAsignados"] });
        },
    });
}

export function useDeleteRolPermiso() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ rolId, permisoId }: { rolId: number | string; permisoId: number | string }) => deleteRolPermiso(rolId, permisoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rolPermisos"] });
            queryClient.invalidateQueries({ queryKey: ["permisosNoAsignados"] });
        },
    });
}

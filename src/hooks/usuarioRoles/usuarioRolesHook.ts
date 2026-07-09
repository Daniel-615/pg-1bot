import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createUsuarioRol,
    deleteUsuarioRol,
    getUsuarioRolById,
    getUsuarioRoles,
} from "../../services/usuario.rol.sevice";

export function useUsuarioRoles(page = 1, limit = 10) {
    return useQuery({
        queryKey: ["usuarioRoles", page, limit],
        queryFn: () => getUsuarioRoles(page, limit),
        staleTime: 1000 * 60 * 5,
    });
}

export function useUsuarioRol(usuarioId: string | null, rolId: number | string | null) {
    return useQuery({
        queryKey: ["usuarioRol", usuarioId, rolId],
        queryFn: () => getUsuarioRolById(usuarioId as string, rolId as number | string),
        enabled: Boolean(usuarioId) && Boolean(rolId),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateUsuarioRol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUsuarioRol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarioRoles"] });
        },
    });
}

export function useDeleteUsuarioRol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ usuarioId, rolId }: { usuarioId: string; rolId: number | string }) => deleteUsuarioRol(usuarioId, rolId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarioRoles"] });
        },
    });
}

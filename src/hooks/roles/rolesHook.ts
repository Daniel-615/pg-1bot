import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRol, deleteRol, getRolById, getRoles, updateRol, type Rol } from "../../services/rol.service";

export function useRoles(page = 1, limit = 10) {
    return useQuery({
        queryKey: ["roles", page, limit],
        queryFn: () => getRoles(page, limit),
        staleTime: 1000 * 60 * 5,
    });
}

export function useRol(id: number | string | null) {
    return useQuery({
        queryKey: ["rol", id],
        queryFn: () => getRolById(id as number | string),
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateRol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

export function useUpdateRol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: Pick<Rol, "nombre"> }) => updateRol(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            queryClient.invalidateQueries({ queryKey: ["rol", variables.id] });
        },
    });
}

export function useDeleteRol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteRol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

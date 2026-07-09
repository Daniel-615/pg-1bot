import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePermiso } from "../../services/permiso.service";
export function useUpdatePermiso() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data
        }: {
            id: number | string;
            data: { nombre: string };
        }) => updatePermiso(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["permisos"],
            });
            queryClient.invalidateQueries({
                queryKey: ["permiso", variables.id],
            });
        },
    });
}

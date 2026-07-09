import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePermiso } from "../../services/permiso.service";
export function useDeletePermiso() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePermiso,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["permisos"],
            });
        },
    });
}
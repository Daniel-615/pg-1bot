import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPermiso } from "../../services/permiso.service";
export function useCreatePermiso() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPermiso,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["permisos"],

            });
        },
    });
}
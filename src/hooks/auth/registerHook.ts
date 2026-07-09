import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerRequest } from "../../services/auth.service";

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: registerRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    })
}

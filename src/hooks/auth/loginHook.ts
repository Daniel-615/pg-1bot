import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginRequest } from "../../services/auth.service";

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: LoginRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    })
}

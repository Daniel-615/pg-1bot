import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Logout } from "../../services/auth.service";
export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: Logout,
        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: ["auth"],
            });
        },
    });
}
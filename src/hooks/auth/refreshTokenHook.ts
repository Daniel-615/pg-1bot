import { useMutation } from "@tanstack/react-query";
import { refreshTokenRequest } from "../../services/auth.service";
export function useRefreshToken() {
    return useMutation({
        mutationFn: refreshTokenRequest,
    });
}

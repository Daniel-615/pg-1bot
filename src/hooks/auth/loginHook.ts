import { useMutation } from "@tanstack/react-query";
import { LoginRequest } from "../../services/auth.service";
export function useLogin() {
    return useMutation({
        mutationFn: LoginRequest,
    })
}

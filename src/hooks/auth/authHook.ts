import { useQuery } from "@tanstack/react-query";
import { verifySessionRequest } from "../../services/auth.service";
export function useAuth() {
    return useQuery({
        queryKey: ["auth", "session"],
        queryFn: async () => {
            const response = await verifySessionRequest();
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data;
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
}

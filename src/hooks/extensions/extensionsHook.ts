import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExtension, getExtensionBlocks } from "../../services/extensions.service";
import { queryClient } from "../../lib/queryClient";

const extensionBlocksQueryKey = ["extensionBlocks"] as const;

export function fetchExtensionBlocks() {
    return queryClient.fetchQuery({
        queryKey: extensionBlocksQueryKey,
        queryFn: getExtensionBlocks,
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateExtension() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createExtension,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: extensionBlocksQueryKey });
        },
    });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBlock, createExtension, createParameter, createParameterOption, getBlockConnections, getBlockPlates, getBlockShapes, getBlockStatuses, getBlockTypes, getBlocks, getCategories, getConnectionTypes, getDataTypes, getExtensionBlocks, getExtensionCategories, getExtensions, getExtensionStatuses, getParameterOptions, getParameters, getPlates, updateBlock, updateExtension, updateParameter, updateParameterOption } from "../../services/extensions.service";
import { queryClient } from "../../lib/queryClient";

const extensionBlocksQueryKey = ["extensionBlocks"] as const;
const extensionsQueryKey = ["extensions"] as const;

export function useExtensionAdminData() {
    const extensions = useQuery({ queryKey: extensionsQueryKey, queryFn: getExtensions, staleTime: 1000 * 60 * 5 });
    const extensionBlocks = useQuery({ queryKey: extensionBlocksQueryKey, queryFn: getExtensionBlocks, staleTime: 1000 * 60 * 5 });
    const extensionStatuses = useQuery({ queryKey: ["extensionStatuses"], queryFn: getExtensionStatuses, staleTime: 1000 * 60 * 30 });
    const blocks = useQuery({ queryKey: ["blocks"], queryFn: getBlocks, staleTime: 1000 * 60 * 5 });
    const blockTypes = useQuery({ queryKey: ["blockTypes"], queryFn: getBlockTypes, staleTime: 1000 * 60 * 30 });
    const blockStatuses = useQuery({ queryKey: ["blockStatuses"], queryFn: getBlockStatuses, staleTime: 1000 * 60 * 30 });
    const dataTypes = useQuery({ queryKey: ["dataTypes"], queryFn: getDataTypes, staleTime: 1000 * 60 * 30 });
    const parameters = useQuery({ queryKey: ["parameters"], queryFn: getParameters, staleTime: 1000 * 60 * 5 });
    const options = useQuery({ queryKey: ["parameterOptions"], queryFn: getParameterOptions, staleTime: 1000 * 60 * 5 });
    const plates = useQuery({ queryKey: ["plates"], queryFn: getPlates, staleTime: 1000 * 60 * 30 });
    const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime: 1000 * 60 * 30 });
    const extensionCategories = useQuery({ queryKey: ["extensionCategories"], queryFn: getExtensionCategories, staleTime: 1000 * 60 * 30 });
    const blockShapes = useQuery({ queryKey: ["blockShapes"], queryFn: getBlockShapes, staleTime: 1000 * 60 * 30 });
    const connectionTypes = useQuery({ queryKey: ["connectionTypes"], queryFn: getConnectionTypes, staleTime: 1000 * 60 * 30 });
    const blockConnections = useQuery({ queryKey: ["blockConnections"], queryFn: getBlockConnections, staleTime: 1000 * 60 * 5 });
    const blockPlates = useQuery({ queryKey: ["blockPlates"], queryFn: getBlockPlates, staleTime: 1000 * 60 * 5 });
    return { extensions, extensionBlocks, extensionStatuses, blocks, blockTypes, blockStatuses, dataTypes, parameters, options, plates, categories, extensionCategories, blockShapes, connectionTypes, blockConnections, blockPlates };
}

export function useExtensions() {
    return useQuery({
        queryKey: extensionsQueryKey,
        queryFn: getExtensions,
        staleTime: 1000 * 60 * 5,
    });
}

export function useExtensionStatuses() {
    return useQuery({
        queryKey: ["extensionStatuses"],
        queryFn: getExtensionStatuses,
        staleTime: 1000 * 60 * 30,
    });
}

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
            queryClient.invalidateQueries({ queryKey: extensionsQueryKey });
        },
    });
}

export function useUpdateExtension() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateExtension,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: extensionsQueryKey });
            queryClient.invalidateQueries({ queryKey: extensionBlocksQueryKey });
        },
    });
}

function useAdminMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>, keys: readonly (readonly string[])[]) {
    const client = useQueryClient();
    return useMutation({ mutationFn, onSuccess: () => keys.forEach((queryKey) => client.invalidateQueries({ queryKey })) });
}

export const useCreateBlock = () => useAdminMutation(createBlock, [["blocks"], extensionBlocksQueryKey]);
export const useUpdateBlock = () => useAdminMutation(updateBlock, [["blocks"], extensionBlocksQueryKey]);
export const useCreateParameter = () => useAdminMutation(createParameter, [["parameters"], ["blocks"], extensionBlocksQueryKey]);
export const useUpdateParameter = () => useAdminMutation(updateParameter, [["parameters"], ["blocks"], extensionBlocksQueryKey]);
export const useCreateParameterOption = () => useAdminMutation(createParameterOption, [["parameterOptions"], ["parameters"], ["blocks"], extensionBlocksQueryKey]);
export const useUpdateParameterOption = () => useAdminMutation(updateParameterOption, [["parameterOptions"], ["parameters"], ["blocks"], extensionBlocksQueryKey]);

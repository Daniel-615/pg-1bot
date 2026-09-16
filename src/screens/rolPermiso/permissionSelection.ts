export function togglePermissionSelection(selectedIds: number[], permissionId: number) {
    return selectedIds.includes(permissionId)
        ? selectedIds.filter((id) => id !== permissionId)
        : [...selectedIds, permissionId];
}

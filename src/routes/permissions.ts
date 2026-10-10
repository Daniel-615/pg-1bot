import type { AuthUser } from "../services/auth.service";

export function hasRequiredPermissions(user: AuthUser | null, requiredPermissions: string[]) {
  const roles = [
    ...(Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : []),
    ...(user?.roles ?? []).map((role) => role.nombre),
  ].map((role) => role.trim().toLowerCase().replace(/\s+/g, ""));
  if (roles.some((role) => role === "admin" || role === "1botpersonal")) return true;

  const permissions = new Set(user?.permisos ?? []);
  return requiredPermissions.every((permission) => permissions.has(permission));
}

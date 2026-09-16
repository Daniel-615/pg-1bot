import { describe, expect, it } from "vitest";
import { togglePermissionSelection } from "../src/screens/rolPermiso/permissionSelection";

describe("togglePermissionSelection", () => {
  it("agrega un permiso nuevo sin modificar los anteriores", () => {
    expect(togglePermissionSelection([2, 4], 7)).toEqual([2, 4, 7]);
  });

  it("quita un permiso ya seleccionado", () => {
    expect(togglePermissionSelection([2, 4, 7], 4)).toEqual([2, 7]);
  });

  it("no duplica permisos al seleccionarlos nuevamente", () => {
    expect(togglePermissionSelection([2, 4], 2)).toEqual([4]);
  });
});

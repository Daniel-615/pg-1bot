import type { CodeyGenerator } from "../generator";

function ensureRockyImport(generator: CodeyGenerator) {
  generator.addInclude("import rocky");
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const safeHex = normalized.length === 6 ? normalized : "ff0000";
  return {
    red: Number.parseInt(safeHex.slice(0, 2), 16),
    green: Number.parseInt(safeHex.slice(2, 4), 16),
    blue: Number.parseInt(safeHex.slice(4, 6), 16),
  };
}

export function registerCodeyLightingGenerators(generator: CodeyGenerator) {
  generator.forBlock["codey_led_rgb_for"] = (block) => {
    const color = block.getFieldValue("COLOR") || "#ff0000";
    const seconds = Number(block.getFieldValue("SECONDS") || 1);
    const { red, green, blue } = hexToRgb(color);
    return `codey.led.show(${red}, ${green}, ${blue})\ntime.sleep(${seconds})\ncodey.led.off()\n`;
  };

  generator.forBlock["codey_led_rgb"] = (block) => {
    const color = block.getFieldValue("COLOR") || "#ff0000";
    const { red, green, blue } = hexToRgb(color);
    return `codey.led.show(${red}, ${green}, ${blue})\n`;
  };

  generator.forBlock["codey_led_component"] = (block) => {
    const component = block.getFieldValue("COMPONENT") || "red";
    const value = Number(block.getFieldValue("VALUE") || 255);
    return `codey.led.set_${component}(${value})\n`;
  };

  generator.forBlock["codey_led_off"] = () => {
    return "codey.led.off()\n";
  };

  generator.forBlock["rocky_light_color"] = (block) => {
    ensureRockyImport(generator);
    const color = (block.getFieldValue("COLOR") || "red").toLowerCase();
    return `rocky.color_ir_sensor.set_led_color(${JSON.stringify(color)})\n`;
  };

  generator.forBlock["rocky_light_off"] = () => {
    ensureRockyImport(generator);
    return 'rocky.color_ir_sensor.set_led_color("black")\n';
  };
}

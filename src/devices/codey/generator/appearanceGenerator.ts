import type { CodeyGenerator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerCodeyAppearanceGenerators(generator: CodeyGenerator) {
  generator.forBlock["codey_show_image"] = (block) => {
    const image = block.getFieldValue("IMAGE") || "0066660000000000";
    return `codey.display.show_image(${JSON.stringify(image)})\n`;
  };

  generator.forBlock["codey_show_image_at"] = (block) => {
    const image = block.getFieldValue("IMAGE") || "0066660000000000";
    const x = Number(block.getFieldValue("X") || 0);
    const y = Number(block.getFieldValue("Y") || 0);
    return `codey.display.show_image(${JSON.stringify(image)}, ${x}, ${y})\n`;
  };

  generator.forBlock["codey_clear_display"] = () => {
    return "codey.display.clear()\n";
  };

  generator.forBlock["codey_show_text"] = (block) => {
    const text = JSON.stringify(block.getFieldValue("TEXT") || "hello");
    return `codey.display.show(${text}, 0, 0, False)\n`;
  };

  generator.forBlock["codey_show_text_until_done"] = (block) => {
    const text = JSON.stringify(block.getFieldValue("TEXT") || "hello");
    return `codey.display.show(${text}, 0, 0, True)\n`;
  };

  generator.forBlock["codey_show_text_at"] = (block) => {
    const text = JSON.stringify(block.getFieldValue("TEXT") || "hello");
    const x = Number(block.getFieldValue("X") || 0);
    const y = Number(block.getFieldValue("Y") || 0);
    return `codey.display.show(${text}, ${x}, ${y}, False)\n`;
  };

  generator.forBlock["codey_set_pixel_on"] = (block) => {
    const x = Number(block.getFieldValue("X") || 0);
    const y = Number(block.getFieldValue("Y") || 0);
    return `codey.display.set_pixel(${x}, ${y}, True)\n`;
  };

  generator.forBlock["codey_set_pixel_off"] = (block) => {
    const x = Number(block.getFieldValue("X") || 0);
    const y = Number(block.getFieldValue("Y") || 0);
    return `codey.display.set_pixel(${x}, ${y}, False)\n`;
  };

  generator.forBlock["codey_toggle_pixel"] = (block) => {
    const x = Number(block.getFieldValue("X") || 0);
    const y = Number(block.getFieldValue("Y") || 0);
    return `codey.display.toggle_pixel(${x}, ${y})\n`;
  };

  generator.forBlock["codey_get_pixel"] = (block) => {
    const x = Number(block.getFieldValue("X") || 0);
    const y = Number(block.getFieldValue("Y") || 0);
    return [`codey.display.get_pixel(${x}, ${y})`, ORDER_ATOMIC];
  };
}

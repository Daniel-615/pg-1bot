import * as Blockly from "blockly";
import { ESP32Generator } from "../generator";

const ORDER_ATOMIC = 0;
const STRIP_INSTANCE = "_1botEsp32Strip";

function hexToCppColor(hex: string) {
  const normalized = hex.trim().replace("#", "").toUpperCase();

  if (!/^[0-9A-F]{6}$/.test(normalized)) {
    return "0xFF00FF";
  }

  return `0x${normalized}`;
}

function ensureStrip(generator: ESP32Generator, pin: string, count: string) {
  generator.addInclude("#include <Adafruit_NeoPixel.h>");
  generator.addGlobalDefinition(
    `Adafruit_NeoPixel ${STRIP_INSTANCE}(${count}, ${pin}, NEO_GRB + NEO_KHZ800);`,
    "esp32_neopixel_instance"
  );
  generator.addSetupDefinition(`
    ${STRIP_INSTANCE}.begin();
    ${STRIP_INSTANCE}.show();
  `, "esp32_neopixel_setup");
}

export function registerESP32LightGenerator(generator: ESP32Generator) {
  generator.forBlock["esp32_neopixel_init"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "4";
    const count = block.getFieldValue("COUNT") || "5";

    ensureStrip(generator, pin, count);
    return "";
  };

  generator.forBlock["esp32_neopixel_color"] = (block: Blockly.Block) => {
    const color = block.getFieldValue("COLOR") || "#FF00FF";
    return [hexToCppColor(color), ORDER_ATOMIC];
  };

  generator.forBlock["esp32_neopixel_set_color"] = (block: Blockly.Block) => {
    const index = block.getFieldValue("INDEX") || "1";
    const fieldColor = block.getFieldValue("COLOR");
    const color = fieldColor
      ? hexToCppColor(fieldColor)
      : generator.valueToCode(block, "COLOR", ORDER_ATOMIC) || "0x000000";

    generator.addInclude("#include <Adafruit_NeoPixel.h>");
    return `${STRIP_INSTANCE}.setPixelColor((${index}) - 1, ${color});\n${STRIP_INSTANCE}.show();\n`;
  };

  generator.forBlock["esp32_neopixel_set_rgb"] = (block: Blockly.Block) => {
    const index = block.getFieldValue("INDEX") || "1";
    const red = block.getFieldValue("RED") || "125";
    const green = block.getFieldValue("GREEN") || "0";
    const blue = block.getFieldValue("BLUE") || "125";

    generator.addInclude("#include <Adafruit_NeoPixel.h>");
    return `${STRIP_INSTANCE}.setPixelColor((${index}) - 1, ${STRIP_INSTANCE}.Color(${red}, ${green}, ${blue}));\n${STRIP_INSTANCE}.show();\n`;
  };

  generator.forBlock["esp32_neopixel_clear"] = () => {
    generator.addInclude("#include <Adafruit_NeoPixel.h>");
    return `${STRIP_INSTANCE}.clear();\n${STRIP_INSTANCE}.show();\n`;
  };
}

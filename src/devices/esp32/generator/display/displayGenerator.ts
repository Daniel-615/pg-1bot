import * as Blockly from "blockly";
import { ESP32Generator } from "../generator";

const DISPLAY_INSTANCE = "_1botEsp32Display";

function ensureDisplay(generator: ESP32Generator, sda: string, scl: string) {
  generator.addInclude("#include <Wire.h>");
  generator.addInclude("#include <LiquidCrystal_I2C.h>");
  generator.addGlobalDefinition(
    `LiquidCrystal_I2C ${DISPLAY_INSTANCE}(0x27, 16, 2);`,
    "esp32_display_instance"
  );
  generator.addSetupDefinition(`
    Wire.begin(${sda}, ${scl});
    ${DISPLAY_INSTANCE}.init();
    ${DISPLAY_INSTANCE}.backlight();
  `, "esp32_display_setup");
}

export function registerESP32DisplayGenerator(generator: ESP32Generator) {
  generator.forBlock["esp32_display_init"] = (block: Blockly.Block) => {
    const scl = block.getFieldValue("SCL") || "22";
    const sda = block.getFieldValue("SDA") || "21";

    ensureDisplay(generator, sda, scl);
    return "";
  };

  generator.forBlock["esp32_display_print"] = (block: Blockly.Block) => {
    const x = block.getFieldValue("X") || "1";
    const y = block.getFieldValue("Y") || "1";
    const text = generator.valueToCode(block, "TEXT", 0) || "\"\"";

    generator.addInclude("#include <Wire.h>");
    generator.addInclude("#include <LiquidCrystal_I2C.h>");
    return `${DISPLAY_INSTANCE}.setCursor(${x}, ${y});\n${DISPLAY_INSTANCE}.print(${text});\n`;
  };

  generator.forBlock["esp32_display_clear"] = () => {
    generator.addInclude("#include <Wire.h>");
    generator.addInclude("#include <LiquidCrystal_I2C.h>");
    return `${DISPLAY_INSTANCE}.clear();\n`;
  };
}

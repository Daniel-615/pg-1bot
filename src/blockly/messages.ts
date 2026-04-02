import * as Blockly from "blockly";
import * as BlocklyEn from "blockly/msg/en";
import * as BlocklyEs from "blockly/msg/es";
import i18n, { type Language } from "../i18n";

function normalizeBlocklyLocale(messages: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(messages).filter(([, value]) => typeof value === "string")
  ) as Record<string, string>;
}

const normalizedBlocklyEn = normalizeBlocklyLocale(BlocklyEn);
const normalizedBlocklyEs = normalizeBlocklyLocale(BlocklyEs);

const BLOCKLY_KEYS = [
  "1BOT_CAT_VARIABLES",
  "1BOT_CAT_HARDWARE",
  "1BOT_CAT_TYPES",
  "1BOT_CAT_CONTROL",
  "1BOT_CAT_OPERATORS",
  "1BOT_CAT_ESP32_PINS",
  "1BOT_CAT_ESP32_LIGHTS",
  "1BOT_CAT_WIFI",
  "1BOT_CAT_ESP32_SENSORS",
  "1BOT_CAT_DISPLAY",
  "1BOT_CAT_UNO_SENSOR",
  "1BOT_LED_ON",
  "1BOT_LED_OFF",
  "1BOT_BLOCK_LED_SET",
  "1BOT_BLOCK_PROGRAM_START",
  "1BOT_BLOCK_PRINT",
  "1BOT_BLOCK_STRING_TOOLTIP",
  "1BOT_BLOCK_LIST_GET_INDEX",
  "1BOT_BLOCK_LIST_SET_INDEX",
  "1BOT_LIST_FIRST",
  "1BOT_LIST_LAST",
  "1BOT_LIST_INDEX",
  "1BOT_CONTROL_IF",
  "1BOT_CONTROL_IF_THEN",
  "1BOT_CONTROL_ELSE",
  "1BOT_CONTROL_DO",
  "1BOT_CONTROL_WHILE",
  "1BOT_CONTROL_WHILE_REPEAT",
  "1BOT_CONTROL_REPEAT_UNTIL",
  "1BOT_CONTROL_FOR_RANGE",
  "1BOT_CONTROL_BREAK",
  "1BOT_CONTROL_CONTINUE",
  "1BOT_CONTROL_DELAY",
  "1BOT_LOGIC_AND",
  "1BOT_LOGIC_OR",
  "1BOT_LOGIC_NOT",
  "1BOT_MATH_RANDOM",
  "1BOT_ESP32_DISPLAY_INIT",
  "1BOT_ESP32_DISPLAY_PRINT",
  "1BOT_ESP32_DISPLAY_CLEAR",
  "1BOT_ESP32_WIFI_CONNECT",
  "1BOT_ESP32_WIFI_DISCONNECT",
  "1BOT_ESP32_WIFI_SCAN",
  "1BOT_ESP32_WIFI_AP",
  "1BOT_ESP32_WIFI_IS_CONNECTED",
  "1BOT_ESP32_WIFI_RSSI",
  "1BOT_ESP32_WIFI_LOCAL_IP",
  "1BOT_ESP32_WIFI_START_WEB",
  "1BOT_ESP32_WIFI_WEB_FILE",
  "1BOT_ESP32_WIFI_WEB_EQUALS",
  "1BOT_ESP32_PIN_DIGITAL_WRITE",
  "1BOT_ESP32_PIN_DIGITAL_READ",
  "1BOT_ESP32_PIN_ANALOG_READ",
  "1BOT_ESP32_PIN_PWM_WRITE",
  "1BOT_ESP32_LIGHT_INIT",
  "1BOT_ESP32_LIGHT_COLOR",
  "1BOT_ESP32_LIGHT_SET_COLOR",
  "1BOT_ESP32_LIGHT_SET_RGB",
  "1BOT_ESP32_LIGHT_CLEAR",
  "1BOT_ESP32_SENSOR_TOUCH",
  "1BOT_ESP32_SENSOR_ULTRASONIC",
] as const;

export function applyBlocklyLocale(language: Language = (i18n.language === "en" ? "en" : "es")) {
  Blockly.setLocale(language === "en" ? normalizedBlocklyEn : normalizedBlocklyEs);

  for (const key of BLOCKLY_KEYS) {
    Blockly.Msg[key] = i18n.t(key, { lng: language });
  }
}

export function blocklyText(key: string) {
  return i18n.t(key);
}

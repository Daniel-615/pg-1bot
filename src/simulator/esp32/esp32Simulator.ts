import type { SimulationBlock } from "../../app/types";
import type {
  BoardSimulator,
  SimulatedBuzzer,
  SimulatedDht,
  SimulatedDisplay,
  SimulatedNeoPixel,
  SimulatedPin,
  SimulatedServo,
  SimulatedUltrasonic,
  SimulatedWifi,
  SimulationCapabilities,
  SimulationEvent,
  SimulationResult,
  SimulatorInputs,
} from "../types";

type MutableEsp32State = {
  pins: Map<number, SimulatedPin>;
  neopixel: SimulatedNeoPixel | null;
  dht: SimulatedDht | null;
  ultrasonic: SimulatedUltrasonic | null;
  servo: SimulatedServo | null;
  buzzer: SimulatedBuzzer | null;
  display: SimulatedDisplay | null;
  wifi: SimulatedWifi | null;
  capabilities: SimulationCapabilities;
  events: SimulationEvent[];
  unsupportedBlocks: Set<string>;
};

const DEFAULT_NEOPIXEL_COLOR = "#000000";
const DEFAULT_WIFI_RESPONSE = "Respuesta simulada";

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeColor(value: string) {
  const normalized = value.trim().replace(/^0x/i, "#").toUpperCase();

  if (/^#[0-9A-F]{6}$/.test(normalized)) {
    return normalized;
  }

  return DEFAULT_NEOPIXEL_COLOR;
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function getPin(state: MutableEsp32State, pin: number) {
  const existing = state.pins.get(pin);

  if (existing) {
    return existing;
  }

  const created: SimulatedPin = { pin };
  state.pins.set(pin, created);
  return created;
}

function mark(state: MutableEsp32State, capability: keyof SimulationCapabilities) {
  state.capabilities[capability] = true;
}

function setPinMode(state: MutableEsp32State, pin: number, mode: string) {
  getPin(state, pin).mode = mode;
}

function evaluateExpression(
  block: SimulationBlock | null,
  state: MutableEsp32State,
  inputs: SimulatorInputs
): number | string | boolean {
  if (!block) {
    return 0;
  }

  switch (block.type) {
    case "number":
    case "math_number":
      return toNumber(block.fields.NUM, 0);

    case "logic_boolean":
      return block.fields.BOOL === "TRUE";

    case "string":
      return block.fields.STRING ?? "";

    case "wifi_scan_networks":
      mark(state, "wifi");
      ensureWifi(state);
      return state.wifi?.scannedNetworks.join(", ") ?? "";

    case "wifi_is_connected":
      mark(state, "wifi");
      return Boolean(state.wifi?.connected);

    case "wifi_get_rssi":
      mark(state, "wifi");
      ensureWifi(state);
      return state.wifi?.rssi ?? -55;

    case "wifi_local_ip":
      mark(state, "wifi");
      ensureWifi(state);
      return state.wifi?.ipAddress ?? "192.168.1.42";

    case "wifi_web_file_name":
      mark(state, "wifi");
      ensureWifi(state);
      return state.wifi?.webServer?.lastPath ?? "None";

    case "wifi_web_response_equals": {
      mark(state, "wifi");
      const expected = String(evaluateExpression(block.inputs.VALUE, state, inputs));
      return (state.wifi?.webServer?.lastPath ?? "None") === expected;
    }

    case "wifi_http_get_text": {
      mark(state, "wifi");
      const url = String(evaluateExpression(block.inputs.URL, state, inputs));
      ensureWifi(state);
      if (state.wifi) {
        state.wifi.lastHttpRequest = {
          method: "GET",
          url,
          response: DEFAULT_WIFI_RESPONSE,
        };
      }
      return DEFAULT_WIFI_RESPONSE;
    }

    case "wifi_http_post_text": {
      mark(state, "wifi");
      const url = String(evaluateExpression(block.inputs.URL, state, inputs));
      ensureWifi(state);
      if (state.wifi) {
        state.wifi.lastHttpRequest = {
          method: "POST",
          url,
          response: DEFAULT_WIFI_RESPONSE,
        };
      }
      return DEFAULT_WIFI_RESPONSE;
    }

    case "esp32_neopixel_color":
      return normalizeColor(block.fields.COLOR ?? DEFAULT_NEOPIXEL_COLOR);

    case "esp32_dht_temperature":
      return inputs.temperatureC;

    case "esp32_dht_humidity":
      return inputs.humidityPercent;

    case "esp32_ultrasonic_distance": {
      const trigPin = toNumber(block.fields.TRIG, 2);
      const echoPin = toNumber(block.fields.ECHO, 5);
      state.ultrasonic = {
        trigPin,
        echoPin,
        distanceCm: inputs.ultrasonicDistanceCm,
      };
      mark(state, "ultrasonic");
      setPinMode(state, trigPin, "OUTPUT");
      setPinMode(state, echoPin, "INPUT");
      return inputs.ultrasonicDistanceCm;
    }

    case "esp32_touch_read":
      mark(state, "touch");
      getPin(state, toNumber(block.fields.PIN, 13)).analog = inputs.touchValue;
      return inputs.touchValue;

    case "esp32_analog_read":
      mark(state, "analogRead");
      getPin(state, toNumber(block.fields.PIN, 32)).analog = inputs.analogReadValue;
      return inputs.analogReadValue;

    case "esp32_digital_read":
      mark(state, "digitalRead");
      getPin(state, toNumber(block.fields.PIN, 0)).digital = inputs.digitalReadValue;
      return inputs.digitalReadValue;

    default:
      state.unsupportedBlocks.add(block.type);
      return 0;
  }
}

function createDefaultWifi(): SimulatedWifi {
  return {
    mode: "off",
    connected: false,
    ipAddress: "192.168.1.42",
    rssi: -55,
    scannedNetworks: ["1BOT Lab", "Aula STEM", "ESP32_AP"],
  };
}

function ensureWifi(state: MutableEsp32State) {
  if (!state.wifi) {
    state.wifi = createDefaultWifi();
  }
}

function writeDisplayText(display: SimulatedDisplay, x: number, y: number, text: string) {
  const row = clamp(y, 0, display.rows - 1);
  const column = clamp(x, 0, display.columns - 1);
  const currentLine = display.lines[row].padEnd(display.columns, " ");
  const nextLine = `${currentLine.slice(0, column)}${text}${currentLine.slice(column + text.length)}`;
  display.lines[row] = nextLine.slice(0, display.columns);
}

function runStatement(
  block: SimulationBlock | null,
  state: MutableEsp32State,
  inputs: SimulatorInputs
) {
  let current = block;

  while (current) {
    switch (current.type) {
      case "program_start":
        runStatement(current.inputs.DO, state, inputs);
        break;

      case "delay_ms":
        state.events.push({
          label: "Pausa",
          detail: `${toNumber(current.fields.TIME, 0)} ms`,
        });
        break;

      case "print": {
        const value = evaluateExpression(current.inputs.TEXT, state, inputs);
        state.events.push({ label: "Serial", detail: String(value) });
        break;
      }

      case "if": {
        const condition = Boolean(evaluateExpression(current.inputs.CONDITION, state, inputs));
        if (condition) {
          runStatement(current.inputs.IF_BODY, state, inputs);
        }
        break;
      }

      case "if_else": {
        const condition = Boolean(evaluateExpression(current.inputs.CONDITION, state, inputs));
        runStatement(condition ? current.inputs.IF_BODY : current.inputs.ELSE_BODY, state, inputs);
        break;
      }

      case "led_set":
      case "esp32_digital_write": {
        const pin = toNumber(current.fields.PIN, 2);
        const value = current.fields.STATE === "LOW" ? 0 : 1;
        const pinState = getPin(state, pin);
        mark(state, "pins");
        pinState.mode = pinState.mode ?? "OUTPUT";
        pinState.digital = value;
        break;
      }

      case "esp32_pin_mode":
        mark(state, "pins");
        setPinMode(state, toNumber(current.fields.PIN, 2), current.fields.MODE ?? "OUTPUT");
        break;

      case "esp32_pwm_write": {
        const pin = getPin(state, toNumber(current.fields.PIN, 22));
        mark(state, "pins");
        pin.mode = pin.mode ?? "OUTPUT";
        pin.pwmFrequency = toNumber(current.fields.FREQUENCY, 1000);
        pin.pwmDuty = clamp(toNumber(current.fields.DUTY, 128), 0, 255);
        break;
      }

      case "esp32_analog_write": {
        const pin = getPin(state, toNumber(current.fields.PIN, 22));
        mark(state, "pins");
        pin.mode = pin.mode ?? "OUTPUT";
        pin.analog = clamp(toNumber(current.fields.VALUE, 128), 0, 255);
        break;
      }

      case "esp32_neopixel_init": {
        const pin = toNumber(current.fields.PIN, 4);
        const count = Math.max(1, toNumber(current.fields.COUNT, 5));
        state.neopixel = {
          pin,
          count,
          colors: Array.from({ length: count }, () => DEFAULT_NEOPIXEL_COLOR),
        };
        mark(state, "neopixel");
        setPinMode(state, pin, "OUTPUT");
        break;
      }

      case "esp32_neopixel_set_color": {
        if (!state.neopixel) {
          state.neopixel = {
            pin: 4,
            count: 5,
            colors: Array.from({ length: 5 }, () => DEFAULT_NEOPIXEL_COLOR),
          };
        }

        mark(state, "neopixel");
        const index = clamp(toNumber(current.fields.INDEX, 1) - 1, 0, state.neopixel.count - 1);
        const color = evaluateExpression(current.inputs.COLOR, state, inputs);
        state.neopixel.colors[index] = normalizeColor(String(color));
        break;
      }

      case "esp32_neopixel_set_rgb": {
        if (!state.neopixel) {
          state.neopixel = {
            pin: 4,
            count: 5,
            colors: Array.from({ length: 5 }, () => DEFAULT_NEOPIXEL_COLOR),
          };
        }

        mark(state, "neopixel");
        const index = clamp(toNumber(current.fields.INDEX, 1) - 1, 0, state.neopixel.count - 1);
        state.neopixel.colors[index] = rgbToHex(
          toNumber(current.fields.RED, 125),
          toNumber(current.fields.GREEN, 0),
          toNumber(current.fields.BLUE, 125)
        );
        break;
      }

      case "esp32_neopixel_clear":
        mark(state, "neopixel");
        if (state.neopixel) {
          state.neopixel.colors = state.neopixel.colors.map(() => DEFAULT_NEOPIXEL_COLOR);
        }
        break;

      case "esp32_dht_init":
        state.dht = {
          pin: toNumber(current.fields.PIN, 4),
          type: current.fields.TYPE ?? "DHT11",
          temperatureC: inputs.temperatureC,
          humidityPercent: inputs.humidityPercent,
        };
        mark(state, "dht");
        setPinMode(state, toNumber(current.fields.PIN, 4), "INPUT");
        break;

      case "esp32_display_init":
        state.display = {
          sdaPin: toNumber(current.fields.SDA, 21),
          sclPin: toNumber(current.fields.SCL, 22),
          columns: 16,
          rows: 2,
          lines: ["", ""],
        };
        mark(state, "display");
        break;

      case "esp32_display_print": {
        if (!state.display) {
          state.display = {
            sdaPin: 21,
            sclPin: 22,
            columns: 16,
            rows: 2,
            lines: ["", ""],
          };
        }
        mark(state, "display");
        const text = String(evaluateExpression(current.inputs.TEXT, state, inputs));
        writeDisplayText(
          state.display,
          toNumber(current.fields.X, 0),
          toNumber(current.fields.Y, 0),
          text
        );
        break;
      }

      case "esp32_display_clear":
        mark(state, "display");
        if (state.display) {
          state.display.lines = ["", ""];
        }
        break;

      case "wifi_connect":
        mark(state, "wifi");
        state.wifi = {
          ...createDefaultWifi(),
          mode: "station",
          connected: true,
          ssid: current.fields.SSID || "ESP32_AP",
          password: current.fields.PASSWORD || "12345678",
        };
        break;

      case "wifi_create_ap":
        mark(state, "wifi");
        state.wifi = {
          ...createDefaultWifi(),
          mode: "access-point",
          connected: true,
          ssid: current.fields.SSID || "ESP32_AP",
          password: current.fields.PASSWORD || "12345678",
          ipAddress: "192.168.4.1",
        };
        break;

      case "wifi_disconnect":
        mark(state, "wifi");
        state.wifi = {
          ...createDefaultWifi(),
          mode: "off",
          connected: false,
        };
        break;

      case "wifi_start_web_server": {
        mark(state, "wifi");
        ensureWifi(state);
        const path = current.fields.PATH || "/";
        const response = String(evaluateExpression(current.inputs.CONTENT, state, inputs));
        if (state.wifi) {
          state.wifi.webServer = {
            port: toNumber(current.fields.PORT, 80),
            path,
            response,
            lastPath: path,
          };
        }
        break;
      }

      case "esp32_servo_attach":
        state.servo = {
          pin: toNumber(current.fields.PIN, 18),
          attached: true,
          angle: state.servo?.angle ?? 90,
        };
        mark(state, "servo");
        break;

      case "esp32_servo_write":
        state.servo = {
          pin: toNumber(current.fields.PIN, 18),
          attached: true,
          angle: clamp(toNumber(current.fields.ANGLE, 90), 0, 180),
        };
        mark(state, "servo");
        break;

      case "esp32_tone_play":
        state.buzzer = {
          pin: toNumber(current.fields.PIN, 25),
          active: true,
          frequency: toNumber(current.fields.FREQUENCY, 440),
          durationMs: toNumber(current.fields.DURATION, 200),
        };
        mark(state, "buzzer");
        break;

      case "esp32_tone_stop":
        state.buzzer = {
          pin: toNumber(current.fields.PIN, 25),
          active: false,
          frequency: 0,
        };
        mark(state, "buzzer");
        break;

      default:
        state.unsupportedBlocks.add(current.type);
        break;
    }

    current = current.next;
  }
}

function createInitialState(): MutableEsp32State {
  return {
    pins: new Map(),
    neopixel: null,
    dht: null,
    ultrasonic: null,
    servo: null,
    buzzer: null,
    display: null,
    wifi: null,
    capabilities: {
      pins: false,
      neopixel: false,
      dht: false,
      ultrasonic: false,
      servo: false,
      buzzer: false,
      display: false,
      wifi: false,
      touch: false,
      analogRead: false,
      digitalRead: false,
    },
    events: [],
    unsupportedBlocks: new Set(),
  };
}

export const esp32Simulator: BoardSimulator = {
  board: "esp32",
  simulate(blocks, inputs): SimulationResult {
    const state = createInitialState();
    const programBlocks = blocks.filter((block) => block.type === "program_start");
    const entryBlocks = programBlocks.length > 0 ? programBlocks : blocks;

    for (const block of entryBlocks) {
      runStatement(block, state, inputs);
    }

    return {
      board: "esp32",
      pins: Array.from(state.pins.values()).sort((left, right) => left.pin - right.pin),
      neopixel: state.neopixel,
      dht: state.dht,
      ultrasonic: state.ultrasonic,
      servo: state.servo,
      buzzer: state.buzzer,
      display: state.display,
      wifi: state.wifi,
      capabilities: state.capabilities,
      events: state.events,
      unsupportedBlocks: Array.from(state.unsupportedBlocks).sort(),
    };
  },
};

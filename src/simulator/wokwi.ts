export type WokwiBoardConfig = {
  template: string;
  partType: string;
  partId: string;
  label: string;
  powerPin: string;
  groundPin: string;
};

export type WokwiProjectFiles = {
  sketch: string;
  diagram: Record<string, unknown>;
};

export type WokwiSimulationState = {
  isLoading: boolean;
  board: string | null;
  projectId: string | null;
  projectUrl: string | null;
  files: WokwiProjectFiles | null;
  error: string | null;
};

type PrepareWokwiSimulationParams = {
  apiUrl: string;
  workspaceId: string;
  projectName: string;
  board: string;
  code: string;
};

type WokwiSimulationResponse = {
  ok?: boolean;
  projectId?: string;
  projectUrl?: string;
  url?: string;
  error?: string;
  message?: string;
};

type WokwiPart = {
  type: string;
  id: string;
  top: number;
  left: number;
  attrs?: Record<string, string>;
  rotate?: number;
};

type WokwiConnection = [string, string, string, string[]];

type InferredCircuit = {
  ledPins: Set<string>;
  buzzerPins: Set<string>;
  servoPins: Set<string>;
  dhtSensors: Array<{ pin: string; type: string }>;
  ultrasonicSensors: Array<{ trig: string; echo: string }>;
  neopixels: Array<{ pin: string; count: number }>;
};

const WOKWI_BOARD_CONFIG: Record<string, WokwiBoardConfig> = {
  esp32: {
    template: "esp32",
    partType: "board-esp32-devkit-c-v4",
    partId: "esp",
    label: "ESP32",
    powerPin: "3V3",
    groundPin: "GND.1",
  },
  uno: {
    template: "arduino-uno",
    partType: "wokwi-arduino-uno",
    partId: "uno",
    label: "Arduino Uno",
    powerPin: "5V",
    groundPin: "GND.1",
  },
  nano: {
    template: "arduino-nano",
    partType: "wokwi-arduino-nano",
    partId: "nano",
    label: "Arduino Nano",
    powerPin: "5V",
    groundPin: "GND.1",
  },
  mega: {
    template: "arduino-mega",
    partType: "wokwi-arduino-mega",
    partId: "mega",
    label: "Arduino Mega",
    powerPin: "5V",
    groundPin: "GND.1",
  },
};

function normalizePin(pin: string | undefined) {
  const normalized = pin?.trim().replace(/^D/i, "");

  if (!normalized || !/^(?:A\d+|\d+)$/i.test(normalized)) {
    return null;
  }

  return normalized.toUpperCase();
}

function uniquePins(values: Iterable<string | null>) {
  return new Set([...values].filter((pin): pin is string => Boolean(pin)));
}

function matchPins(code: string, pattern: RegExp, groupIndex = 1) {
  return [...code.matchAll(pattern)].map((match) => normalizePin(match[groupIndex]));
}

function getBoardPin(config: WokwiBoardConfig, pin: string) {
  return `${config.partId}:${pin}`;
}

function getPowerPin(config: WokwiBoardConfig) {
  return `${config.partId}:${config.powerPin}`;
}

function getGroundPin(config: WokwiBoardConfig) {
  return `${config.partId}:${config.groundPin}`;
}

function getPartPosition(index: number) {
  return {
    left: 260 + (index % 3) * 150,
    top: -120 + Math.floor(index / 3) * 130,
  };
}

function addConnection(
  connections: WokwiConnection[],
  from: string,
  to: string,
  color: string
) {
  connections.push([from, to, color, []]);
}

function inferCircuitFromCode(code: string): InferredCircuit {
  const tonePins = uniquePins(matchPins(code, /\btone\(\s*(A?\d+)\s*,/gi));
  const servoPins = uniquePins([
    ...matchPins(code, /_1botServo_(A?\d+)\.attach\(\s*\1\s*\)/gi),
    ...matchPins(code, /_1botServo_(A?\d+)\.write\(/gi),
  ]);
  const dhtSensors = [...code.matchAll(/DHT\s+_1botEsp32Dht\(\s*(A?\d+)\s*,\s*(DHT\d+)\s*\)/gi)]
    .map((match) => ({ pin: normalizePin(match[1]), type: match[2].toUpperCase() }))
    .filter((sensor): sensor is { pin: string; type: string } => Boolean(sensor.pin));
  const neopixels = [...code.matchAll(/Adafruit_NeoPixel\s+_1botEsp32Strip\(\s*(\d+)\s*,\s*(A?\d+)\s*,/gi)]
    .map((match) => ({ count: Number(match[1]), pin: normalizePin(match[2]) }))
    .filter((strip): strip is { pin: string; count: number } => Boolean(strip.pin));
  const ultrasonicSensors = [...code.matchAll(/pinMode\(\s*(A?\d+)\s*,\s*OUTPUT\s*\);[\s\S]{0,500}?pinMode\(\s*(A?\d+)\s*,\s*INPUT\s*\);[\s\S]{0,800}?pulseIn\(\s*\2\s*,/gi)]
    .map((match) => ({ trig: normalizePin(match[1]), echo: normalizePin(match[2]) }))
    .filter((sensor): sensor is { trig: string; echo: string } => Boolean(sensor.trig && sensor.echo));
  const ledcAttachPins = new Set<string>();
  const ledcAttachPinsByChannel = new Map<string, string>();

  for (const match of code.matchAll(/ledcAttachPin\(\s*(A?\d+)\s*,\s*([^\s)]+)\s*\)/gi)) {
    const pin = normalizePin(match[1]);

    if (pin) {
      ledcAttachPins.add(pin);
      ledcAttachPinsByChannel.set(match[2], pin);
    }
  }

  for (const match of code.matchAll(/ledcAttach\(\s*(A?\d+)\s*,/gi)) {
    const pin = normalizePin(match[1]);

    if (pin) {
      ledcAttachPins.add(pin);
    }
  }

  for (const match of code.matchAll(/ledcWriteTone\(\s*([^\s,)]+)\s*,/gi)) {
    const directPin = normalizePin(match[1]);
    const pin = ledcAttachPinsByChannel.get(match[1]) ?? directPin;

    if (pin) {
      tonePins.add(pin);
    }
  }

  const protectedPins = new Set([
    ...tonePins,
    ...servoPins,
    ...dhtSensors.map((sensor) => sensor.pin),
    ...neopixels.map((strip) => strip.pin),
    ...ultrasonicSensors.flatMap((sensor) => [sensor.trig, sensor.echo]),
  ]);
  const outputPins = uniquePins([
    ...matchPins(code, /\bpinMode\(\s*(A?\d+)\s*,\s*OUTPUT\s*\)/gi),
    ...matchPins(code, /\bdigitalWrite\(\s*(A?\d+)\s*,/gi),
    ...matchPins(code, /\banalogWrite\(\s*(A?\d+)\s*,/gi),
    ...ledcAttachPins.values(),
    ...ledcAttachPinsByChannel.values(),
  ]);
  const ledPins = new Set([...outputPins].filter((pin) => !protectedPins.has(pin)));

  return {
    ledPins,
    buzzerPins: tonePins,
    servoPins,
    dhtSensors,
    ultrasonicSensors,
    neopixels,
  };
}

function createWokwiDiagram(board: string, code: string) {
  const config = getWokwiBoardConfig(board);

  if (!config) {
    throw new Error(`La placa "${board}" todavia no tiene plantilla Wokwi configurada.`);
  }

  const parts: WokwiPart[] = [
    {
      type: config.partType,
      id: config.partId,
      top: 0,
      left: 0,
      attrs: {},
    },
  ];
  const connections: WokwiConnection[] = [];
  const circuit = inferCircuitFromCode(code);
  let partIndex = 0;

  for (const pin of circuit.ledPins) {
    const position = getPartPosition(partIndex);
    const ledId = `led_${pin.toLowerCase()}`;
    const resistorId = `res_${pin.toLowerCase()}`;

    parts.push(
      {
        type: "wokwi-led",
        id: ledId,
        top: position.top,
        left: position.left + 70,
        attrs: { color: "red", label: `LED ${pin}` },
      },
      {
        type: "wokwi-resistor",
        id: resistorId,
        top: position.top + 6,
        left: position.left,
        attrs: { value: "220" },
        rotate: 90,
      }
    );
    addConnection(connections, getBoardPin(config, pin), `${resistorId}:1`, "green");
    addConnection(connections, `${resistorId}:2`, `${ledId}:A`, "green");
    addConnection(connections, `${ledId}:C`, getGroundPin(config), "black");
    partIndex += 1;
  }

  for (const pin of circuit.buzzerPins) {
    const position = getPartPosition(partIndex);
    const buzzerId = `buzzer_${pin.toLowerCase()}`;

    parts.push({
      type: "wokwi-buzzer",
      id: buzzerId,
      top: position.top,
      left: position.left,
      attrs: { volume: "0.6" },
    });
    addConnection(connections, getBoardPin(config, pin), `${buzzerId}:2`, "green");
    addConnection(connections, `${buzzerId}:1`, getGroundPin(config), "black");
    partIndex += 1;
  }

  for (const pin of circuit.servoPins) {
    const position = getPartPosition(partIndex);
    const servoId = `servo_${pin.toLowerCase()}`;

    parts.push({
      type: "wokwi-servo",
      id: servoId,
      top: position.top,
      left: position.left,
      attrs: {},
    });
    addConnection(connections, getBoardPin(config, pin), `${servoId}:PWM`, "green");
    addConnection(connections, getPowerPin(config), `${servoId}:V+`, "red");
    addConnection(connections, getGroundPin(config), `${servoId}:GND`, "black");
    partIndex += 1;
  }

  for (const sensor of circuit.dhtSensors) {
    const position = getPartPosition(partIndex);
    const dhtId = `dht_${sensor.pin.toLowerCase()}`;

    parts.push({
      type: sensor.type === "DHT11" ? "wokwi-dht22" : "wokwi-dht22",
      id: dhtId,
      top: position.top,
      left: position.left,
      attrs: { temperature: "24", humidity: "40" },
    });
    addConnection(connections, getPowerPin(config), `${dhtId}:VCC`, "red");
    addConnection(connections, `${dhtId}:GND`, getGroundPin(config), "black");
    addConnection(connections, getBoardPin(config, sensor.pin), `${dhtId}:SDA`, "green");
    partIndex += 1;
  }

  for (const sensor of circuit.ultrasonicSensors) {
    const position = getPartPosition(partIndex);
    const ultrasonicId = `ultra_${sensor.trig.toLowerCase()}_${sensor.echo.toLowerCase()}`;

    parts.push({
      type: "wokwi-hc-sr04",
      id: ultrasonicId,
      top: position.top,
      left: position.left,
      attrs: { distance: "120" },
    });
    addConnection(connections, getPowerPin(config), `${ultrasonicId}:VCC`, "red");
    addConnection(connections, `${ultrasonicId}:GND`, getGroundPin(config), "black");
    addConnection(connections, getBoardPin(config, sensor.trig), `${ultrasonicId}:TRIG`, "green");
    addConnection(connections, getBoardPin(config, sensor.echo), `${ultrasonicId}:ECHO`, "green");
    partIndex += 1;
  }

  for (const strip of circuit.neopixels) {
    const position = getPartPosition(partIndex);
    const count = Math.max(1, Math.min(strip.count || 1, 12));
    let previousPixelId: string | null = null;

    for (let index = 0; index < count; index += 1) {
      const pixelId = `neo_${strip.pin.toLowerCase()}_${index + 1}`;

      parts.push({
        type: "wokwi-neopixel",
        id: pixelId,
        top: position.top + (index % 4) * 34,
        left: position.left + Math.floor(index / 4) * 48,
        attrs: {},
      });
      addConnection(connections, getPowerPin(config), `${pixelId}:VDD`, "red");
      addConnection(connections, `${pixelId}:VSS`, getGroundPin(config), "black");

      if (previousPixelId) {
        addConnection(connections, `${previousPixelId}:DOUT`, `${pixelId}:DIN`, "green");
      } else {
        addConnection(connections, getBoardPin(config, strip.pin), `${pixelId}:DIN`, "green");
      }

      previousPixelId = pixelId;
    }

    partIndex += 1;
  }

  return {
    version: 1,
    author: "1bot",
    editor: "wokwi",
    parts,
    connections,
  };
}

export function emptyWokwiSimulationState(): WokwiSimulationState {
  return {
    isLoading: false,
    board: null,
    projectId: null,
    projectUrl: null,
    files: null,
    error: null,
  };
}

export function getWokwiBoardConfig(board: string) {
  return WOKWI_BOARD_CONFIG[board] ?? null;
}

export function getWokwiNewProjectUrl(board: string) {
  const config = getWokwiBoardConfig(board);
  const template = config?.template ?? "arduino-uno";

  return `https://wokwi.com/projects/new/${template}`;
}

export function createWokwiProjectFiles({
  board,
  code,
}: Pick<PrepareWokwiSimulationParams, "board" | "code">): WokwiProjectFiles {
  const config = getWokwiBoardConfig(board);

  if (!config) {
    throw new Error(`La placa "${board}" todavia no tiene plantilla Wokwi configurada.`);
  }

  return {
    sketch: code,
    diagram: createWokwiDiagram(board, code),
  };
}

export async function prepareWokwiSimulation({
  apiUrl,
  workspaceId,
  projectName,
  board,
  code,
}: PrepareWokwiSimulationParams): Promise<WokwiSimulationState> {
  const files = createWokwiProjectFiles({ board, code });
  const response = await fetch(`${apiUrl.replace(/\/+$/, "")}/api/wokwi/simulations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workspaceId,
      projectName,
      board,
      files,
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "El backend todavia no tiene /api/wokwi/simulations. Hay que agregar ese endpoint para crear o actualizar el proyecto Wokwi sin exponer el token."
      );
    }

    throw new Error(`Wokwi backend respondio HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as WokwiSimulationResponse;

  if (payload.ok === false) {
    throw new Error(payload.error ?? payload.message ?? "Wokwi no pudo preparar la simulacion.");
  }

  const projectId = payload.projectId ?? null;
  const projectUrl = payload.projectUrl ?? payload.url ?? (projectId ? `https://wokwi.com/projects/${projectId}` : null);

  if (!projectUrl) {
    throw new Error("El backend de Wokwi no devolvio projectUrl ni projectId.");
  }

  return {
    isLoading: false,
    board,
    projectId,
    projectUrl,
    files,
    error: null,
  };
}

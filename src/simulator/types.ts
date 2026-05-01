import type { SimulationBlock } from "../app/types";

export type SimulatorBoard = "esp32";

export type SimulatorInputs = {
  ultrasonicDistanceCm: number;
  temperatureC: number;
  humidityPercent: number;
  touchValue: number;
  analogReadValue: number;
  digitalReadValue: 0 | 1;
};

export type SimulatedPin = {
  pin: number;
  mode?: string;
  digital?: 0 | 1;
  analog?: number;
  pwmDuty?: number;
  pwmFrequency?: number;
};

export type SimulatedNeoPixel = {
  pin: number;
  count: number;
  colors: string[];
};

export type SimulatedDht = {
  pin: number;
  type: string;
  temperatureC: number;
  humidityPercent: number;
};

export type SimulatedUltrasonic = {
  trigPin: number;
  echoPin: number;
  distanceCm: number;
};

export type SimulatedServo = {
  pin: number;
  attached: boolean;
  angle: number;
};

export type SimulatedBuzzer = {
  pin: number;
  active: boolean;
  frequency: number;
  durationMs?: number;
};

export type SimulatedDisplay = {
  sdaPin: number;
  sclPin: number;
  columns: number;
  rows: number;
  lines: string[];
};

export type SimulatedWifi = {
  mode: "off" | "station" | "access-point";
  connected: boolean;
  ssid?: string;
  password?: string;
  ipAddress: string;
  rssi: number;
  scannedNetworks: string[];
  webServer?: {
    port: number;
    path: string;
    response: string;
    lastPath: string;
  };
  lastHttpRequest?: {
    method: "GET" | "POST";
    url: string;
    response: string;
  };
};

export type SimulationCapabilities = {
  pins: boolean;
  neopixel: boolean;
  dht: boolean;
  ultrasonic: boolean;
  servo: boolean;
  buzzer: boolean;
  display: boolean;
  wifi: boolean;
  touch: boolean;
  analogRead: boolean;
  digitalRead: boolean;
};

export type SimulationEvent = {
  label: string;
  detail?: string;
};

export type SimulationResult = {
  board: SimulatorBoard;
  pins: SimulatedPin[];
  neopixel: SimulatedNeoPixel | null;
  dht: SimulatedDht | null;
  ultrasonic: SimulatedUltrasonic | null;
  servo: SimulatedServo | null;
  buzzer: SimulatedBuzzer | null;
  display: SimulatedDisplay | null;
  wifi: SimulatedWifi | null;
  capabilities: SimulationCapabilities;
  events: SimulationEvent[];
  unsupportedBlocks: string[];
};

export type BoardSimulator = {
  board: SimulatorBoard;
  simulate: (
    blocks: SimulationBlock[],
    inputs: SimulatorInputs
  ) => SimulationResult;
};

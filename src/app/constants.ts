import type { DeviceOption } from "./types";

export const DEVICES: DeviceOption[] = [
  /*
    This is displayed on the devices screen with an image with webp format
   */
  { id: "esp32", name: "ESP32", img: "/devices/esp32.webp" },
  { id: "uno", name: "Arduino Uno", img: "/devices/arduino_uno.webp" },
  { id: "mega", name: "Arduino Mega", img: "/devices/arduino_mega.webp" },
  { id: "nano", name: "Arduino Nano", img: "/devices/arduino_nano.webp" },
  { id: "codey", name: "Codey", img: "/devices/Codey.webp" },
];

import { memo, useEffect, useMemo, useState } from "react";
import type { SimulationBlock } from "../types";
import { getBoardSimulator } from "../../simulator/registry";
import type { SimulationResult, SimulatorInputs } from "../../simulator/types";
import i18n from "../../i18n";
import "./Esp32SimulatorPanel.css";

type Esp32SimulatorPanelProps = {
  board: string;
  getSimulationSnapshot: () => SimulationBlock[];
  workspaceVersion: number;
};

const defaultInputs: SimulatorInputs = {
  ultrasonicDistanceCm: 42,
  temperatureC: 24,
  humidityPercent: 55,
  touchValue: 28,
  analogReadValue: 2048,
  digitalReadValue: 1,
  neopixelColor: "#ff0000",
};

const ESP32_PINS_LEFT = [
  { label: "3V3", type: "vcc" },
  { label: "EN", type: "en" },
  { label: "GPIO36", type: "gpio" },
  { label: "GPIO39", type: "gpio" },
  { label: "GPIO34", type: "gpio" },
  { label: "GPIO35", type: "gpio" },
  { label: "GPIO32", type: "gpio" },
  { label: "GPIO33", type: "gpio" },
  { label: "GPIO25", type: "gpio" },
  { label: "GPIO26", type: "gpio" },
  { label: "GPIO27", type: "gpio" },
  { label: "GPIO14", type: "gpio" },
  { label: "GPIO12", type: "gpio" },
  { label: "GND", type: "gnd" },
  { label: "GPIO13", type: "gpio" },
  { label: "GPIO15", type: "gpio" },
  { label: "GPIO2", type: "gpio" },
  { label: "GPIO4", type: "gpio" },
  { label: "GPIO0", type: "gpio" },
];

const ESP32_PINS_RIGHT = [
  { label: "GND", type: "gnd" },
  { label: "GPIO5", type: "gpio" },
  { label: "GPIO18", type: "gpio" },
  { label: "GPIO19", type: "gpio" },
  { label: "GPIO21", type: "gpio" },
  { label: "GPIO22", type: "gpio" },
  { label: "GPIO23", type: "gpio" },
  { label: "GND", type: "gnd" },
  { label: "GPIO1", type: "gpio" },
  { label: "GPIO3", type: "gpio" },
  { label: "GPIO1", type: "gpio" },
  { label: "GPIO3", type: "gpio" },
  { label: "GPIO21", type: "gpio" },
  { label: "GPIO22", type: "gpio" },
  { label: "GPIO35", type: "gpio" },
  { label: "GPIO35", type: "gpio" },
  { label: "GND", type: "gnd" },
  { label: "3V3", type: "vcc" },
  { label: "GND", type: "gnd" },
];

function toInputNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBrightness(color: string) {
  const normalized = color.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return Math.max(red, green, blue) / 255;
}

export const Esp32SimulatorPanel = memo(function Esp32SimulatorPanel({
  board,
  getSimulationSnapshot,
  workspaceVersion,
}: Esp32SimulatorPanelProps) {
  const [inputs, setInputs] = useState<SimulatorInputs>(defaultInputs);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [simulatedVersion, setSimulatedVersion] = useState<number | null>(null);

  const simulator = useMemo(() => getBoardSimulator(board), [board]);
  const isStale = result !== null && simulatedVersion !== workspaceVersion;

  useEffect(() => {
    setResult(null);
    setSimulatedVersion(null);
  }, [board]);

  const runSimulation = () => {
    if (!simulator) {
      return;
    }

    setResult(simulator.simulate(getSimulationSnapshot(), inputs));
    setSimulatedVersion(workspaceVersion);
  };

  useEffect(() => {
    if (simulator && result !== null) {
      setResult(simulator.simulate(getSimulationSnapshot(), inputs));
      setSimulatedVersion(workspaceVersion);
    }
  }, [inputs, simulator, workspaceVersion]);

  useEffect(() => {
    if (simulator) {
      setResult(simulator.simulate(getSimulationSnapshot(), inputs));
      setSimulatedVersion(workspaceVersion);
    }
  }, [workspaceVersion]);

  if (!simulator) {
    return (
      <section className="simulator-panel simulator-empty">
        <h2>Simulación</h2>
        <p>La simulación inicial está disponible para ESP32.</p>
      </section>
    );
  }

  return (
    <section className="simulator-panel">
      <div className="simulator-header">
        <div>
          <h2>Simulación ESP32</h2>
          <p>Arma el programa con bloques y presiona Simular para ejecutar el estado actual.</p>
        </div>
        <div className="simulator-actions">
          {isStale && <span className="simulator-stale">Cambios sin simular</span>}
          <button className="simulate-btn" onClick={runSimulation}>
            Simular
          </button>
        </div>
      </div>

      {!result ? (
        <div className="tinkercad-stage simulator-start">
          <div className="esp32-board large">
            <div className="esp32-chip">ESP32</div>
            <div className="esp32-usb"></div>
            <div className="esp32-pin-strip left"></div>
            <div className="esp32-pin-strip right"></div>
          </div>
          <div>
            <h3>Listo para simular</h3>
            <p>
              La placa y los componentes aparecerán cuando existan bloques relacionados en tu
              programa.
            </p>
          </div>
        </div>
      ) : (
        <div className="simulator-grid">
          <section className="simulator-section esp32-board-surface">
            <div className="tinkercad-stage">
              <div className="esp32-board">
                <div className="esp32-chip">ESP32</div>
                <div className="esp32-usb"></div>
                <div className="esp32-pin-strip left">
                  {ESP32_PINS_LEFT.slice(0, 19).map((pin, i) => (
                    <div key={i} className={`esp32-pin ${pin.type}`}>
                      {pin.label}
                    </div>
                  ))}
                </div>
                <div className="esp32-pin-strip right">
                  {ESP32_PINS_RIGHT.slice(0, 19).map((pin, i) => (
                    <div key={i} className={`esp32-pin ${pin.type}`}>
                      {pin.label}
                    </div>
                  ))}
                </div>
              </div>

              {result.capabilities.neopixel && result.neopixel && (
                <div className="component-card neopixel-component">
                  <strong>NeoPixel</strong>
                  <span>GPIO {result.neopixel.pin} · {result.neopixel.count} LEDs</span>
                  <div className="neopixel-strip">
                    {result.neopixel.colors.map((color, index) => (
                      <span
                        key={`${color}-${index}`}
                        className="neopixel-led"
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            getBrightness(color) > 0
                              ? `0 0 ${8 + getBrightness(color) * 18}px ${color}`
                              : "none",
                        }}
                        title={`LED ${index + 1}: ${color}`}
                      />
                    ))}
                  </div>
                  <div className="neopixel-controls">
                    <label className="color-picker-label">
                      Color:
                      <input
                        type="color"
                        value={inputs.neopixelColor}
                        onChange={(event) =>
                          setInputs((current) => ({
                            ...current,
                            neopixelColor: event.target.value,
                          }))
                        }
                        className="color-picker"
                      />
                      <span className="color-hex">{inputs.neopixelColor.toUpperCase()}</span>
                    </label>
                  </div>
                </div>
              )}

              {result.capabilities.display && result.display && (
                <div className="component-card lcd-component">
                  <strong>LCD I2C</strong>
                  <span>SDA {result.display.sdaPin} · SCL {result.display.sclPin}</span>
                  <div className="lcd-screen">
                    {result.display.lines.map((line, index) => (
                      <code key={index}>{line.padEnd(result.display?.columns ?? 16, " ")}</code>
                    ))}
                  </div>
                </div>
              )}

              {result.capabilities.ultrasonic && result.ultrasonic && (
                <div className="component-card ultrasonic-component">
                  <strong>HC-SR04</strong>
                  <small>TRIG {result.ultrasonic.trigPin} · ECHO {result.ultrasonic.echoPin}</small>
                  <div className="ultrasonic-visual">
                    <div className="ultrasonic-icon"></div>
                    <div className="ultrasonic-sensor">
                      <input
                        type="range"
                        min="2"
                        max="400"
                        value={inputs.ultrasonicDistanceCm}
                        onChange={(event) =>
                          setInputs((current) => ({
                            ...current,
                            ultrasonicDistanceCm: toInputNumber(
                              event.target.value,
                              current.ultrasonicDistanceCm
                            ),
                          }))
                        }
                      />
                      <div className="distance-display">{inputs.ultrasonicDistanceCm} cm</div>
                      <div className="distance-label">Distancia</div>
                    </div>
                  </div>
                </div>
              )}

              {result.capabilities.dht && result.dht && (
                <div className="component-card dht-component">
                  <strong>{result.dht.type}</strong>
                  <small>GPIO {result.dht.pin}</small>
                  <div className="dht-visual">
                    <div className="dht-icon"></div>
                    <div className="dht-values">
                      <div className="dht-value temp">
                        <span className="label">Temp</span>
                        <span className="data">{inputs.temperatureC}°C</span>
                        <input
                          type="range"
                          min="-10"
                          max="60"
                          value={inputs.temperatureC}
                          onChange={(event) =>
                            setInputs((current) => ({
                              ...current,
                              temperatureC: toInputNumber(event.target.value, current.temperatureC),
                            }))
                          }
                          style={{ width: "60px", marginTop: "4px" }}
                        />
                      </div>
                      <div className="dht-value humidity">
                        <span className="label">Hum</span>
                        <span className="data">{inputs.humidityPercent}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={inputs.humidityPercent}
                          onChange={(event) =>
                            setInputs((current) => ({
                              ...current,
                              humidityPercent: toInputNumber(event.target.value, current.humidityPercent),
                            }))
                          }
                          style={{ width: "60px", marginTop: "4px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.capabilities.servo && result.servo && (
                <div className="component-card servo-component">
                  <strong>Servo</strong>
                  <div className="servo-dial">
                    <span style={{ transform: `rotate(${result.servo.angle - 90}deg)` }} />
                  </div>
                  <small>{result.servo.angle}° · GPIO {result.servo.pin}</small>
                </div>
              )}

              {result.capabilities.buzzer && result.buzzer && (
                <div className={`component-card buzzer-component ${result.buzzer.active ? "active" : ""}`}>
                  <strong>Buzzer</strong>
                  <span>{result.buzzer.active ? `${result.buzzer.frequency} Hz` : "Apagado"}</span>
                  <small>GPIO {result.buzzer.pin}</small>
                </div>
              )}

              {result.capabilities.pins && result.pins.filter(p => p.mode === "OUTPUT" && p.digital !== undefined).map((pin) => (
                <div 
                  key={`led-${pin.pin}`} 
                  className="component-card led-component"
                  style={{ 
                    left: pin.pin < 20 ? `${30 + (pin.pin % 10) * 50}px` : undefined,
                    right: pin.pin >= 20 ? `${30 + ((pin.pin - 20) % 10) * 50}px` : undefined,
                    bottom: pin.pin % 2 === 0 ? "100px" : "60px"
                  }}
                >
                  <div className="led-real">
                    <div 
                      className={`led-bulb ${pin.digital ? "on" : ""}`}
                      title={`GPIO ${pin.pin}: ${pin.digital ? "Encendido" : "Apagado"}`}
                    ></div>
                    <div className="led-legs">
                      <div className="led-leg anode" title="Ánodo (+)"></div>
                      <div className="led-leg cathode" title="Cátodo (-)"></div>
                    </div>
                  </div>
                  <span className={`led-label ${pin.digital ? "on" : ""}`}>
                    GPIO {pin.pin} {pin.digital ? "ON" : "OFF"}
                  </span>
                </div>
              ))}

              {result.capabilities.wifi && result.wifi && (
                <div className="component-card wifi-component">
                  <strong>WiFi</strong>
                  <span>{result.wifi.connected ? result.wifi.ssid ?? "conectado" : "desconectado"}</span>
                  <small>{result.wifi.mode} · {result.wifi.ipAddress}</small>
                </div>
              )}
            </div>
          </section>

          {(result.capabilities.ultrasonic ||
            result.capabilities.dht ||
            result.capabilities.touch ||
            result.capabilities.analogRead ||
            result.capabilities.digitalRead) && (
            <section className="simulator-section">
              <h3>Entradas simuladas</h3>

              {result.capabilities.ultrasonic && (
                <label>
                  Distancia ultrasónica
                  <input
                    type="range"
                    min="2"
                    max="400"
                    value={inputs.ultrasonicDistanceCm}
                    onChange={(event) =>
                      setInputs((current) => ({
                        ...current,
                        ultrasonicDistanceCm: toInputNumber(
                          event.target.value,
                          current.ultrasonicDistanceCm
                        ),
                      }))
                    }
                  />
                  <span>{inputs.ultrasonicDistanceCm} cm</span>
                </label>
              )}

              {result.capabilities.dht && (
                <>
                  <label>
                    Temperatura
                    <input
                      type="range"
                      min="-10"
                      max="60"
                      value={inputs.temperatureC}
                      onChange={(event) =>
                        setInputs((current) => ({
                          ...current,
                          temperatureC: toInputNumber(event.target.value, current.temperatureC),
                        }))
                      }
                    />
                    <span>{inputs.temperatureC} °C</span>
                  </label>

                  <label>
                    Humidity
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={inputs.humidityPercent}
                      onChange={(event) =>
                        setInputs((current) => ({
                          ...current,
                          humidityPercent: toInputNumber(
                            event.target.value,
                            current.humidityPercent
                          ),
                        }))
                      }
                    />
                    <span>{inputs.humidityPercent}%</span>
                  </label>
                </>
              )}

              {result.capabilities.analogRead && (
                <label>
                  Lectura analógica
                  <input
                    type="range"
                    min="0"
                    max="4095"
                    value={inputs.analogReadValue}
                    onChange={(event) =>
                      setInputs((current) => ({
                        ...current,
                        analogReadValue: toInputNumber(event.target.value, current.analogReadValue),
                      }))
                    }
                  />
                  <span>{inputs.analogReadValue}</span>
                </label>
              )}

              {result.capabilities.digitalRead && (
                <label className="binary-input">
                  Lectura digital
                  <button
                    onClick={() =>
                      setInputs((current) => ({
                        ...current,
                        digitalReadValue: current.digitalReadValue ? 0 : 1,
                      }))
                    }
                  >
                    {inputs.digitalReadValue ? "HIGH" : "LOW"}
                  </button>
                </label>
              )}
            </section>
          )}

          {result.capabilities.pins && result.pins.length > 0 && (
            <section className="simulator-section">
              <h3>Pines</h3>
              <div className="pin-state-list">
                {result.pins.map((pin) => (
                  <div key={pin.pin} className="pin-state-row">
                    <strong>GPIO {pin.pin}</strong>
                    <span>{pin.mode ?? "sin modo"}</span>
                    <span>
                      {pin.digital !== undefined
                        ? pin.digital ? "HIGH" : "LOW"
                        : pin.pwmDuty !== undefined
                          ? `PWM ${pin.pwmDuty}/255`
                          : pin.analog !== undefined
                            ? `Analog ${pin.analog}`
                            : "sin salida"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {result.events.length > 0 && (
            <section className="simulator-section">
              <h3>{i18n.t("simulatorEvents")}</h3>
              <ol className="simulator-events">
                {result.events.map((event, index) => (
                  <li key={`${event.label}-${index}`}>
                    <strong>{event.label}</strong>
                    {event.detail && <span>{event.detail}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {result.unsupportedBlocks.length > 0 && (
            <section className="simulator-section">
              <h3>Por implementar</h3>
              <div className="unsupported-blocks">
                {result.unsupportedBlocks.map((type) => (
                  <span key={type}>{type}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
});

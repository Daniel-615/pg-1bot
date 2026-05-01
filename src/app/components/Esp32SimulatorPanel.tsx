import { memo, useEffect, useMemo, useState } from "react";
import type { SimulationBlock } from "../types";
import { getBoardSimulator } from "../../simulator/registry";
import type { SimulationResult, SimulatorInputs } from "../../simulator/types";
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
};

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
                <div className="esp32-pin-strip left"></div>
                <div className="esp32-pin-strip right"></div>
              </div>

              {result.capabilities.neopixel && result.neopixel && (
                <div className="component-card neopixel-component">
                  <strong>NeoPixel</strong>
                  <span>GPIO {result.neopixel.pin}</span>
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
                  <strong>Ultrasónico</strong>
                  <span>{result.ultrasonic.distanceCm} cm</span>
                  <small>TRIG {result.ultrasonic.trigPin} · ECHO {result.ultrasonic.echoPin}</small>
                </div>
              )}

              {result.capabilities.dht && result.dht && (
                <div className="component-card dht-component">
                  <strong>{result.dht.type}</strong>
                  <span>{result.dht.temperatureC} °C</span>
                  <small>{result.dht.humidityPercent}% humedad · GPIO {result.dht.pin}</small>
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
                    Humedad
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
              <h3>Eventos</h3>
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

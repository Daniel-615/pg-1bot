import { describe, expect, it, vi } from "vitest";
import { ArduinoSemanticAnalyzer } from "../src/core/blockEngine/semantic/arduinoSemanticAnalyzer";
import { createBlock, createWorkspace } from "./helpers/semanticMocks";
import i18n from "../src/i18n";

describe("ArduinoSemanticAnalyzer", () => {
  it("analiza asignaciones y usos, y expone la tabla de símbolos", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const value = createBlock({ id: "num-1", type: "math_number", fields: { NUM: "5" } });
    const setBlock = createBlock({
      id: "set-1",
      type: "variables_set",
      fields: { VAR: "var-led" },
      inputs: { VALUE: value },
    });
    const getBlock = createBlock({
      id: "get-1",
      type: "variables_get",
      fields: { VAR: "var-led" },
    });
    setBlock.getNextBlock = () => getBlock;
    const workspace = createWorkspace([setBlock], { "var-led": "led" });

    analyzer.analyze(workspace as never);

    expect(getBlock.warningText).toBeNull();
    expect(analyzer.getSymbolTableRows()).toEqual([
      {
        name: "led",
        type: "number",
        value: 5,
        initialized: true,
        used: true,
        scopeLevel: 0,
      },
    ]);
  });

  it("marca variables declaradas pero no usadas", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const setBlock = createBlock({
      id: "set-unused",
      type: "variables_set",
      fields: { VAR: "var-contador" },
      inputs: {
        VALUE: createBlock({ id: "num-2", type: "math_number", fields: { NUM: "3" } }),
      },
    });
    const workspace = createWorkspace([setBlock], { "var-contador": "contador" });

    analyzer.analyze(workspace as never);

    expect(setBlock.warningText).toContain("Variable declarada pero no utilizada");
  });

  it("reporta warning por operador matemático con tipos incompatibles", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const mathBlock = createBlock({
      id: "add-1",
      type: "math_add",
      inputs: {
        A: createBlock({ id: "left-string", type: "string", fields: { STRING: "hola" } }),
        B: createBlock({ id: "right-num", type: "math_number", fields: { NUM: "1" } }),
      },
      outputConnected: true,
    });
    const workspace = createWorkspace([mathBlock]);

    analyzer.analyze(workspace as never);

    expect(mathBlock.warningText).toContain("Los operadores matemáticos requieren valores numéricos");
  });

  it("reporta errores y sugerencias en operadores lógicos y comparaciones", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const andBlock = createBlock({
      id: "and-1",
      type: "logic_and",
      inputs: {
        A: createBlock({ id: "and-left", type: "math_number", fields: { NUM: "1" } }),
        B: createBlock({ id: "and-right", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
      },
    });
    const greaterBlock = createBlock({
      id: "greater-1",
      type: "logic_greater",
      inputs: {
        A: createBlock({ id: "gt-left", type: "string", fields: { STRING: "a" } }),
        B: createBlock({ id: "gt-right", type: "math_number", fields: { NUM: "2" } }),
      },
    });
    const equalsBlock = createBlock({
      id: "equals-1",
      type: "logic_equals",
      inputs: {
        A: createBlock({ id: "eq-left", type: "math_number", fields: { NUM: "2" } }),
        B: createBlock({ id: "eq-right", type: "string", fields: { STRING: "2" } }),
      },
    });
    const workspace = createWorkspace([andBlock, greaterBlock, equalsBlock]);

    analyzer.analyze(workspace as never);

    expect(andBlock.warningText).toContain("Los operadores AND/OR deben usar valores booleanos");
    expect(greaterBlock.warningText).toContain("Las comparaciones < y > deben usar números");
    expect(equalsBlock.warningText).toContain("Estás comparando valores de distinto tipo");
  });

  it("no marca error en NOT cuando recibe un booleano", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const notBlock = createBlock({
      id: "not-1",
      type: "logic_not",
      inputs: {
        BOOL: createBlock({ id: "not-bool", type: "logic_boolean", fields: { BOOL: "FALSE" } }),
      },
      outputConnected: true,
    });
    const workspace = createWorkspace([notBlock]);

    analyzer.analyze(workspace as never);

    expect(notBlock.warningText).toBeNull();
  });

  it("detecta división por cero y expresiones no usadas", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const divideBlock = createBlock({
      id: "div-1",
      type: "math_divide",
      inputs: {
        A: createBlock({ id: "div-left", type: "math_number", fields: { NUM: "10" } }),
        B: createBlock({ id: "div-right", type: "math_number", fields: { NUM: "0" } }),
      },
      outputConnected: false,
    });
    const workspace = createWorkspace([divideBlock]);

    analyzer.analyze(workspace as never);

    expect(divideBlock.warningText).toContain("No se puede realizar una división por cero");
    expect(divideBlock.warningText).toContain("El resultado de esta expresión no se utiliza");
  });

  it("valida while y do_while usando la entrada CONDITION", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const whileBlock = createBlock({
      id: "while-ok",
      type: "while_repeat",
      inputs: {
        CONDITION: createBlock({ id: "while-cond", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
        BODY: createBlock({ id: "while-body", type: "variables_get", fields: { VAR: "ghost" } }),
      },
    });
    const doWhileBlock = createBlock({
      id: "do-ok",
      type: "do_while",
      inputs: {
        CONDITION: createBlock({ id: "do-cond", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
        BODY: createBlock({ id: "do-body", type: "variables_get", fields: { VAR: "ghost2" } }),
      },
    });
    const workspace = createWorkspace([whileBlock, doWhileBlock]);

    analyzer.analyze(workspace as never);

    expect(whileBlock.warningText).toBeNull();
    expect(doWhileBlock.warningText).toBeNull();
  });

  it("valida FOR_RANGE con límites no numéricos", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const forBlock = createBlock({
      id: "for-bad",
      type: "for_range",
      fields: { VAR: "var-i" },
      inputs: {
        FROM: createBlock({ id: "for-from", type: "string", fields: { STRING: "a" } }),
        TO: createBlock({ id: "for-to", type: "math_number", fields: { NUM: "5" } }),
        BODY: createBlock({ id: "for-body", type: "variables_get", fields: { VAR: "var-i" } }),
      },
    });
    const workspace = createWorkspace([forBlock], { "var-i": "i" });

    analyzer.analyze(workspace as never);

    expect(forBlock.warningText).toContain("Los valores del 'mientras' deben ser numéricos");
  });

  it("permite depurar paso a paso y guarda historial", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const setBlock = createBlock({
      id: "debug-set",
      type: "variables_set",
      fields: { VAR: "var-debug" },
      inputs: {
        VALUE: createBlock({ id: "debug-value", type: "math_number", fields: { NUM: "8" } }),
      },
    });
    const workspace = createWorkspace([setBlock], { "var-debug": "debugVar" });

    analyzer.startDebug(workspace as never);
    analyzer.step(workspace as never);
    analyzer.step(workspace as never);
    analyzer.step(workspace as never);

    expect(setBlock.selected).toBe(true);
    expect(analyzer.getHistory()).toHaveLength(2);
    expect(analyzer.getCurrentSymbolState()[0].get("debugVar")).toMatchObject({
      value: 8,
      initialized: true,
    });

    logSpy.mockRestore();
  });

  it("reporta errores cuando se usan neopixel y display sin inicializacion", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const neopixelSet = createBlock({
      id: "neo-set",
      type: "esp32_neopixel_set_color",
      fields: { INDEX: "1" },
      inputs: {
        COLOR: createBlock({ id: "neo-color", type: "math_number", fields: { NUM: "1" } }),
      },
    });
    const displayPrint = createBlock({
      id: "display-print",
      type: "esp32_display_print",
      fields: { X: "0", Y: "0" },
      inputs: {
        TEXT: createBlock({ id: "display-text", type: "string", fields: { STRING: "Hola" } }),
      },
    });
    const workspace = createWorkspace([neopixelSet, displayPrint]);

    analyzer.analyze(workspace as never);

    expect(neopixelSet.warningText).toContain("Debes inicializar la tira NeoPixel");
    expect(displayPrint.warningText).toContain("Debes inicializar el display");
  });

  it("reporta dependencias faltantes para wifi y servidor web", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const localIp = createBlock({
      id: "wifi-ip",
      type: "wifi_local_ip",
    });
    const webEquals = createBlock({
      id: "wifi-web-equals",
      type: "wifi_web_response_equals",
      inputs: {
        VALUE: createBlock({ id: "wifi-path", type: "string", fields: { STRING: "/" } }),
      },
      outputConnected: true,
    });
    const workspace = createWorkspace([localIp, webEquals]);

    analyzer.analyze(workspace as never);

    expect(localIp.warningText).toContain("Debes conectar WiFi o crear un punto de acceso");
    expect(webEquals.warningText).toContain("Debes iniciar el servidor web");
  });

  it("advierte cuando el mismo pin se usa con modos incompatibles", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const digitalWrite = createBlock({
      id: "pin-digital",
      type: "esp32_digital_write",
      fields: { PIN: "2", STATE: "HIGH" },
    });
    const pwmWrite = createBlock({
      id: "pin-pwm",
      type: "esp32_pwm_write",
      fields: { PIN: "2", FREQUENCY: "1000", DUTY: "128" },
    });
    digitalWrite.getNextBlock = () => pwmWrite;
    const workspace = createWorkspace([digitalWrite]);

    analyzer.analyze(workspace as never);

    expect(pwmWrite.warningText).toContain("El pin 2 ya se usa como digital_output");
  });

  it("advierte cuando ultrasonido usa el mismo pin para trig y echo", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const ultrasonic = createBlock({
      id: "ultra-1",
      type: "esp32_ultrasonic_distance",
      fields: { TRIG: "5", ECHO: "5" },
      outputConnected: true,
    });
    const workspace = createWorkspace([ultrasonic]);

    analyzer.analyze(workspace as never);

    expect(ultrasonic.warningText).toContain("TRIG y ECHO no deberían usar el mismo pin");
  });

  it("reporta error si se intenta desconectar WiFi sin conexion previa", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const disconnect = createBlock({
      id: "wifi-disconnect",
      type: "wifi_disconnect",
    });
    const workspace = createWorkspace([disconnect]);

    analyzer.analyze(workspace as never);

    expect(disconnect.warningText).toContain(
      "No puedes desconectar WiFi si antes no conectaste o creaste un punto de acceso"
    );
  });

  it("advierte si se mezclan modo cliente y punto de acceso en el mismo flujo", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const connect = createBlock({
      id: "wifi-connect",
      type: "wifi_connect",
      fields: { SSID: "red", PASSWORD: "12345678" },
    });
    const createAp = createBlock({
      id: "wifi-ap",
      type: "wifi_create_ap",
      fields: { SSID: "mi-ap", PASSWORD: "12345678" },
    });
    connect.getNextBlock = () => createAp;
    const workspace = createWorkspace([connect]);

    analyzer.analyze(workspace as never);

    expect(createAp.warningText).toContain(
      "Ya configuraste una conexion WiFi cliente"
    );
  });

  it("sugiere completar SSID y contraseña en bloques WiFi vacios", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const connect = createBlock({
      id: "wifi-connect-empty",
      type: "wifi_connect",
      fields: { SSID: "", PASSWORD: "" },
    });
    const createAp = createBlock({
      id: "wifi-ap-empty",
      type: "wifi_create_ap",
      fields: { SSID: "", PASSWORD: "123" },
    });
    const workspace = createWorkspace([connect, createAp]);

    analyzer.analyze(workspace as never);

    expect(connect.warningText).toContain("El SSID no debería estar vacío");
    expect(connect.warningText).toContain("La contraseña WiFi no debería estar vacía");
    expect(createAp.warningText).toContain("El SSID del punto de acceso no debería estar vacío");
    expect(createAp.warningText).toContain("La contraseña del punto de acceso debería tener al menos 8 caracteres");
  });

  it("valida restricciones reales de pines ESP32", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const digitalWrite = createBlock({
      id: "esp32-out-invalid",
      type: "esp32_digital_write",
      fields: { PIN: "34", STATE: "HIGH" },
    });
    const pwmWrite = createBlock({
      id: "esp32-pwm-invalid",
      type: "esp32_pwm_write",
      fields: { PIN: "35", FREQUENCY: "1000", DUTY: "128" },
    });
    const analogRead = createBlock({
      id: "esp32-analog-invalid",
      type: "esp32_analog_read",
      fields: { PIN: "23" },
      outputConnected: true,
    });
    const touchRead = createBlock({
      id: "esp32-touch-invalid",
      type: "esp32_touch_read",
      fields: { PIN: "26" },
      outputConnected: true,
    });
    const workspace = createWorkspace([digitalWrite, pwmWrite, analogRead, touchRead]);

    analyzer.analyze(workspace as never);

    expect(digitalWrite.warningText).toContain("es solo de entrada y no sirve como salida digital");
    expect(pwmWrite.warningText).toContain("es solo de entrada y no sirve para PWM");
    expect(analogRead.warningText).toContain("no suele ser valido para lectura analogica");
    expect(touchRead.warningText).toContain("no tiene capacidad touch en ESP32");
  });

  it("reporta dependencias faltantes para DHT, servo y HTTP", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const dhtTemp = createBlock({
      id: "dht-temp",
      type: "esp32_dht_temperature",
      outputConnected: true,
    });
    const servoWrite = createBlock({
      id: "servo-write",
      type: "esp32_servo_write",
      fields: { PIN: "18", ANGLE: "90" },
    });
    const httpGet = createBlock({
      id: "http-get",
      type: "wifi_http_get_text",
      inputs: {
        URL: createBlock({ id: "http-url", type: "string", fields: { STRING: "https://example.com" } }),
      },
      outputConnected: true,
    });
    const workspace = createWorkspace([dhtTemp, servoWrite, httpGet]);

    analyzer.analyze(workspace as never);

    expect(dhtTemp.warningText).toContain("Debes inicializar el sensor DHT");
    expect(servoWrite.warningText).toContain("Debes conectar o inicializar el servo");
    expect(httpGet.warningText).toContain("antes de hacer peticiones HTTP");
  });

  it("valida restricciones de pin en pinMode, analog write y buzzer", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const pinMode = createBlock({
      id: "pin-mode-invalid",
      type: "esp32_pin_mode",
      fields: { PIN: "34", MODE: "OUTPUT" },
    });
    const analogWrite = createBlock({
      id: "analog-write-invalid",
      type: "esp32_analog_write",
      fields: { PIN: "35", VALUE: "120" },
    });
    const tonePlay = createBlock({
      id: "tone-invalid",
      type: "esp32_tone_play",
      fields: { PIN: "36", FREQUENCY: "440", DURATION: "200" },
    });
    const workspace = createWorkspace([pinMode, analogWrite, tonePlay]);

    analyzer.analyze(workspace as never);

    expect(pinMode.warningText).toContain("no puede configurarse como OUTPUT");
    expect(analogWrite.warningText).toContain("no sirve para salida analoga por PWM");
    expect(tonePlay.warningText).toContain("no sirve para buzzer");
  });

  it("sugiere el content-type correcto para HTTP POST", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const connect = createBlock({
      id: "wifi-connect-http",
      type: "wifi_connect",
      fields: { SSID: "red", PASSWORD: "12345678" },
    });
    const httpPost = createBlock({
      id: "http-post-invalid-type",
      type: "wifi_http_post_text",
      inputs: {
        URL: createBlock({ id: "http-url-post", type: "string", fields: { STRING: "https://example.com" } }),
        CONTENT_TYPE: createBlock({ id: "http-type-post", type: "string", fields: { STRING: "POST" } }),
        BODY: createBlock({ id: "http-body-post", type: "string", fields: { STRING: "{\"ok\":true}" } }),
      },
      outputConnected: true,
    });
    connect.getNextBlock = () => httpPost;
    const workspace = createWorkspace([connect]);

    analyzer.analyze(workspace as never);

    expect(httpPost.warningText).toContain("En content-type no va el metodo HTTP");
  });

  it("registra en tabla de simbolos una variable asignada desde HTTP POST", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const connect = createBlock({
      id: "wifi-connect-http-var",
      type: "wifi_connect",
      fields: { SSID: "red", PASSWORD: "12345678" },
    });
    const setBlock = createBlock({
      id: "set-http-response",
      type: "variables_set",
      fields: { VAR: "var-http-response" },
      inputs: {
        VALUE: createBlock({
          id: "http-post-value",
          type: "wifi_http_post_text",
          inputs: {
            URL: createBlock({ id: "http-url-value", type: "string", fields: { STRING: "https://example.com" } }),
            CONTENT_TYPE: createBlock({ id: "http-type-value", type: "string", fields: { STRING: "application/json" } }),
            BODY: createBlock({ id: "http-body-value", type: "string", fields: { STRING: "{\"ok\":true}" } }),
          },
          outputConnected: true,
        }),
      },
    });
    connect.getNextBlock = () => setBlock;
    const workspace = createWorkspace([connect], { "var-http-response": "respuesta_http" });

    analyzer.analyze(workspace as never);

    expect(analyzer.getSymbolTableRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "respuesta_http",
          type: "string",
          initialized: true,
        }),
      ])
    );
  });

  it("registra variables desde variables_set_dynamic cuando el valor viene de HTTP", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const connect = createBlock({
      id: "wifi-connect-http-dynamic",
      type: "wifi_connect",
      fields: { SSID: "red", PASSWORD: "12345678" },
    });
    const setBlock = createBlock({
      id: "set-http-response-dynamic",
      type: "variables_set_dynamic",
      fields: { VAR: "var-http-response-dynamic" },
      inputs: {
        VALUE: createBlock({
          id: "http-get-value-dynamic",
          type: "wifi_http_get_text",
          inputs: {
            URL: createBlock({ id: "http-url-dynamic", type: "string", fields: { STRING: "https://example.com" } }),
          },
          outputConnected: true,
        }),
      },
    });
    connect.getNextBlock = () => setBlock;
    const workspace = createWorkspace([connect], { "var-http-response-dynamic": "respuesta_http" });

    analyzer.analyze(workspace as never);

    expect(analyzer.getSymbolTableRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "respuesta_http",
          type: "string",
          initialized: true,
        }),
      ])
    );
  });

  it("traduce los mensajes semanticos segun el idioma activo", async () => {
    await i18n.changeLanguage("en");

    const analyzer = new ArduinoSemanticAnalyzer();
    const localIp = createBlock({
      id: "wifi-ip-en",
      type: "wifi_local_ip",
      outputConnected: true,
    });
    const workspace = createWorkspace([localIp]);

    analyzer.analyze(workspace as never);

    expect(localIp.warningText).toContain(
      "You must connect WiFi or create an access point before querying this data"
    );

    await i18n.changeLanguage("es");
  });
});

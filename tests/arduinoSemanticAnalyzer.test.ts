import { describe, expect, it} from "vitest";
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
        active: true,
        name: "led",
        type: "number",
        value: 5,
        initialized: true,
        used: true,
        scopeLevel: 0,
        scopeId: 0,
        scopeKind: "global",
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

  it("marca variables_set_dynamic no usadas", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const setDynamicBlock = createBlock({
      id: "set-dynamic-unused",
      type: "variables_set_dynamic",
      fields: { VAR: "var-dynamic-unused" },
      inputs: {
        VALUE: createBlock({ id: "dynamic-num", type: "math_number", fields: { NUM: "7" } }),
      },
    });
    const workspace = createWorkspace([setDynamicBlock], { "var-dynamic-unused": "dinamica" });

    analyzer.analyze(workspace as never);

    expect(setDynamicBlock.warningText).toContain("Variable declarada pero no utilizada");
  });

  it("marca variables locales no usadas aunque su scope ya se haya cerrado", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const localSet = createBlock({
      id: "local-set-unused",
      type: "variables_set",
      fields: { VAR: "var-local-unused" },
      inputs: {
        VALUE: createBlock({ id: "local-value", type: "math_number", fields: { NUM: "11" } }),
      },
    });
    const ifBlock = createBlock({
      id: "if-local-unused",
      type: "if",
      inputs: {
        CONDITION: createBlock({ id: "if-cond", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
        IF_BODY: localSet,
      },
    });
    const workspace = createWorkspace([ifBlock], { "var-local-unused": "temporal" });

    analyzer.analyze(workspace as never);

    expect(localSet.warningText).toContain("Variable declarada pero no utilizada");
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
      type: "logic_equal",
      inputs: {
        A: createBlock({ id: "eq-left", type: "math_number", fields: { NUM: "2" } }),
        B: createBlock({ id: "eq-right", type: "string", fields: { STRING: "2" } }),
      },
    });
    const workspace = createWorkspace([andBlock, greaterBlock, equalsBlock]);

    analyzer.analyze(workspace as never);

    expect(andBlock.warningText).toBeNull();
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

  it("actualiza una variable booleana negada dentro de while sin duplicar la visita del cuerpo", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const initialValue = createBlock({
      id: "bool-initial",
      type: "logic_boolean",
      fields: { BOOL: "FALSE" },
    });
    const setInitial = createBlock({
      id: "set-initial-not",
      type: "variables_set",
      fields: { VAR: "var-respuesta-not" },
      inputs: { VALUE: initialValue },
    });
    const conditionGet = createBlock({
      id: "get-condition-not",
      type: "variables_get",
      fields: { VAR: "var-respuesta-not" },
      outputConnected: true,
    });
    const negatedValue = createBlock({
      id: "not-value",
      type: "logic_not",
      inputs: {
        BOOL: createBlock({
          id: "get-negated-not",
          type: "variables_get",
          fields: { VAR: "var-respuesta-not" },
          outputConnected: true,
        }),
      },
      outputConnected: true,
    });
    const setInsideWhile = createBlock({
      id: "set-inside-while",
      type: "variables_set",
      fields: { VAR: "var-respuesta-not" },
      inputs: { VALUE: negatedValue },
    });
    const whileBlock = createBlock({
      id: "while-negates-once",
      type: "while_repeat",
      inputs: {
        CONDITION: conditionGet,
        BODY: setInsideWhile,
      },
    });
    setInitial.getNextBlock = () => whileBlock;
    const workspace = createWorkspace([setInitial], { "var-respuesta-not": "respuesta_not" });

    analyzer.analyze(workspace as never);

    expect(analyzer.getSymbolTableRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "respuesta_not",
          type: "boolean",
          value: true,
        }),
      ])
    );
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

  it("advierte reinicializaciones conflictivas de NeoPixel, display, DHT y servidor web", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const neopixelInitA = createBlock({
      id: "neo-init-a",
      type: "esp32_neopixel_init",
      fields: { PIN: "4", COUNT: "5" },
    });
    const neopixelInitB = createBlock({
      id: "neo-init-b",
      type: "esp32_neopixel_init",
      fields: { PIN: "15", COUNT: "8" },
    });
    const displayInitA = createBlock({
      id: "display-init-a",
      type: "esp32_display_init",
      fields: { SDA: "21", SCL: "22" },
    });
    const displayInitB = createBlock({
      id: "display-init-b",
      type: "esp32_display_init",
      fields: { SDA: "18", SCL: "19" },
    });
    const dhtInitA = createBlock({
      id: "dht-init-a",
      type: "esp32_dht_init",
      fields: { PIN: "4", TYPE: "DHT11" },
    });
    const dhtInitB = createBlock({
      id: "dht-init-b",
      type: "esp32_dht_init",
      fields: { PIN: "16", TYPE: "DHT22" },
    });
    const wifiConnect = createBlock({
      id: "wifi-connect-server",
      type: "wifi_connect",
      fields: { SSID: "red", PASSWORD: "12345678" },
    });
    const webServerA = createBlock({
      id: "web-server-a",
      type: "wifi_start_web_server",
      fields: { PORT: "80", PATH: "/" },
      inputs: {
        CONTENT: createBlock({ id: "web-content-a", type: "string", fields: { STRING: "ok" } }),
      },
    });
    const webServerB = createBlock({
      id: "web-server-b",
      type: "wifi_start_web_server",
      fields: { PORT: "8080", PATH: "/status" },
      inputs: {
        CONTENT: createBlock({ id: "web-content-b", type: "string", fields: { STRING: "ready" } }),
      },
    });
    wifiConnect.getNextBlock = () => webServerA;
    webServerA.getNextBlock = () => webServerB;
    const workspace = createWorkspace([
      neopixelInitA,
      neopixelInitB,
      displayInitA,
      displayInitB,
      dhtInitA,
      dhtInitB,
      wifiConnect,
    ]);

    analyzer.analyze(workspace as never);

    expect(neopixelInitB.warningText).toContain("Ya inicializaste NeoPixel con otra configuracion");
    expect(displayInitB.warningText).toContain("Ya inicializaste el display con otros pines");
    expect(dhtInitB.warningText).toContain("Ya inicializaste el sensor DHT con otra configuracion");
    expect(webServerB.warningText).toContain("Ya iniciaste un servidor web en otro puerto");
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

  it("registra variables de Codey desde pulse_button y mensaje infrarrojo recibido", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const setButton = createBlock({
      id: "set-codey-button",
      type: "variables_set",
      fields: { VAR: "var-codey-button" },
      inputs: {
        VALUE: createBlock({
          id: "pulse-button-value",
          type: "pulse_button",
          fields: { BUTTON: "A" },
          outputConnected: true,
        }),
      },
    });
    const setIrMessage = createBlock({
      id: "set-codey-ir",
      type: "variables_set",
      fields: { VAR: "var-codey-ir" },
      inputs: {
        VALUE: createBlock({
          id: "receive-ir-value",
          type: "codey_receive_message_infrarred",
          outputConnected: true,
        }),
      },
    });
    setButton.getNextBlock = () => setIrMessage;
    const workspace = createWorkspace([setButton], {
      "var-codey-button": "boton_presionado",
      "var-codey-ir": "mensaje_ir",
    });

    analyzer.analyze(workspace as never);

    expect(analyzer.getSymbolTableRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "boton_presionado",
          type: "boolean",
          value: false,
          initialized: true,
        }),
        expect.objectContaining({
          name: "mensaje_ir",
          type: "string",
          value: "",
          initialized: true,
        }),
      ])
    );
  });

  it("registra variables de sensores adicionales de Codey con el tipo correcto", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const setPotentiometer = createBlock({
      id: "set-codey-potentiometer",
      type: "variables_set",
      fields: { VAR: "var-codey-potentiometer" },
      inputs: {
        VALUE: createBlock({
          id: "codey-potentiometer-value",
          type: "codey_potentiometer_value",
          outputConnected: true,
        }),
      },
    });
    const setTilt = createBlock({
      id: "set-codey-tilt",
      type: "variables_set",
      fields: { VAR: "var-codey-tilt" },
      inputs: {
        VALUE: createBlock({
          id: "codey-tilt-value",
          type: "codey_is_tilted",
          fields: { DIRECTION: "LEFT" },
          outputConnected: true,
        }),
      },
    });
    const setRotation = createBlock({
      id: "set-codey-rotation",
      type: "variables_set",
      fields: { VAR: "var-codey-rotation" },
      inputs: {
        VALUE: createBlock({
          id: "codey-rotation-value",
          type: "codey_rotation_angle",
          fields: { AXIS: "x" },
          outputConnected: true,
        }),
      },
    });
    setPotentiometer.getNextBlock = () => setTilt;
    setTilt.getNextBlock = () => setRotation;
    const workspace = createWorkspace([setPotentiometer], {
      "var-codey-potentiometer": "potenciometro",
      "var-codey-tilt": "inclinado",
      "var-codey-rotation": "rotacion",
    });

    analyzer.analyze(workspace as never);

    expect(analyzer.getSymbolTableRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "potenciometro",
          type: "number",
          value: 0,
          initialized: true,
        }),
        expect.objectContaining({
          name: "inclinado",
          type: "boolean",
          value: false,
          initialized: true,
        }),
        expect.objectContaining({
          name: "rotacion",
          type: "number",
          value: 0,
          initialized: true,
        }),
      ])
    );
  });

  it("registra variables de temporizador y sensores frontales de Rocky con el tipo correcto", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const setTimer = createBlock({
      id: "set-codey-timer",
      type: "variables_set",
      fields: { VAR: "var-codey-timer" },
      inputs: {
        VALUE: createBlock({
          id: "codey-timer-value",
          type: "codey_timer",
          outputConnected: true,
        }),
      },
    });
    const setObstacle = createBlock({
      id: "set-rocky-obstacle",
      type: "variables_set",
      fields: { VAR: "var-rocky-obstacle" },
      inputs: {
        VALUE: createBlock({
          id: "rocky-obstacle-value",
          type: "rocky_is_obstacle_ahead",
          outputConnected: true,
        }),
      },
    });
    const setGreyness = createBlock({
      id: "set-rocky-greyness",
      type: "variables_set",
      fields: { VAR: "var-rocky-greyness" },
      inputs: {
        VALUE: createBlock({
          id: "rocky-greyness-value",
          type: "rocky_greyness",
          outputConnected: true,
        }),
      },
    });
    setTimer.getNextBlock = () => setObstacle;
    setObstacle.getNextBlock = () => setGreyness;
    const workspace = createWorkspace([setTimer], {
      "var-codey-timer": "temporizador_codey",
      "var-rocky-obstacle": "obstaculo",
      "var-rocky-greyness": "gris",
    });

    analyzer.analyze(workspace as never);

    expect(analyzer.getSymbolTableRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "temporizador_codey",
          type: "number",
          value: 0,
          initialized: true,
        }),
        expect.objectContaining({
          name: "obstaculo",
          type: "boolean",
          value: false,
          initialized: true,
        }),
        expect.objectContaining({
          name: "gris",
          type: "number",
          value: 0,
          initialized: true,
        }),
      ])
    );
  });

  it("sugiere completar el mensaje infrarrojo de Codey cuando esta vacio", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const sendIr = createBlock({
      id: "codey-send-empty",
      type: "codey_send_message_infrarred",
      inputs: {
        VALUE: createBlock({ id: "codey-send-empty-value", type: "string", fields: { STRING: "" } }),
      },
    });
    const workspace = createWorkspace([sendIr]);

    analyzer.analyze(workspace as never);

    expect(sendIr.warningText).toContain("El mensaje infrarrojo no deberia estar vacio");
  });

  it("reporta error si se intenta enviar una senal IR aprendida sin grabarla antes", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const sendLearned = createBlock({
      id: "codey-send-learned",
      type: "send_signal_infrarred_controller_distance",
    });
    const workspace = createWorkspace([sendLearned]);

    analyzer.analyze(workspace as never);

    expect(sendLearned.warningText).toContain(
      "Debes grabar primero una senal infrarroja del control antes de enviarla"
    );
  });

  it("sugiere no duplicar la espera de conexion con Rocky en el mismo flujo", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const connectRockyA = createBlock({
      id: "codey-rocky-a",
      type: "codey_connect_rocky",
    });
    const connectRockyB = createBlock({
      id: "codey-rocky-b",
      type: "codey_connect_rocky",
    });
    connectRockyA.getNextBlock = () => connectRockyB;
    const workspace = createWorkspace([connectRockyA]);

    analyzer.analyze(workspace as never);

    expect(connectRockyB.warningText).toContain(
      "Ya agregaste una espera de conexion con Rocky en este flujo"
    );
  });

  it("sugiere conectar Rocky antes de usar bloques de movimiento", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const moveBlock = createBlock({
      id: "rocky-forward-no-connect",
      type: "rocky_forward_for",
      fields: { POWER: "50", SECONDS: "1" },
    });
    const workspace = createWorkspace([moveBlock]);

    analyzer.analyze(workspace as never);

    expect(moveBlock.warningText).toContain(
      "Conviene conectar a Rocky antes de usar bloques de movimiento"
    );
  });

  it("advierte parametros invalidos en bloques de accion de Rocky", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const connectRocky = createBlock({
      id: "codey-rocky-connect-motion",
      type: "codey_connect_rocky",
    });
    const driveTimed = createBlock({
      id: "rocky-forward-invalid",
      type: "rocky_forward_for",
      fields: { POWER: "0", SECONDS: "0" },
    });
    const turnByAngle = createBlock({
      id: "rocky-turn-invalid",
      type: "rocky_turn_left_degree",
      fields: { ANGLE: "0" },
    });
    const driveWheels = createBlock({
      id: "rocky-drive-invalid",
      type: "rocky_drive_power",
      fields: { LEFT_POWER: "120", RIGHT_POWER: "-150" },
    });
    connectRocky.getNextBlock = () => driveTimed;
    driveTimed.getNextBlock = () => turnByAngle;
    turnByAngle.getNextBlock = () => driveWheels;
    const workspace = createWorkspace([connectRocky]);

    analyzer.analyze(workspace as never);

    expect(driveTimed.warningText).toContain("La potencia de Rocky deberia ser distinta de 0");
    expect(driveTimed.warningText).toContain("El tiempo de movimiento de Rocky deberia ser mayor que 0");
    expect(turnByAngle.warningText).toContain("Los grados de giro de Rocky deberian ser mayores que 0");
    expect(driveWheels.warningText).toContain("La potencia de Rocky deberia estar entre -100 y 100");
  });

  it("registra volumen actual de Codey como numero", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const setVolume = createBlock({
      id: "set-codey-current-volume",
      type: "variables_set",
      fields: { VAR: "var-codey-current-volume" },
      inputs: {
        VALUE: createBlock({
          id: "codey-current-volume-value",
          type: "codey_current_volume",
          outputConnected: true,
        }),
      },
    });
    const workspace = createWorkspace([setVolume], {
      "var-codey-current-volume": "volumen_actual",
    });

    analyzer.analyze(workspace as never);

    expect(analyzer.getSymbolTableRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "volumen_actual",
          type: "number",
          value: 0,
          initialized: true,
        }),
      ])
    );
  });

  it("advierte parametros invalidos en bloques de altavoz de Codey", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const playNote = createBlock({
      id: "codey-note-invalid",
      type: "codey_play_note",
      fields: { NOTE: "C4", BEAT: "0" },
    });
    const playTone = createBlock({
      id: "codey-tone-invalid",
      type: "codey_play_tone",
      fields: { FREQUENCY: "6000", SECONDS: "0" },
    });
    const changeVolume = createBlock({
      id: "codey-change-volume-zero",
      type: "codey_change_volume",
      fields: { DELTA: "0" },
    });
    playNote.getNextBlock = () => playTone;
    playTone.getNextBlock = () => changeVolume;
    const workspace = createWorkspace([playNote]);

    analyzer.analyze(workspace as never);

    expect(playNote.warningText).toContain("La duracion en tiempos deberia ser mayor que 0");
    expect(playTone.warningText).toContain("La frecuencia deberia estar entre 0 y 5000 Hz");
    expect(playTone.warningText).toContain("La duracion del tono deberia ser mayor que 0");
    expect(changeVolume.warningText).toContain("Cambiar el volumen en 0 no produce ningun cambio");
  });

  it("advierte parametros invalidos en bloques de iluminacion de Codey", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const ledTimed = createBlock({
      id: "codey-led-timed-invalid",
      type: "codey_led_rgb_for",
      fields: { COLOR: "#ff0000", SECONDS: "0" },
    });
    const ledComponent = createBlock({
      id: "codey-led-component-invalid",
      type: "codey_led_component",
      fields: { COMPONENT: "red", VALUE: "0" },
    });
    ledTimed.getNextBlock = () => ledComponent;
    const workspace = createWorkspace([ledTimed]);

    analyzer.analyze(workspace as never);

    expect(ledTimed.warningText).toContain("La duracion de la luz deberia ser mayor que 0");
    expect(ledComponent.warningText).toContain(
      "Ese valor de LED es 0. Si quieres apagarlo, conviene usar el bloque de apagar"
    );
  });

  it("sugiere conectar Rocky antes de usar sensores o luces de Rocky", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const rockySensor = createBlock({
      id: "rocky-sensor-no-connect",
      type: "rocky_is_obstacle_ahead",
      outputConnected: false,
    });
    const rockyLight = createBlock({
      id: "rocky-light-no-connect",
      type: "rocky_light_color",
      fields: { COLOR: "red" },
    });
    rockySensor.getNextBlock = () => rockyLight;
    const workspace = createWorkspace([rockySensor]);

    analyzer.analyze(workspace as never);

    expect(rockySensor.warningText).toContain(
      "Conviene conectar a Rocky antes de usar bloques de sensores o luces de Rocky"
    );
    expect(rockyLight.warningText).toContain(
      "Conviene conectar a Rocky antes de usar bloques de sensores o luces de Rocky"
    );
  });

  it("advierte texto vacio y coordenadas invalidas en apariencia de Codey", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const showText = createBlock({
      id: "codey-show-text-empty",
      type: "codey_show_text",
      fields: { TEXT: "" },
    });
    const showImageAt = createBlock({
      id: "codey-show-image-at-invalid",
      type: "codey_show_image_at",
      fields: { IMAGE: "0066660000000000", X: "20", Y: "10" },
    });
    const getPixel = createBlock({
      id: "codey-get-pixel-invalid",
      type: "codey_get_pixel",
      fields: { X: "20", Y: "9" },
      outputConnected: false,
    });
    showText.getNextBlock = () => showImageAt;
    showImageAt.getNextBlock = () => getPixel;
    const workspace = createWorkspace([showText]);

    analyzer.analyze(workspace as never);

    expect(showText.warningText).toContain("El texto de la pantalla no deberia estar vacio");
    expect(showImageAt.warningText).toContain(
      "La posicion x/y de imagen o texto deberia mantenerse dentro del rango visible"
    );
    expect(getPixel.warningText).toContain(
      "Las coordenadas del pixel deberian estar entre x 0-15 e y 0-7"
    );
  });

  it("detecta repeticiones y no-op en bloques de Codey Rocky", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const emotionA = createBlock({
      id: "codey-emotion-smile-a",
      type: "codey_emotion_smile",
    });
    const emotionB = createBlock({
      id: "codey-emotion-smile-b",
      type: "codey_emotion_smile",
    });
    const ledA = createBlock({
      id: "codey-led-black",
      type: "codey_led_rgb",
      fields: { COLOR: "#000000" },
    });
    const ledB = createBlock({
      id: "codey-led-black-repeat",
      type: "codey_led_rgb",
      fields: { COLOR: "#000000" },
    });
    const stopA = createBlock({
      id: "rocky-stop-a",
      type: "rocky_stop",
    });
    const stopB = createBlock({
      id: "rocky-stop-b",
      type: "rocky_stop",
    });
    const resetTimerA = createBlock({
      id: "codey-reset-timer-a",
      type: "codey_reset_timer",
    });
    const resetTimerB = createBlock({
      id: "codey-reset-timer-b",
      type: "codey_reset_timer",
    });
    emotionA.getNextBlock = () => emotionB;
    emotionB.getNextBlock = () => ledA;
    ledA.getNextBlock = () => ledB;
    ledB.getNextBlock = () => stopA;
    stopA.getNextBlock = () => stopB;
    stopB.getNextBlock = () => resetTimerA;
    resetTimerA.getNextBlock = () => resetTimerB;
    const workspace = createWorkspace([emotionA]);

    analyzer.analyze(workspace as never);

    expect(emotionB.warningText).toContain(
      "Ese bloque repite la misma expresion o pantalla que el anterior y puede no producir un cambio visible"
    );
    expect(ledA.warningText).toContain(
      "Ese color equivale a apagar el LED. Conviene usar el bloque de apagar"
    );
    expect(ledB.warningText).toContain(
      "Ese bloque repite el mismo estado de luz que el anterior y puede no producir un cambio visible"
    );
    expect(stopB.warningText).toContain("Rocky ya estaba detenido por el bloque anterior");
    expect(resetTimerB.warningText).toContain("Ya reiniciaste el temporizador de Codey en este flujo");
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

import i18n from "../../../i18n";

const FIXED_MESSAGE_KEYS: Record<string, string> = {
  "Debes inicializar la tira NeoPixel antes de controlar sus LEDs": "semanticNeopixelInitRequired",
  "Debes inicializar el display antes de mostrar o limpiar contenido": "semanticDisplayInitRequired",
  "El SSID no debería estar vacío": "semanticWifiSsidEmpty",
  "La contraseña WiFi no debería estar vacía": "semanticWifiPasswordEmpty",
  "La contraseña WiFi debería tener al menos 8 caracteres": "semanticWifiPasswordShort",
  "Ya configuraste un punto de acceso. Evita mezclar modo AP y conexion WiFi cliente en el mismo flujo": "semanticWifiApAlreadyConfigured",
  "Ya existe una conexion WiFi cliente previa en este flujo": "semanticWifiClientAlreadyConfigured",
  "El SSID del punto de acceso no debería estar vacío": "semanticWifiApSsidEmpty",
  "La contraseña del punto de acceso no debería estar vacía": "semanticWifiApPasswordEmpty",
  "La contraseña del punto de acceso debería tener al menos 8 caracteres": "semanticWifiApPasswordShort",
  "Ya configuraste una conexion WiFi cliente. Evita mezclar modo cliente y punto de acceso en el mismo flujo": "semanticWifiClientMixedWithAp",
  "Ya existe un punto de acceso configurado en este flujo": "semanticWifiApAlreadyExists",
  "No puedes desconectar WiFi si antes no conectaste o creaste un punto de acceso": "semanticWifiDisconnectWithoutConnect",
  "Conviene conectar WiFi o crear un punto de acceso antes de iniciar el servidor web": "semanticWifiServerBeforeConnect",
  "No hay una conexion WiFi activa para iniciar el servidor web": "semanticWifiServerWithoutConnection",
  "La intensidad de señal solo esta disponible cuando hay una conexion WiFi cliente activa": "semanticWifiRssiRequiresClient",
  "Debes conectar WiFi o crear un punto de acceso antes de consultar este dato": "semanticWifiDataRequiresSetup",
  "No hay una conexion WiFi activa para consultar este dato": "semanticWifiDataRequiresConnection",
  "Debes iniciar el servidor web antes de consultar la ruta solicitada": "semanticWifiWebRequiresServer",
  "Debes conectar WiFi o crear un punto de acceso antes de hacer peticiones HTTP": "semanticWifiHttpRequiresConnection",
  "En content-type normalmente va algo como application/json o text/plain": "semanticWifiHttpContentTypeSuggestion",
  "En content-type no va el metodo HTTP. Usa valores como application/json o text/plain": "semanticWifiHttpContentTypeInvalid",
  "Debes inicializar el sensor DHT antes de leer temperatura o humedad": "semanticDhtInitRequired",
  "Debes conectar o inicializar el servo antes de moverlo": "semanticServoAttachRequired",
  "El servo se conectara automaticamente en ese pin. Puedes omitir el bloque de conectar servo si quieres": "semanticUnoServoAutoAttach",
  "Los pines 0 y 1 en Arduino Uno se usan tambien para Serial. Evita usarlos si trabajas con puerto serie": "semanticUnoSerialPinsReserved",
  "TRIG y ECHO no deberian usar el mismo pin": "semanticUltrasonicPinsSame",
  "En mapear, el rango de origen no debe tener el mismo inicio y fin": "semanticUnoMapRangeZero",
  "El codigo ASCII deberia estar entre 0 y 255": "semanticUnoAsciiOutOfRange",
  "Conviene usar al menos un caracter para convertir a ASCII": "semanticUnoCharEmpty",
  "Ese valor ya es entero; convertirlo de nuevo no cambia el resultado": "semanticUnoIntAlreadyInteger",
  "TRIG y ECHO no deberían usar el mismo pin": "semanticUltrasonicPinsSame",
  "La condición del mientras debe ser true/false": "semanticDoWhileBooleanRequired",
  "Los valores del 'mientras' deben ser numéricos": "semanticForRangeNumericRequired",
  "Los operadores matemáticos requieren valores numéricos": "semanticMathNumericRequired",
  "No se puede realizar una división por cero": "semanticDivideByZero",
  "Los operadores AND/OR deben usar valores booleanos": "semanticLogicAndOrBooleanRequired",
  "El operador NOT solo funciona con booleanos": "semanticLogicNotBooleanRequired",
  "Las comparaciones < y > deben usar números ": "semanticLogicComparisonNumericRequired",
  "Estás comparando valores de distinto tipo": "semanticLogicCompareDifferentTypes",
  "La condición del si está vacía": "semanticIfConditionEmpty",
  "La condición del si debe ser booleana": "semanticIfConditionBooleanRequired",
  "El cuerpo del si está vacío": "semanticIfBodyEmpty",
  "El cuerpo del entonces está vacío.": "semanticIfThenBodyEmpty",
  "El cuerpo del sino está vacío": "semanticIfElseBodyEmpty",
  "La condición del mientras está vacía.": "semanticWhileConditionEmpty",
  "La condición del mientras debe ser booleana": "semanticWhileConditionBooleanRequired",
  "El cuerpo del mientras está vacío": "semanticWhileBodyEmpty",
  "El cuerpo de hacer no debe estar vacío.": "semanticDoWhileBodyEmpty",
  "La condición de mientras no debe estar vacía.": "semanticDoWhileConditionEmpty",
  "'de' debe llevar un entero": "semanticForFromIntegerRequired",
  "'to' debe llevar un entero": "semanticForToIntegerRequired",
  "el cuerpo de 'hacer' no debe estar vacío.": "semanticForBodyEmpty",
  "El resultado de la resta será negativo": "semanticSubtractNegativeResult",
  "Dividir por 1 no cambia su valor": "semanticDivideByOne",
  "Dividir una variable por sí misma siempre da 1": "semanticDivideSameVariable",
  "Sumar 0 a 0 no cambia su valor": "semanticAddZeroZero",
  "Sumar 0 a una variable no cambia su valor": "semanticAddZeroVariable",
  "Multiplicar por 0 siempre da 0": "semanticMultiplyByZero",
  "Multiplicar con 1 siempre da su mismo valor": "semanticMultiplyByOne",
  "Restar 0 con 0 no cambia su valor": "semanticSubtractZeroZero",
  "Restar 0 a una variable no cambia su valor": "semanticSubtractZeroVariable",
  "El resultado de esta expresión no se utiliza": "semanticExpressionUnused",
  "Variable no declarada": "semanticVariableUndeclared",
  "Variable no inicializada": "semanticVariableUninitialized",
  "Variable declarada pero no utilizada": "semanticVariableUnused",
};

type DynamicTranslation = {
  regex: RegExp;
  key: string;
  map: (match: RegExpExecArray) => Record<string, string>;
};

const DYNAMIC_TRANSLATIONS: DynamicTranslation[] = [
  {
    regex: /^Variable duplicada: (.+)$/u,
    key: "semanticVariableDuplicate",
    map: (match) => ({ name: match[1] }),
  },
  {
    regex: /^Tipo incompatible\. Esperado: (.+), recibido: (.+)$/u,
    key: "semanticTypeMismatch",
    map: (match) => ({ expected: match[1], received: match[2] }),
  },
  {
    regex: /^Variable duplicada en FOR: (.+)$/u,
    key: "semanticForVariableDuplicate",
    map: (match) => ({ name: match[1] }),
  },
  {
    regex: /^El pin (.+) ya se usa como (.+)\. Revisa posibles conflictos de hardware\.$/u,
    key: "semanticPinConflict",
    map: (match) => ({ pin: match[1], mode: match[2] }),
  },
  {
    regex: /^El pin (.+) en ESP32 es solo de entrada y no puede configurarse como OUTPUT$/u,
    key: "semanticEsp32OutputOnlyPinMode",
    map: (match) => ({ pin: match[1] }),
  },
  {
    regex: /^El pin (.+) en ESP32 es solo de entrada y no sirve como salida digital$/u,
    key: "semanticEsp32OutputOnlyDigitalWrite",
    map: (match) => ({ pin: match[1] }),
  },
  {
    regex: /^El pin (.+) no suele ser valido para lectura analogica en ESP32$/u,
    key: "semanticEsp32InvalidAnalogReadPin",
    map: (match) => ({ pin: match[1] }),
  },
  {
    regex: /^El pin (.+) en ESP32 es solo de entrada y no sirve para PWM$/u,
    key: "semanticEsp32OutputOnlyPwm",
    map: (match) => ({ pin: match[1] }),
  },
  {
    regex: /^El pin (.+) en ESP32 es solo de entrada y no sirve para salida analoga por PWM$/u,
    key: "semanticEsp32OutputOnlyAnalogWrite",
    map: (match) => ({ pin: match[1] }),
  },
  {
    regex: /^El pin (.+) no tiene capacidad touch en ESP32$/u,
    key: "semanticEsp32InvalidTouchPin",
    map: (match) => ({ pin: match[1] }),
  },
  {
    regex: /^El pin (.+) en ESP32 es solo de entrada y no sirve para un servo$/u,
    key: "semanticEsp32OutputOnlyServo",
    map: (match) => ({ pin: match[1] }),
  },
  {
    regex: /^El pin (.+) en ESP32 es solo de entrada y no sirve para buzzer$/u,
    key: "semanticEsp32OutputOnlyBuzzer",
    map: (match) => ({ pin: match[1] }),
  },
];

export function translateSemanticMessage(message: string) {
  const normalizedMessage = message.trim();
  const directKey = FIXED_MESSAGE_KEYS[normalizedMessage];
  if (directKey) {
    return i18n.t(directKey);
  }

  for (const translation of DYNAMIC_TRANSLATIONS) {
    const match = translation.regex.exec(normalizedMessage);
    if (match) {
      return i18n.t(translation.key, translation.map(match));
    }
  }

  return normalizedMessage;
}

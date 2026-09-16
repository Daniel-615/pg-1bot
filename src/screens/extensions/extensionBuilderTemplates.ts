export type ExtensionBuilderTemplate = { id: string; name: string; description: string; blockName: string; code: string; parameters: Array<{ nombre: string; etiqueta: string }> };

export const extensionTemplates: ExtensionBuilderTemplate[] = [
  { id: "digital-write", name: "Escritura digital", description: "Controla un LED, relay o actuador digital.", blockName: "Escribir salida digital", code: "pinMode({{pin}}, OUTPUT);\ndigitalWrite({{pin}}, {{state}});", parameters: [{ nombre: "pin", etiqueta: "Pin" }, { nombre: "state", etiqueta: "Estado" }] },
  { id: "analog-read", name: "Lectura analógica", description: "Lee el valor actual de un sensor analógico.", blockName: "Leer sensor analógico", code: "analogRead({{pin}})", parameters: [{ nombre: "pin", etiqueta: "Pin" }] },
  { id: "tone", name: "Tono", description: "Reproduce una frecuencia en un buzzer.", blockName: "Reproducir tono", code: "tone({{pin}}, {{frequency}}, {{duration}});", parameters: [{ nombre: "pin", etiqueta: "Pin" }, { nombre: "frequency", etiqueta: "Frecuencia" }, { nombre: "duration", etiqueta: "Duración" }] },
];

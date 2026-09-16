import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Check, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import type { AuthUser } from "../../services/auth.service";
import type { BlockType, CatalogItem, ExtensionStatus } from "../../services/extensions.service";
import { useCreateBlock, useCreateBlockPlate, useCreateExtension, useCreateParameter } from "../../hooks/extensions/extensionsHook";
import { extensionTemplates } from "./extensionBuilderTemplates";

type Props = {
  user: AuthUser | null;
  statuses: ExtensionStatus[];
  blockTypes: BlockType[];
  blockStatuses: Array<{ id_estado_bloque: string; nombre: string }>;
  dataTypes: Array<{ id_tipo_dato: string; nombre: string }>;
  plates: CatalogItem[];
};

type ParameterDraft = { nombre: string; etiqueta: string; id_tipo_dato: string; requerido: boolean; orden: number };
function idFromResponse(value: unknown, names: string[]) {
  const data = (value as { data?: Record<string, unknown> })?.data;
  return names.map((name) => data?.[name]).find((id): id is string => typeof id === "string" && Boolean(id));
}

export function ExtensionBuilderWizard({ user, statuses, blockTypes, blockStatuses, dataTypes, plates }: Props) {
  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState(extensionTemplates[0].id);
  const [extensionName, setExtensionName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [blockName, setBlockName] = useState(extensionTemplates[0].blockName);
  const [blockDescription, setBlockDescription] = useState(extensionTemplates[0].description);
  const [blockTypeId, setBlockTypeId] = useState("");
  const [blockStatusId, setBlockStatusId] = useState("");
  const [parameters, setParameters] = useState<ParameterDraft[]>(extensionTemplates[0].parameters.map((item, index) => ({ ...item, id_tipo_dato: "", requerido: true, orden: index + 1 })));
  const [plateId, setPlateId] = useState("");
  const [code, setCode] = useState(extensionTemplates[0].code);
  const [libraries, setLibraries] = useState("#include <Arduino.h>");
  const [saving, setSaving] = useState(false);
  const createExtension = useCreateExtension();
  const createBlock = useCreateBlock();
  const createParameter = useCreateParameter();
  const createBlockPlate = useCreateBlockPlate();
  const numberType = dataTypes.find((item) => /numero|number|entero|int/i.test(item.nombre))?.id_tipo_dato ?? dataTypes[0]?.id_tipo_dato ?? "";

  const effectiveParameters = parameters.map((item) => item.id_tipo_dato ? item : { ...item, id_tipo_dato: numberType });

  const chooseTemplate = (id: string) => {
    const template = extensionTemplates.find((item) => item.id === id) ?? extensionTemplates[0];
    setTemplateId(template.id);
    setBlockName(template.blockName);
    setBlockDescription(template.description);
    setCode(template.code);
    setParameters(template.parameters.map((item, index) => ({ ...item, id_tipo_dato: numberType, requerido: true, orden: index + 1 })));
  };

  const valid = step === 1
    ? Boolean(extensionName.trim() && version.trim() && (user?.userId ?? user?.id))
    : step === 2
      ? Boolean(blockName.trim() && blockTypeId && blockStatusId)
      : step === 3
        ? Boolean(plateId && code.trim() && effectiveParameters.every((item) => item.etiqueta.trim() && item.id_tipo_dato))
        : true;

  const next = () => {
    if (!valid) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setStep((value) => Math.min(4, value + 1));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid || saving) return;
    const userId = user?.userId ?? user?.id;
    if (!userId) return;
    setSaving(true);
    try {
      const extension = await createExtension.mutateAsync({ nombre: extensionName.trim(), descripcion: description.trim() || undefined, version: version.trim(), id_usuario: userId, id_estado_extension: statuses[0]?.id_estado_extension ?? "" });
      const extensionId = idFromResponse(extension, ["id_extension", "id"]);
      if (!extensionId) throw new Error("No se pudo crear la extensión");
      const block = await createBlock.mutateAsync({ nombre: blockName.trim(), descripcion: blockDescription.trim() || undefined, id_extension: extensionId, id_tipo_bloque: blockTypeId, id_estado_bloque: blockStatusId, orden: 1 });
      const blockId = idFromResponse(block, ["id_bloque", "id"]);
      if (!blockId) throw new Error("No se pudo crear el bloque");
      for (const parameter of effectiveParameters) await createParameter.mutateAsync({ id_bloque: blockId, ...parameter });
      await createBlockPlate.mutateAsync({ id_bloque: blockId, id_placa: plateId, codigo_generado: code.trim(), codigo_setup: "", codigo_loop: code.includes("analogRead") ? "" : code.trim(), librerias_requeridas: libraries.trim() });
      toast.success("Extensión y bloque funcional creados correctamente");
      setStep(1);
      setExtensionName("");
      chooseTemplate(extensionTemplates[0].id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la extensión");
    } finally {
      setSaving(false);
    }
  };

  return <section className="extension-builder">
    <header className="extension-builder-heading"><div><span>CREADOR GUIADO</span><h2>Crea una extensión funcional</h2><p>Construye el bloque paso a paso y define el código que ejecutará en tu placa.</p></div><Zap size={32} /></header>
    <div className="extension-builder-steps">{["Identidad", "Bloque", "Entradas", "Revisar"].map((label, index) => <div className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} key={label}><b>{step > index + 1 ? <Check size={15} /> : index + 1}</b><span>{label}</span></div>)}</div>
    <form className="extension-builder-form" onSubmit={submit}>
      {step === 1 && <div className="builder-step">
        <label>Plantilla inicial<select value={templateId} onChange={(event) => chooseTemplate(event.target.value)}>{extensionTemplates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Nombre de la extensión<input value={extensionName} onChange={(event) => setExtensionName(event.target.value)} placeholder="Sensores y actuadores" /></label>
        <label>Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Qué agrega esta extensión al editor" /></label>
        <label>Versión<input value={version} onChange={(event) => setVersion(event.target.value)} /></label>
      </div>}
      {step === 2 && <div className="builder-step">
        <div className="builder-preview"><strong>{blockName || "Tu bloque"}</strong><span>{blockDescription}</span></div>
        <label>Nombre del bloque<input value={blockName} onChange={(event) => setBlockName(event.target.value)} /></label>
        <label>Descripción<textarea value={blockDescription} onChange={(event) => setBlockDescription(event.target.value)} /></label>
        <label>Tipo de bloque<select value={blockTypeId} onChange={(event) => setBlockTypeId(event.target.value)}><option value="">Selecciona un tipo</option>{blockTypes.map((item) => <option key={item.id_tipo_bloque} value={item.id_tipo_bloque}>{item.nombre}</option>)}</select></label>
        <label>Estado<select value={blockStatusId} onChange={(event) => setBlockStatusId(event.target.value)}><option value="">Selecciona un estado</option>{blockStatuses.map((item) => <option key={item.id_estado_bloque} value={item.id_estado_bloque}>{item.nombre}</option>)}</select></label>
      </div>}
      {step === 3 && <div className="builder-step">
        <h3>Entradas del bloque</h3>
        {parameters.map((item, index) => <div className="builder-parameter" key={item.nombre}><input value={item.etiqueta} onChange={(event) => setParameters((current) => current.map((parameter, itemIndex) => itemIndex === index ? { ...parameter, etiqueta: event.target.value } : parameter))} /><code>{item.nombre}</code><select value={item.id_tipo_dato || numberType} onChange={(event) => setParameters((current) => current.map((parameter, itemIndex) => itemIndex === index ? { ...parameter, id_tipo_dato: event.target.value } : parameter))}>{dataTypes.map((type) => <option key={type.id_tipo_dato} value={type.id_tipo_dato}>{type.nombre}</option>)}</select></div>)}
        <label>Placa compatible<select value={plateId} onChange={(event) => setPlateId(event.target.value)}><option value="">Selecciona una placa</option>{plates.map((item) => <option key={String(item.id_placa ?? item.id)} value={String(item.id_placa ?? item.id)}>{item.nombre}</option>)}</select></label>
        <label>Código generado<textarea className="code-input" value={code} onChange={(event) => setCode(event.target.value)} /></label>
        <label>Bibliotecas requeridas<input value={libraries} onChange={(event) => setLibraries(event.target.value)} placeholder="Wire.h, Servo.h o una por línea" /></label>
        <p className="builder-hint">Los nombres entre llaves se reemplazan con las entradas del bloque.</p>
      </div>}
      {step === 4 && <div className="builder-step builder-review"><h3>Revisa antes de insertar</h3><p><strong>Extensión:</strong> {extensionName}</p><p><strong>Bloque:</strong> {blockName}</p><p><strong>Entradas:</strong> {parameters.map((item) => item.etiqueta).join(", ") || "Sin entradas"}</p><pre>{code}</pre><p>Al confirmar se insertarán la extensión, el bloque, sus parámetros y su implementación para la placa seleccionada.</p></div>}
      <div className="builder-actions">{step > 1 && <button type="button" className="extension-secondary-btn" onClick={() => setStep((value) => value - 1)}><ChevronLeft size={16} /> Atrás</button>}{step < 4 ? <button type="button" className="extension-submit-btn" onClick={next}>Continuar <ChevronRight size={16} /></button> : <button type="submit" className="extension-submit-btn" disabled={saving}>{saving ? "Insertando..." : "Insertar extensión"}</button>}</div>
    </form>
  </section>;
}

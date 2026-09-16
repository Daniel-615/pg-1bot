import { memo, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Bot, Check, Cloud, Code2, Cpu, Gamepad2, Lightbulb, LoaderCircle, Monitor, Plus, Radio, Settings, Sparkles, Wifi, X, Zap, type LucideIcon } from "lucide-react";
import { toast } from "react-toastify";
import { getExamples, type CreateExampleInput, type StoredExample } from "../../services/examples.service";
import "../../styles/ExamplesPanel.css";

type ExamplesPanelProps = {
  board: string;
  canManageExamples: boolean;
  availableBlockTypes: string[];
  onSelectExample: (example: StoredExample) => void;
  onCreateExample: (input: CreateExampleInput) => Promise<StoredExample>;
  onAddBlock: (type: string) => void;
  onClose: () => void;
};

const boardLabels: Record<string, string> = {
  esp32: "ESP32",
  uno: "Arduino Uno",
  nano: "Arduino Nano",
  mega: "Arduino Mega",
  codey: "Codey",
};

const exampleIcons: Array<{ value: string; label: string; Icon: LucideIcon }> = [
  { value: "book-open", label: "Libro", Icon: BookOpen },
  { value: "lightbulb", label: "Idea", Icon: Lightbulb },
  { value: "wifi", label: "WiFi", Icon: Wifi },
  { value: "cpu", label: "Placa", Icon: Cpu },
  { value: "bot", label: "Robot", Icon: Bot },
  { value: "settings", label: "Configuración", Icon: Settings },
  { value: "zap", label: "Energía", Icon: Zap },
  { value: "radio", label: "Radio", Icon: Radio },
  { value: "gamepad", label: "Juego", Icon: Gamepad2 },
  { value: "code", label: "Código", Icon: Code2 },
  { value: "monitor", label: "Monitor", Icon: Monitor },
  { value: "cloud", label: "Nube", Icon: Cloud },
  { value: "sparkles", label: "Especial", Icon: Sparkles },
];

const iconByValue = new Map(exampleIcons.map((option) => [option.value, option.Icon]));

function renderExampleIcon(value: string) {
  const Icon = iconByValue.get(value);
  return Icon ? <Icon size={28} strokeWidth={1.8} aria-hidden="true" /> : value;
}

export const ExamplesPanel = memo(function ExamplesPanel({
  board,
  canManageExamples,
  availableBlockTypes,
  onSelectExample,
  onCreateExample,
  onAddBlock,
  onClose,
}: ExamplesPanelProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState(board);
  const [examples, setExamples] = useState<StoredExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState(availableBlockTypes[0] || "");
  const [form, setForm] = useState({ nombre: "", descripcion: "", icono: "book-open", dificultad: "beginner" as CreateExampleInput["dificultad"] });

  useEffect(() => {
    setFilter(board);
  }, [board]);

  useEffect(() => {
    if (!selectedBlockType && availableBlockTypes[0]) setSelectedBlockType(availableBlockTypes[0]);
  }, [availableBlockTypes, selectedBlockType]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getExamples()
      .then((items) => {
        if (active) setExamples(items);
      })
      .catch(() => {
        if (active) setExamples([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filteredExamples = examples.filter((example) => filter === "all" || example.placa === filter);
  const blockLabel = (type: string) => type.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await onCreateExample({ ...form, placa: board });
      setExamples((current) => [created, ...current]);
      setForm({ nombre: "", descripcion: "", icono: "book-open", dificultad: "beginner" });
      setFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el ejemplo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="examples-overlay" onClick={onClose}>
      <div className="examples-panel" onClick={(event) => event.stopPropagation()}>
        <div className="examples-header">
          <div>
            <h2>{t("examplesTitle")}</h2>
            <p>Proyectos guardados para cargar en tu espacio de trabajo</p>
          </div>
          <button className="examples-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>

        <div className="examples-toolbar">
          <div className="examples-filter-control" role="group" aria-label={t("examplesFilter")}>
            <span className="examples-filter-label">{t("examplesFilter")}</span>
            <div className="examples-filter-chips">
              <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{t("examplesAll")}</button>
              {Object.entries(boardLabels).map(([value, label]) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
          </div>
          {canManageExamples && <button className="examples-create-button" type="button" onClick={() => setFormOpen((open) => !open)}><Plus size={16} />Nuevo ejemplo</button>}
        </div>

        {formOpen && (
          <form className="examples-create-form" onSubmit={handleCreate}>
            <strong>Crear ejemplo para {boardLabels[board] || board}</strong>
            <div className="examples-main-fields">
              <label className="examples-field">
                <span>Nombre <em aria-hidden="true">*</em></span>
                <input required maxLength={120} placeholder="Nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              </label>
              <label className="examples-field">
                <span>Descripción</span>
                <input maxLength={500} placeholder="Descripción" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
              </label>
              <label className="examples-field">
                <span>Nivel</span>
                <select value={form.dificultad} onChange={(event) => setForm({ ...form, dificultad: event.target.value as CreateExampleInput["dificultad"] })}>
                  <option value="beginner">Principiante</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option>
                </select>
              </label>
            </div>
            <div className="examples-secondary-fields">
              <div className="examples-icon-field">
                <span>Icono SVG</span>
                <div className="examples-icon-picker" role="radiogroup" aria-label="Icono del ejemplo">
                  {exampleIcons.map(({ value, label, Icon }) => <button key={value} type="button" className={form.icono === value ? "selected" : ""} aria-label={label} aria-pressed={form.icono === value} onClick={() => setForm({ ...form, icono: value })}><Icon size={18} aria-hidden="true" /></button>)}
                </div>
              </div>
            </div>
            <div className="examples-block-picker">
              <label htmlFor="example-block-type">Agregar bloque al playground</label>
              <div>
                <select id="example-block-type" value={selectedBlockType} onChange={(event) => setSelectedBlockType(event.target.value)}>
                  {availableBlockTypes.map((type) => <option key={type} value={type}>{blockLabel(type)}</option>)}
                </select>
                <button type="button" onClick={() => selectedBlockType && onAddBlock(selectedBlockType)} disabled={!selectedBlockType}>Agregar bloque</button>
              </div>
            </div>
            <p className="examples-form-help">Se guardará el workspace actual como archivo JSON.</p>
            <button className="examples-save-button" disabled={saving} type="submit">{saving ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}Guardar ejemplo</button>
          </form>
        )}

        <div className="examples-grid">
          {loading ? <div className="examples-state"><LoaderCircle className="spin" />Cargando ejemplos...</div> : filteredExamples.map((example) => (
            <button key={example.id} className="example-card" onClick={() => onSelectExample(example)}>
              <span className="example-icon">{renderExampleIcon(example.icono || "book-open")}</span>
              <h3>{example.nombre}</h3>
              <p>{example.descripcion || "Sin descripción"}</p>
              <div className="example-tags"><span className={`example-board board-${example.placa}`}>{boardLabels[example.placa] || example.placa}</span><span className={`example-difficulty ${example.dificultad}`}>{example.dificultad}</span></div>
            </button>
          ))}
          {!loading && filteredExamples.length === 0 && <div className="examples-state">No hay ejemplos para esta placa.</div>}
        </div>
      </div>
    </div>
  );
});

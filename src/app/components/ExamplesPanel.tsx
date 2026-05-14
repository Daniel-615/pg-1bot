import { memo, useState, useEffect } from "react";
import i18n from "../../i18n";
import "./css/ExamplesPanel.css";

export type Example = {
  id: string;
  filename: string;
  folder: string;
  titleKey: string;
  descriptionKey: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  boards: string[];
};

export const EXAMPLES: Example[] = [
  {
    id: "esp32-led-blink",
    filename: "led-blink.json",
    folder: "esp32",
    titleKey: "exampleEsp32LedBlinkTitle",
    descriptionKey: "exampleEsp32LedBlinkDesc",
    difficulty: "beginner",
    icon: "💡",
    boards: ["esp32"]
  },
  {
    id: "esp32-wifi-display",
    filename: "wifi-display.json",
    folder: "esp32",
    titleKey: "exampleEsp32WifiDisplayTitle",
    descriptionKey: "exampleEsp32WifiDisplayDesc",
    difficulty: "intermediate",
    icon: "📶",
    boards: ["esp32"]
  },
  {
    id: "uno-led-blink",
    filename: "led-blink.json",
    folder: "arduinouno",
    titleKey: "exampleUnoLedBlinkTitle",
    descriptionKey: "exampleUnoLedBlinkDesc",
    difficulty: "beginner",
    icon: "🔵",
    boards: ["uno"]
  },
  {
    id: "uno-serial-monitor",
    filename: "serial-monitor.json",
    folder: "arduinouno",
    titleKey: "exampleUnoSerialTitle",
    descriptionKey: "exampleUnoSerialDesc",
    difficulty: "beginner",
    icon: "💻",
    boards: ["uno"]
  },
  {
    id: "nano-led-blink",
    filename: "led-blink.json",
    folder: "arduinonano",
    titleKey: "exampleNanoLedBlinkTitle",
    descriptionKey: "exampleNanoLedBlinkDesc",
    difficulty: "beginner",
    icon: "🔵",
    boards: ["nano"]
  },
  {
    id: "mega-led-blink",
    filename: "led-blink.json",
    folder: "arduinomega",
    titleKey: "exampleMegaLedBlinkTitle",
    descriptionKey: "exampleMegaLedBlinkDesc",
    difficulty: "beginner",
    icon: "🟣",
    boards: ["mega"]
  },
  {
    id: "codey-led-rgb",
    filename: "led-rgb.json",
    folder: "codey",
    titleKey: "exampleCodeyLedRgbTitle",
    descriptionKey: "exampleCodeyLedRgbDesc",
    difficulty: "beginner",
    icon: "🌈",
    boards: ["codey"]
  }
];

type ExamplesPanelProps = {
  board: string;
  onSelectExample: (exampleId: string) => void;
  onClose: () => void;
};

export function getExamplePath(example: Example): string {
  return `/examples/${example.folder}/${example.filename}`;
}

function getBoardLabel(board: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    esp32: t("exampleBoardEsp32"),
    uno: t("exampleBoardUno"),
    nano: t("exampleBoardNano"),
    mega: t("exampleBoardMega"),
    codey: t("exampleBoardCodey"),
  };
  return labels[board] || board;
}

function getDifficultyLabel(difficulty: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    beginner: t("exampleDifficultyBeginner"),
    intermediate: t("exampleDifficultyIntermediate"),
    advanced: t("exampleDifficultyAdvanced"),
  };
  return labels[difficulty] || difficulty;
}

export const ExamplesPanel = memo(function ExamplesPanel({
  board,
  onSelectExample,
  onClose
}: ExamplesPanelProps) {
  const [filter, setFilter] = useState<string>(board);

  const filteredExamples = EXAMPLES.filter(ex => 
    filter === "all" || ex.boards.includes(filter)
  );

  useEffect(() => {
    setFilter(board);
  }, [board]);

  const t = (key: string) => i18n.t(key);

  return (
    <div className="examples-overlay" onClick={onClose}>
      <div className="examples-panel" onClick={e => e.stopPropagation()}>
        <div className="examples-header">
          <h2>{t("examplesTitle")}</h2>
          <button className="examples-close" onClick={onClose}>✕</button>
        </div>

        <div className="examples-filter">
          <label>{t("examplesFilter")}</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">{t("examplesAll")}</option>
            <option value="esp32">{t("exampleBoardEsp32")}</option>
            <option value="uno">{t("exampleBoardUno")}</option>
            <option value="nano">{t("exampleBoardNano")}</option>
            <option value="mega">{t("exampleBoardMega")}</option>
            <option value="codey">{t("exampleBoardCodey")}</option>
          </select>
        </div>

        <div className="examples-grid">
          {filteredExamples.map(example => (
            <button
              key={example.id}
              className="example-card"
              onClick={() => onSelectExample(example.id)}
            >
              <span className="example-icon">{example.icon}</span>
              <h3>{t(example.titleKey)}</h3>
              <p>{t(example.descriptionKey)}</p>
              <div className="example-tags">
                {example.boards.map(b => (
                  <span key={b} className={`example-board board-${b}`}>{getBoardLabel(b, t)}</span>
                ))}
                <span className={`example-difficulty ${example.difficulty}`}>
                  {getDifficultyLabel(example.difficulty, t)}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="examples-footer">
          <p>{t("examplesTip")}</p>
        </div>
      </div>
    </div>
  );
});
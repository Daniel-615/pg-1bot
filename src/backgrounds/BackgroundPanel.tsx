import type { ChangeEvent } from "react";
import type * as Blockly from "blockly";
import {
  backgroundScenes,
  initialBackgroundState,
  playBackgroundProgram,
  type BackgroundActorState,
  type BackgroundScene,
} from "./runtime";
import "./BackgroundPanel.css";

type BackgroundPanelProps = {
  workspace: Blockly.Workspace | null;
  actor: BackgroundActorState;
  isRunning: boolean;
  setActor: (updater: BackgroundActorState | ((current: BackgroundActorState) => BackgroundActorState)) => void;
  setIsRunning: (value: boolean) => void;
};

type BackgroundStageProps = {
  actor: BackgroundActorState;
};

export function BackgroundStage({ actor }: BackgroundStageProps) {
  const customImageStyle =
    actor.scene === "custom" && actor.customImageUrl
      ? { backgroundImage: `url(${actor.customImageUrl})` }
      : undefined;

  return (
    <div className={`background-stage scene-${actor.scene}`} style={customImageStyle}>
      <div className="stage-grid" />

      {actor.message && <div className="robot-bubble">{actor.message}</div>}

      <div
        className={`background-robot ${actor.actor === "custom" ? "custom-actor" : ""}`}
        style={{
          transform: `translate(${actor.x}px, ${-actor.y}px) rotate(${actor.direction}deg)`,
        }}
      >
        {actor.actor === "custom" && actor.customActorUrl ? (
          <img src={actor.customActorUrl} alt="Personaje importado" />
        ) : (
          <>
            <div className="robot-antenna" />
            <div className="robot-head">
              <span />
              <span />
            </div>
            <div className="robot-body">1</div>
          </>
        )}
      </div>
    </div>
  );
}

export function BackgroundPanel({
  workspace,
  actor,
  isRunning,
  setActor,
  setIsRunning,
}: BackgroundPanelProps) {

  const handleSceneChange = (scene: BackgroundScene) => {
    setActor((current) => ({ ...current, scene }));
  };

  const handleImageImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = typeof reader.result === "string" ? reader.result : null;

      if (!imageUrl) {
        return;
      }

      setActor((current) => ({
        ...current,
        scene: "custom",
        customImageUrl: imageUrl,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleActorImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const actorUrl = typeof reader.result === "string" ? reader.result : null;

      if (!actorUrl) {
        return;
      }

      setActor((current) => ({
        ...current,
        actor: "custom",
        customActorUrl: actorUrl,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRun = async () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);

    const nextActor = await playBackgroundProgram(workspace, actor, (nextState) => {
      setActor(nextState);
    });

    setActor(nextActor);
    setIsRunning(false);
  };

  const handleReset = () => {
    if (isRunning) {
      return;
    }

    setActor((current) => ({
      ...initialBackgroundState,
      scene: current.scene,
      actor: current.actor,
      customImageUrl: current.customImageUrl,
      customActorUrl: current.customActorUrl,
    }));
  };

  return (
    <div className="background-panel">
      <div className="background-controls-panel">
        <label htmlFor="background-scene">Fondo</label>
        <select
          id="background-scene"
          value={actor.scene}
          onChange={(event) => handleSceneChange(event.target.value as BackgroundScene)}
        >
          {backgroundScenes.map((scene) => (
            <option key={scene.id} value={scene.id}>
              {scene.label}
            </option>
          ))}
        </select>

        <div className="background-position">
          <span>x: {Math.round(actor.x)}</span>
          <span>y: {Math.round(actor.y)}</span>
          <span>dir: {Math.round(actor.direction)}°</span>
        </div>

        <label className="import-background-btn" htmlFor="background-image-file">
          Importar imagen
        </label>
        <input
          id="background-image-file"
          className="background-file-input"
          type="file"
          accept="image/*"
          onChange={handleImageImport}
          disabled={isRunning}
        />

        <label className="import-background-btn" htmlFor="background-actor-file">
          Importar personaje SVG/imagen
        </label>
        <input
          id="background-actor-file"
          className="background-file-input"
          type="file"
          accept="image/*,.svg"
          onChange={handleActorImport}
          disabled={isRunning}
        />

        <button type="button" onClick={handleRun} disabled={isRunning}>
          {isRunning ? "Ejecutando..." : "Ejecutar bloques"}
        </button>
        <button type="button" className="secondary" onClick={handleReset} disabled={isRunning}>
          Reiniciar
        </button>

        <p>
          Al tocar <strong>Fondo</strong>, el editor muestra directamente los bloques del escenario.
          Empieza con <strong> al ejecutar fondo</strong>. Si importas una imagen, usa el bloque
          <strong> cambiar fondo a imagen importada</strong>. Si importas un personaje, usa
          <strong> cambiar personaje a personaje importado</strong>.
        </p>
      </div>
    </div>
  );
}

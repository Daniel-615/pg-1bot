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
  return (
    <div className={`background-stage scene-${actor.scene}`}>
      <div className="stage-grid" />

      {actor.message && <div className="robot-bubble">{actor.message}</div>}

      <div
        className="background-robot"
        style={{
          transform: `translate(${actor.x}px, ${-actor.y}px) rotate(${actor.direction}deg)`,
        }}
      >
        <div className="robot-antenna" />
        <div className="robot-head">
          <span />
          <span />
        </div>
        <div className="robot-body">1</div>
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

    setActor(initialBackgroundState);
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

        <button type="button" onClick={handleRun} disabled={isRunning}>
          {isRunning ? "Ejecutando..." : "Ejecutar bloques"}
        </button>
        <button type="button" className="secondary" onClick={handleReset} disabled={isRunning}>
          Reiniciar
        </button>

        <p>
          Al tocar <strong>Fondo</strong>, el editor muestra directamente los bloques del escenario.
          Empieza con <strong> al ejecutar fondo</strong>.
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import type * as Blockly from "blockly";
import { ArrowRight, Blocks, Check, ChevronRight, MousePointer2, X } from "lucide-react";
import "../../styles/GuidedTutorial.css";

type GuidedTutorialProps = {
  workspace: Blockly.Workspace | null;
  onComplete: () => void;
  onClose: () => void;
};

const tutorialSteps = [
  {
    eyebrow: "Paso 1 de 3",
    title: "Crea una variable",
    description: "Abre la categoría Variables y arrastra el bloque «establecer variable» al área de trabajo.",
    target: "variables",
  },
  {
    eyebrow: "Paso 2 de 3",
    title: "Imprime un mensaje",
    description: "Ahora abre Hardware y arrastra el bloque «imprimir» debajo de tu variable.",
    target: "print",
  },
  {
    eyebrow: "Paso 3 de 3",
    title: "Conecta la variable",
    description: "Vuelve a Variables, arrastra «obtener variable» y conéctalo dentro de la entrada de imprimir.",
    target: "connect",
  },
];

function hasConnectedVariable(workspace: Blockly.Workspace) {
  return workspace.getBlocksByType("print", false).some((printBlock) => {
    const input = printBlock.getInput("TEXT") ?? printBlock.inputList.find((item) => item.connection);
    return Boolean(input?.connection?.targetBlock()?.type === "variables_get");
  });
}

export function GuidedTutorial({ workspace, onComplete, onClose }: GuidedTutorialProps) {
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];

  useEffect(() => {
    if (!workspace) return;

    const updateTutorial = () => {
      const variableCreated = workspace.getBlocksByType("variables_set", false).length > 0;
      const printCreated = workspace.getBlocksByType("print", false).length > 0;
      const variableConnected = hasConnectedVariable(workspace);

      if (variableConnected) {
        setStep(3);
      } else if (printCreated) {
        setStep(2);
      } else if (variableCreated) {
        setStep(1);
      }
    };

    updateTutorial();
    workspace.addChangeListener(updateTutorial);
    return () => workspace.removeChangeListener(updateTutorial);
  }, [workspace]);

  useEffect(() => {
    let targets: Element[] = [];
    const refreshTargets = () => {
      targets.forEach((target) => target.classList.remove("guided-target"));
      targets = [];

      const toolboxRows = Array.from(document.querySelectorAll(".blocklyToolboxDiv .blocklyTreeRow"));
      const highlightedCategory = current?.target === "variables" || current?.target === "connect" ? toolboxRows[0] : toolboxRows[1];
      if (highlightedCategory) targets.push(highlightedCategory);

      const flyoutWorkspace = (workspace as Blockly.WorkspaceSvg | null)?.getFlyout()?.getWorkspace();
      const flyoutType = current?.target === "connect" ? "variables_get" : current?.target === "variables" ? "variables_set" : "print";
      const flyoutBlock = flyoutWorkspace?.getBlocksByType(flyoutType, false)[0];
      const flyoutRoot = (flyoutBlock as Blockly.BlockSvg | undefined)?.getSvgRoot();
      if (flyoutRoot) targets.push(flyoutRoot);
      targets.forEach((target) => target.classList.add("guided-target"));
    };

    refreshTargets();
    const observer = new MutationObserver(refreshTargets);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      targets.forEach((target) => target.classList.remove("guided-target"));
    };
  }, [current?.target, workspace]);

  const isComplete = step === 3;

  return (
    <aside className={`guided-tutorial ${isComplete ? "guided-tutorial-complete" : ""}`} aria-live="polite">
      <button className="guided-tutorial-close" type="button" onClick={onClose} aria-label="Cerrar tutorial"><X size={16} /></button>
      <div className="guided-tutorial-topline"><span className="guided-tutorial-icon">{isComplete ? <Check size={18} /> : <Blocks size={18} />}</span><span>{isComplete ? "¡Proyecto completado!" : "Proyecto guiado"}</span><span className="guided-tutorial-step">{isComplete ? "3 / 3" : current.eyebrow.replace("Paso ", "")}</span></div>
      <h2>{isComplete ? "Ya sabes crear y mostrar datos" : current.title}</h2>
      <p>{isComplete ? "Acabas de crear una variable y utilizarla dentro de un bloque de impresión. Ese es el patrón base de muchos proyectos." : current.description}</p>
      {!isComplete && <div className="guided-tutorial-hint"><MousePointer2 size={15} /><span>{current.target === "connect" ? "Suelta el bloque dentro de la entrada de texto" : "Arrastra desde la caja de herramientas"}</span></div>}
      {isComplete ? <button className="guided-tutorial-action" type="button" onClick={onComplete}>Explorar el editor <ArrowRight size={16} /></button> : <div className="guided-tutorial-dots">{tutorialSteps.map((item, index) => <span key={item.eyebrow} className={index <= step ? "is-active" : ""} />)}<ChevronRight size={14} /></div>}
      <button className="guided-tutorial-skip" type="button" onClick={onClose}>Salir del tutorial</button>
    </aside>
  );
}

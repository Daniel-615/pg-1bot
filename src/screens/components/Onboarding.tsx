import { ArrowRight, Blocks, Check, Cloud, Compass, Lightbulb, X } from "lucide-react";
import "../../styles/Onboarding.css";

type OnboardingProps = {
  step: number;
  onStepChange: (step: number) => void;
  onStartProject: () => void;
  onDismiss: () => void;
};

const steps = [
  {
    icon: Lightbulb,
    eyebrow: "Tu primer proyecto",
    title: "Aprende creando un semáforo",
    description: "Te guiaremos dentro del editor para construir un pequeño semáforo con bloques. No necesitas saber programación para comenzar.",
    action: "Comenzar guía",
  },
  {
    icon: Blocks,
    eyebrow: "Paso 1 de 2",
    title: "Conecta bloques como piezas",
    description: "Hemos preparado un proyecto con Arduino Uno. Explora el bloque de inicio y añade instrucciones desde la caja de herramientas.",
    action: "Ver el editor",
  },
  {
    icon: Cloud,
    eyebrow: "Paso 2 de 2",
    title: "Prueba y compila",
    description: "Puedes revisar el código generado, simularlo o compilarlo en la nube. Cuando quieras usar USB, instala el agente local.",
    action: "Terminar guía",
  },
];

export function Onboarding({ step, onStepChange, onStartProject, onDismiss }: OnboardingProps) {
  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLastStep = step === steps.length - 1;

  const handleAction = () => {
    if (step === 0) onStartProject();
    if (!isLastStep) {
      onStepChange(step + 1);
      return;
    }
    onDismiss();
  };

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <section className="onboarding-card">
        <button className="onboarding-close" type="button" onClick={onDismiss} aria-label="Cerrar guía">
          <X size={18} />
        </button>
        <div className="onboarding-progress" aria-label={`Paso ${step + 1} de ${steps.length}`}>
          {steps.map((item, index) => <span key={item.eyebrow} className={index <= step ? "is-active" : ""} />)}
        </div>
        <div className="onboarding-icon"><Icon size={28} /></div>
        <p className="onboarding-eyebrow">{currentStep.eyebrow}</p>
        <h2 id="onboarding-title">{currentStep.title}</h2>
        <p className="onboarding-description">{currentStep.description}</p>
        <div className="onboarding-preview">
          <div className="onboarding-preview-line"><span className="preview-check"><Check size={13} /></span><span>{step === 0 ? "Proyecto guiado listo para cargar" : "Proyecto semáforo · Arduino Uno"}</span></div>
          <div className="onboarding-preview-line"><span className="preview-check"><Check size={13} /></span><span>{step === 2 ? "Compilación en la nube disponible" : "Bloques visuales sin sintaxis"}</span></div>
        </div>
        <button className="onboarding-primary" type="button" onClick={handleAction}>{currentStep.action}<ArrowRight size={17} /></button>
        <button className="onboarding-skip" type="button" onClick={onDismiss}>{isLastStep ? "Cerrar guía" : "Explorar por mi cuenta"}</button>
        <div className="onboarding-footer"><Compass size={14} /> Explora cada paso a tu ritmo.</div>
      </section>
    </div>
  );
}

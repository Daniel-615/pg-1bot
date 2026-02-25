import { useEffect, useRef, useState } from "react";
import { createWorkspace } from "./core/blockEngine/workspaceManager";
import { compileArduino } from "./core/codeEngine/arduinoCompiler";

function App() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!blocklyDiv.current) return;

    const workspace = createWorkspace(blocklyDiv.current);

    workspace.addChangeListener(() => {
      const generated = compileArduino(workspace);
      setCode(generated);
    });

    return () => workspace.dispose();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "60%" }} ref={blocklyDiv} />
      <pre style={{ width: "40%", background: "#111", color: "#0f0" }}>
        {code}
      </pre>
    </div>
  );
}

export default App;
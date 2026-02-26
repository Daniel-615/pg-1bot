import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { createWorkspace } from "./core/blockEngine/workspaceManager";
import { compileArduino } from "./core/codeEngine/arduinoCompiler";

function App() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);

  const [code, setCode] = useState("");
  const [board, setBoard] = useState("esp32");

  useEffect(() => {
    if (!blocklyDiv.current) return;

    workspaceRef.current = createWorkspace(blocklyDiv.current);

    workspaceRef.current.addChangeListener(() => {
      if (!workspaceRef.current) return;

      const generated = compileArduino(workspaceRef.current, board);
      setCode(generated);
    });

    return () => {
      workspaceRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!workspaceRef.current) return;

    const generated = compileArduino(workspaceRef.current, board);
    setCode(generated);
  }, [board]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          padding: "10px",
          background: "#1e1e1e",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <label>Dispositivo:</label>
        <select
          value={board}
          onChange={(e) => setBoard(e.target.value)}
          style={{
            padding: "5px",
            borderRadius: "5px",
          }}
        >
          <option value="esp32">ESP32</option>
          <option value="uno">Arduino Uno</option>
        </select>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: "60%" }} ref={blocklyDiv} />
        <pre
          style={{
            width: "40%",
            background: "#111",
            color: "#0f0",
            padding: "15px",
            margin: 0,
            overflow: "auto",
          }}
        >
          {code}
        </pre>
      </div>
    </div>
  );
}

export default App;
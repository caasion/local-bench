import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      setModels(await invoke("get_models"))
    }

    loadModels();
  }, [])
  
  

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      {models.map(model => (
        <div>
          {model.name}
        </div>
      ))}
    </main>
  );
}

export default App;

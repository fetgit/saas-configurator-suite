import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAppConfigs } from "./scripts/initConfigs";

// Initialiser les configurations au démarrage
initAppConfigs();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
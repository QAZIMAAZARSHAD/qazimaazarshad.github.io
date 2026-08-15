import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { installConsoleEgg } from "@/lib/consoleEgg";
import "./index.css";

installConsoleEgg();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

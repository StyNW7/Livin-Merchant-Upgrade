// Must load first so the browser's install event is never missed.
import "./pwa/install";
import { startServiceWorker } from "./pwa/serviceWorker";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

startServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

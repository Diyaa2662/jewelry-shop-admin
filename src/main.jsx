import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.jsx";
import "./index.css";
import "./lib/i18n";

// DevExtreme CSS
import "devextreme/dist/css/dx.light.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" richColors />
  </React.StrictMode>,
);

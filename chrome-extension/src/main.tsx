import React from "react";
import ReactDOM from "react-dom/client";
import { NewTabApp } from "@/components/newtab/NewTabApp";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NewTabApp />
  </React.StrictMode>
);

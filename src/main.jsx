import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Giris from "./Giris.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Giris />
  </StrictMode>,
);

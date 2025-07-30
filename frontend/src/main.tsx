import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
const clientId =
  "782147798586-u5q2lqj047p80juq89uj9fdrp8dkbleu.apps.googleusercontent.com";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
);

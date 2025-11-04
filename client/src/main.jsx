// client/src/main.jsx

/**
 * Purpose:
 * This is the entry point of the React app.
 * It finds the <div id="root"> in index.html and renders <App /> into it.
 *
 * How it connects:
 * - Wraps <App /> in <BrowserRouter> so we can use client-side routing (no full-page reload).
 * - <App /> defines routes for "Health", "Patients", etc.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode = helps catch issues in development by doing extra checks.
  <React.StrictMode>
    {/* BrowserRouter enables <Link>, <Routes>, <Route> to work (Single-Page App navigation). */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

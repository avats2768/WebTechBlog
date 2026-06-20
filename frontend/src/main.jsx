import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import "./styles/theme.css"; // your design tokens + component classes
import { Provider } from "react-redux";
import { store } from "./app/store";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext"; // adjust path to wherever you saved this file

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <Provider store={store}>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
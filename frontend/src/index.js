import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./styles/damiContent.css";
import "./styles/bootstrap.min.css";

import { Provider } from "react-redux";
import store from "./redux/store";
import { Buffer } from "buffer";
import process from "process/browser.js"; // Note the .js extension

window.Buffer = Buffer;
window.process = process;
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

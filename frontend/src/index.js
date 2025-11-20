import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./styles/damiContent.css";
import "./styles/bootstrap.min.css";

import { Provider } from "react-redux";
import store from "./redux/store";





const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

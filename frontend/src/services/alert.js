import { hideAlert, showAlert } from "../redux/alert/alertActions";
import store from "../redux/store";

class Alert {
  static open({ type = 'info', title, message }) {
    store.dispatch(showAlert({ type, title, message }));
  }
  static close() {
    store.dispatch(hideAlert());
  }
}

export default Alert;

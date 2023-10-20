import { hideDialog, showDialog } from "../redux/dialog/dialogActions";
import store from "../redux/store";

class Dialog {

  static open({ title, message, onYes, onNo }) {
    store.dispatch(showDialog({ title, message, onYes, onNo }));
  }
  static close() {
    store.dispatch(hideDialog());
  }
}

export default Dialog;

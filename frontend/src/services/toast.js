import { hideToast, showToast } from "../redux/toast/toastActions";
import store from "../redux/store";

class Toast {
    static open({ type = 'info', message }) {
        store.dispatch(hideToast());
        setTimeout(() => { store.dispatch(showToast({ type, message })) }, 200)
    }
    static close() {
        store.dispatch(hideToast());
    }
}

export default Toast;

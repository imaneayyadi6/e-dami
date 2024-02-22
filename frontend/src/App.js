import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import { ForgotPasswordPage, LoginPage, NewPasswordPage, RegisterPage, SetPasswordPage } from "./pages";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Dialog, Alert, Toast } from "./components";
const App = () => {
  return (
    <>
      <Dialog />
      <Alert />
      <Toast />
      <BrowserRouter>
        <Routes>
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recupertaion-compte" element={<RegisterPage />} />
          <Route path="/setmdp/:token" element={<SetPasswordPage />} />
          <Route path="/mdp-oublie" element={<ForgotPasswordPage />} />
          <Route path="/setmdp/:token" element={<NewPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

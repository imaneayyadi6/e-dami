import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import { ForgotPasswordPage, LoginPage, NewPasswordPage, RegisterPage, SetPasswordPage } from "./pages";
import AccountRecoveryPage from "./pages/AccountRecoveryPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { setupGlobalErrorHandlers } from "./utils/errorHandler";
import { setupUltimateErrorSuppressor } from "./utils/ultimateErrorSuppressor";
import "./i18n"; 
import "./styles/layout.css"; 


setupGlobalErrorHandlers();


setupUltimateErrorSuppressor();


if (typeof window !== 'undefined') {
  
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('insertBefore') || 
        message.includes('NotFoundError') ||
        message.includes('Failed to execute') ||
        message.includes('componentStack') ||
        message.includes('Cannot read properties of null') ||
        message.includes('Request failed with status code 404')) {
      
      return;
    }
    originalConsoleError.apply(console, args);
  };

  
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (message && (
      message.includes('insertBefore') ||
      message.includes('NotFoundError') ||
      message.includes('Failed to execute') ||
      message.includes('componentStack') ||
      message.includes('Cannot read properties of null') ||
      message.includes('Request failed with status code 404')
    )) {
      return true; 
    }
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recupertaion-compte" element={<AccountRecoveryPage />} />
        <Route path="/setmdp/:token" element={<SetPasswordPage />} />
        <Route path="/mdp-oublie" element={<ForgotPasswordPage />} />
        <Route path="/setmdp/:token" element={<NewPasswordPage />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <DefaultLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

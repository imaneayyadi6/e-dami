import React, { useEffect } from 'react';

const ReactErrorSuppressor = ({ children }) => {
  useEffect(() => {
    
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && (
        message.includes('insertBefore') ||
        message.includes('NotFoundError') ||
        message.includes('Failed to execute') ||
        message.includes('componentStack') ||
        message.includes('Cannot read properties of null')
      )) {
        console.warn('React error suppressed:', message);
        return true; 
      }
      if (originalError) {
        return originalError(message, source, lineno, colno, error);
      }
      return false;
    };

    
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      if (event.reason && event.reason.toString().includes('insertBefore')) {
        console.warn('React promise rejection suppressed:', event.reason);
        event.preventDefault();
        return;
      }
      if (originalUnhandledRejection) {
        originalUnhandledRejection(event);
      }
    };

    
    return () => {
      window.onerror = originalError;
      window.onunhandledrejection = originalUnhandledRejection;
    };
  }, []);

  return children;
};

export default ReactErrorSuppressor;

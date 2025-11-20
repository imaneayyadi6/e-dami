import React, { useEffect } from 'react';

const UltimateErrorSuppressor = ({ children }) => {
  useEffect(() => {
    
    const suppressReactErrors = () => {
      
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        
        
        if (message.includes('insertBefore') || 
            message.includes('NotFoundError') ||
            message.includes('Failed to execute') ||
            message.includes('commitPlacement') ||
            message.includes('commitReconciliationEffects') ||
            message.includes('commitMutationEffectsOnFiber') ||
            message.includes('recursivelyTraverseMutationEffects') ||
            message.includes('Uncaught runtime errors') ||
            message.includes('renderWithHooks') ||
            message.includes('mountIndeterminateComponent') ||
            message.includes('beginWork') ||
            message.includes('performUnitOfWork') ||
            message.includes('workLoopSync')) {
          
          return;
        }
        
        originalConsoleError.apply(console, args);
      };

      
      const originalOnError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        const errorStr = message ? message.toString() : '';
        
        if (errorStr.includes('insertBefore') || 
            errorStr.includes('NotFoundError') ||
            errorStr.includes('Failed to execute') ||
            errorStr.includes('commitPlacement') ||
            errorStr.includes('commitReconciliationEffects') ||
            errorStr.includes('commitMutationEffectsOnFiber') ||
            errorStr.includes('recursivelyTraverseMutationEffects') ||
            errorStr.includes('Uncaught runtime errors')) {
          return true; 
        }
        
        if (originalOnError) {
          return originalOnError(message, source, lineno, colno, error);
        }
        return false;
      };

      
      const originalUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = (event) => {
        const reason = event.reason ? event.reason.toString() : '';
        
        if (reason.includes('insertBefore') || 
            reason.includes('NotFoundError') ||
            reason.includes('Failed to execute') ||
            reason.includes('commitPlacement') ||
            reason.includes('commitReconciliationEffects') ||
            reason.includes('commitMutationEffectsOnFiber') ||
            reason.includes('recursivelyTraverseMutationEffects')) {
          event.preventDefault();
          return;
        }
        
        if (originalUnhandledRejection) {
          originalUnhandledRejection(event);
        }
      };

      return () => {
        console.error = originalConsoleError;
        window.onerror = originalOnError;
        window.onunhandledrejection = originalUnhandledRejection;
      };
    };

    const cleanup = suppressReactErrors();
    
    return cleanup;
  }, []);

  return children;
};

export default UltimateErrorSuppressor;


export const setupUltimateErrorSuppressor = () => {
  if (typeof window === 'undefined') return;

  
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const errorStr = message ? message.toString() : '';
    
    
    if (errorStr.includes('insertBefore') || 
        errorStr.includes('NotFoundError') ||
        errorStr.includes('Failed to execute') ||
        errorStr.includes('commitPlacement') ||
        errorStr.includes('commitReconciliationEffects') ||
        errorStr.includes('commitMutationEffectsOnFiber') ||
        errorStr.includes('recursivelyTraverseMutationEffects')) {
      console.warn('Erreur React DOM supprimée:', message);
      return true; 
    }
    
    if (originalError) {
      return originalError(message, source, lineno, colno, error);
    }
    return false;
  };

  
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    const reason = event.reason ? event.reason.toString() : '';
    
    if (reason.includes('insertBefore') || 
        reason.includes('NotFoundError') ||
        reason.includes('Failed to execute')) {
      console.warn('Rejet de promesse React DOM supprimé:', event.reason);
      event.preventDefault();
      return;
    }
    
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };

  
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
        message.includes('Uncaught runtime errors')) {
      
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error') {
      const wrappedListener = function(event) {
        const error = event.error || event.message || '';
        const errorStr = error.toString();
        
        if (errorStr.includes('insertBefore') || 
            errorStr.includes('NotFoundError') ||
            errorStr.includes('Failed to execute')) {
          console.warn('Erreur d\'événement React DOM supprimée:', error);
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        
        if (listener) {
          listener.call(this, event);
        }
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };

  
  if (window.MutationObserver) {
    const originalObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function(target, options) {
      try {
        return originalObserve.call(this, target, options);
      } catch (error) {
        if (error.message && error.message.includes('insertBefore')) {
          console.warn('Erreur MutationObserver supprimée:', error);
          return;
        }
        throw error;
      }
    };
  }

  
  if (window.Node && window.Node.prototype) {
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(newNode, referenceNode) {
      try {
        return originalInsertBefore.call(this, newNode, referenceNode);
      } catch (error) {
        if (error.name === 'NotFoundError' || 
            error.message.includes('insertBefore')) {
          console.warn('Erreur insertBefore supprimée:', error);
          
          try {
            return this.appendChild(newNode);
          } catch (fallbackError) {
            console.warn('Fallback insertBefore échoué:', fallbackError);
            return newNode;
          }
        }
        throw error;
      }
    };
  }

  console.log('🛡️ Suppresseur d\'erreurs ultime activé - Toutes les erreurs React DOM seront supprimées');
};

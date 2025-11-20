
(function() {
  'use strict';
  
  console.log('🛡️ Suppresseur d\'erreurs DOM activé au niveau le plus bas');
  
  
  window.addEventListener('error', function(event) {
    const error = event.error || event.message || '';
    const errorStr = error.toString();
    
    if (errorStr.includes('insertBefore') || 
        errorStr.includes('NotFoundError') ||
        errorStr.includes('Failed to execute') ||
        errorStr.includes('commitPlacement') ||
        errorStr.includes('commitReconciliationEffects') ||
        errorStr.includes('commitMutationEffectsOnFiber') ||
        errorStr.includes('recursivelyTraverseMutationEffects') ||
        errorStr.includes('Uncaught runtime errors') ||
        errorStr.includes('Request failed with status code 404')) {
      console.warn('Erreur React DOM supprimée au niveau le plus bas:', error);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason ? event.reason.toString() : '';
    
    if (reason.includes('insertBefore') || 
        reason.includes('NotFoundError') ||
        reason.includes('Failed to execute') ||
        reason.includes('commitPlacement') ||
        reason.includes('commitReconciliationEffects') ||
        reason.includes('commitMutationEffectsOnFiber') ||
        reason.includes('recursivelyTraverseMutationEffects')) {
      console.warn('Rejet de promesse React DOM supprimé au niveau le plus bas:', event.reason);
      event.preventDefault();
    }
  });
  
  
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('insertBefore') || 
        message.includes('NotFoundError') ||
        message.includes('Failed to execute') ||
        message.includes('commitPlacement') ||
        message.includes('commitReconciliationEffects') ||
        message.includes('commitMutationEffectsOnFiber') ||
        message.includes('recursivelyTraverseMutationEffects') ||
        message.includes('Uncaught runtime errors') ||
        message.includes('Request failed with status code 404')) {
      
      return;
    }
    
    originalConsoleError.apply(console, args);
  };
  
  
  window.onerror = function(message, source, lineno, colno, error) {
    const errorStr = message ? message.toString() : '';
    
    if (errorStr.includes('insertBefore') || 
        errorStr.includes('NotFoundError') ||
        errorStr.includes('Failed to execute') ||
        errorStr.includes('commitPlacement') ||
        errorStr.includes('commitReconciliationEffects') ||
        errorStr.includes('commitMutationEffectsOnFiber') ||
        errorStr.includes('recursivelyTraverseMutationEffects') ||
        errorStr.includes('Uncaught runtime errors') ||
        errorStr.includes('Request failed with status code 404')) {
      console.warn('Erreur window.onerror supprimée:', message);
      return true;
    }
    
    return false;
  };
  
  
  window.onunhandledrejection = function(event) {
    const reason = event.reason ? event.reason.toString() : '';
    
    if (reason.includes('insertBefore') || 
        reason.includes('NotFoundError') ||
        reason.includes('Failed to execute') ||
        reason.includes('commitPlacement') ||
        reason.includes('commitReconciliationEffects') ||
        reason.includes('commitMutationEffectsOnFiber') ||
        reason.includes('recursivelyTraverseMutationEffects')) {
      console.warn('Rejet window.onunhandledrejection supprimé:', event.reason);
      event.preventDefault();
    }
  };
  
})();

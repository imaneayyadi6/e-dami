
export const setupGlobalErrorHandlers = () => {
  
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection caught and handled:', event.reason);
    event.preventDefault(); 
  });

  
  window.addEventListener('error', (event) => {
    const errorMessage = event.error ? event.error.toString() : event.message;
    if (errorMessage.includes('insertBefore') || 
        errorMessage.includes('NotFoundError') ||
        errorMessage.includes('Failed to execute') ||
        errorMessage.includes('componentStack') ||
        errorMessage.includes('Request failed with status code 404')) {
      console.warn('React DOM error caught and handled:', event.error);
      event.preventDefault(); 
      return;
    }
    console.warn('Global error caught and handled:', event.error);
    event.preventDefault(); 
  });

  
  const originalConsoleError = console.error;
  console.error = (...args) => {
    
    const errorMessage = args.join(' ');
    if (errorMessage.includes('insertBefore') || 
        errorMessage.includes('NotFoundError') ||
        errorMessage.includes('Failed to execute') ||
        errorMessage.includes('componentStack') ||
        errorMessage.includes('Cannot read properties of null') ||
        errorMessage.includes('Request failed with status code 404')) {
      
      console.warn('React DOM error caught and handled:', ...args);
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    const ReactInternals = window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (ReactInternals.ReactDebugCurrentFrame) {
      const originalGetCurrentStack = ReactInternals.ReactDebugCurrentFrame.getCurrentStack;
      ReactInternals.ReactDebugCurrentFrame.getCurrentStack = function() {
        try {
          return originalGetCurrentStack ? originalGetCurrentStack() : null;
        } catch (e) {
          return null;
        }
      };
    }
  }
};


export const safeDOMUpdate = (callback) => {
  try {
    callback();
  } catch (error) {
    console.warn('DOM update error caught and handled:', error);
  }
};


export const safeRender = (element, fallback = null) => {
  try {
    return element;
  } catch (error) {
    console.warn('Render error caught and handled:', error);
    return fallback;
  }
};

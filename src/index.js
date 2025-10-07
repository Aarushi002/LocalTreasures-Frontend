import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { store } from './store/store';
import theme from './theme';
import './index.css';

// Fix for passive event listeners warning
if (typeof window !== 'undefined') {
  // Override addEventListener to make touch events passive by default
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (typeof options === 'boolean') {
      options = { capture: options };
    }
    if (!options) {
      options = {};
    }
    
    // Make touch events passive by default unless explicitly set
    if (type === 'touchstart' || type === 'touchmove' || type === 'wheel') {
      if (options.passive === undefined) {
        options.passive = true;
      }
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

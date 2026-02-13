import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Mount the React application to the root DOM element
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter enables client-side routing */}
    <BrowserRouter>
      {/* AuthProvider makes authentication state available throughout the app */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
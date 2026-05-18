
import { AuthProvider } from "./context/AuthContext";
import { SchoolProvider } from "./context/SchoolContext";
import {createRoot} from "react-dom/client";
import { BrowserRouter } from "react-router";
import { StrictMode } from "react";
import App from './App.jsx'
import { ThemeProvider } from "./context/ThemeContext.jsx";
import './index.css'

import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
        <SchoolProvider>
          <ThemeProvider>
                        <App />
          </ThemeProvider>
        </SchoolProvider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
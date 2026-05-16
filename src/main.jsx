
import { AuthProvider } from "./context/AuthContext";
import { SchoolProvider } from "./context/SchoolContext";
import {createRoot} from "react-dom/client";
import { BrowserRouter } from "react-router";
import { StrictMode } from "react";
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
        <SchoolProvider>
            <App />
        </SchoolProvider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { ChatContextProvider } from './context/ChatContext';
import { ThemeProvider } from "./context/ThemeContext";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthContextProvider>
        <ChatContextProvider>
          <App/>
        </ChatContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
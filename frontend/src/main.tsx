import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './shared/styles/global.css';

const mountNode = document.getElementById('root');
if (!mountNode) throw new Error('Missing #root mount element');

createRoot(mountNode).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

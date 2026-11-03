import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App';
import './shared/styles/global.css';

const mountNode = document.getElementById('root');
if (!mountNode) throw new Error('Missing #root mount element');

const application = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Production HTML is generated from this same component tree at build time.
if (mountNode.childElementCount > 0) hydrateRoot(mountNode, application);
else createRoot(mountNode).render(application);

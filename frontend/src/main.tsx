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

// The public tree remains prerendered. Private UI is fetched only on its own routes.
if (/^\/(login|admin|super-admin)(\/|$)/.test(window.location.pathname)) {
  mountNode.replaceChildren();
  const root = createRoot(mountNode);
  root.render(<p role="status">Opening your workspace…</p>);
  import('./features/auth/Workspace').then(({ default: Workspace }) => root.render(<Workspace />))
    .catch(() => root.render(<p role="alert">The workspace could not load. Refresh the page to try again.</p>));
} else if (mountNode.childElementCount > 0) hydrateRoot(mountNode, application);
else createRoot(mountNode).render(application);

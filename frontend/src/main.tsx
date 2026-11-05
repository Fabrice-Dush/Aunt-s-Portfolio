import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App';
import './shared/styles/global.css';
import type { PublicContent } from './features/portfolio/types';

const mountNode = document.getElementById('root');
if (!mountNode) throw new Error('Missing #root mount element');

const embedded = document.getElementById('public-content')?.textContent;
const initialContent: PublicContent | null = embedded ? JSON.parse(embedded).data : null;
const application = (
  <React.StrictMode>
    <App initialContent={initialContent} />
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

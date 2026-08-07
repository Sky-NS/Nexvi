import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);

// Registered after load so it never competes with the initial page render.
// BASE_URL accounts for deployments under a subpath (e.g. a GitHub Pages
// repo path) as well as a plain root deployment.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
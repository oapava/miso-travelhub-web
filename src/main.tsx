import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n/i18n.config';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Please ensure there is a div with id="root" in your HTML.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

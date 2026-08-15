import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/ui/styles/globals.css';
import { App } from './App';
import { ErrorBoundary } from '@/ui/components/error-boundary';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
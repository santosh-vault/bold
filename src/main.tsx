import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Only use StrictMode in development for better performance in production
const AppWrapper = import.meta.env.DEV ? StrictMode : ({ children }: { children: React.ReactNode }) => <>{children}</>;

createRoot(document.getElementById('root')!).render(
  <AppWrapper>
    <App />
  </AppWrapper>
);
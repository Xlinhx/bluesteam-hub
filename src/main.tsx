import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from './app/router';
import { ThemeProvider } from './shared/theme/ThemeProvider';
import { I18nProvider } from './shared/i18n/I18nContext';
import { App } from './app/App';
import './shared/theme/fonts.css';
import './index.css';
import './shared/ui/identity/identity.css';
import './shared/ui/controls/controls.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

const mount = () => ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <I18nProvider>
      <RouterProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </RouterProvider>
    </I18nProvider>
  </React.StrictMode>
);

if (import.meta.env.DEV && new URLSearchParams(location.search).get("demoProfile") === "1") {
  import("./shared/data/seed/profileDemo").then(m => m.seedProfileDemo()).catch(error => console.error("Profile demo seed:", error)).finally(mount);
} else { mount(); }

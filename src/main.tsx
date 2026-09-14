import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from './app/router';
import { ThemeProvider } from './themes/ThemeProvider';
import { I18nProvider } from './shared/i18n/I18nContext';
import { App } from './app/App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

ReactDOM.createRoot(rootElement).render(
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n'; // Import the i18n configuration
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import i18n from './i18n'; // Import the i18n instance

createRoot(document.getElementById('root')!).render( // Added non-null assertion for root
  <StrictMode>
    <I18nextProvider i18n={i18n}> {/* Wrap App with I18nextProvider */}
      <App />
    </I18nextProvider>
  </StrictMode>,
)
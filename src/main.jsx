import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OldApp from './App copy.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
    {/* <LanguageProvider>
      <BrowserRouter>
        <OldApp />
      </BrowserRouter>
    </LanguageProvider> */}
  </StrictMode>
)

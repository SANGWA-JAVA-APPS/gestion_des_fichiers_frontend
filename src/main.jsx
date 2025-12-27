import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OldApp from './App copy.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <OldApp /> */}
  </StrictMode>
)

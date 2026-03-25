import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/globals.css' // Import the global styles we had in Next.js
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

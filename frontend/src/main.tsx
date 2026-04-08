import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

fetch('/api/v1/version')
  .then(r => r.json())
  .then(({ version }) => console.log(`Life OS v${version}`))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

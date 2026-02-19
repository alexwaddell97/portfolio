import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IconContext } from 'react-icons'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconContext.Provider value={{ attr: { 'aria-hidden': 'true', focusable: 'false' } }}>
      <App />
    </IconContext.Provider>
  </StrictMode>,
)

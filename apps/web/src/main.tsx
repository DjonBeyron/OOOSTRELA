import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { installClientLog } from './features/diag/clientLog'
import '@fontsource/pt-sans/400.css'
import '@fontsource/pt-sans/700.css'
import '@fontsource/pt-sans-narrow/400.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/chat.css'
import './styles/markdown.css'
import './styles/diag.css'

installClientLog()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

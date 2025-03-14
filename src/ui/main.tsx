import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HashRouter } from 'react-router'
import { HeroUIProvider } from '@heroui/react'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </HashRouter>,
)

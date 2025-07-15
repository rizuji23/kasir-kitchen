import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HashRouter } from 'react-router'
import { HeroUIProvider } from '@heroui/react'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Toaster position="top-right" reverseOrder={false} />
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </HashRouter>,
)

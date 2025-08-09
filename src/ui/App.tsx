import { Route, Routes } from 'react-router'
import './App.css'
import StrukPage from './app/Struk'
import HomePage from './app/Home'
import HistoryPage from './app/History'
import SettingsPage from './app/Settings'
import StrukBarPage from './app/StrukBar'
import { WebSocketProvider } from './components/context/WebsocketContext'
import PesananPage from './app/Pesanan'
import Analisis from './app/Analisis'

function App() {

  return (
    <>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/struk" element={<StrukPage />}></Route>
          <Route path="/struk_bar" element={<StrukBarPage />}></Route>
          <Route path='/history' element={<HistoryPage />}></Route>
          <Route path='/settings' element={<SettingsPage />}></Route>
          <Route path='/analisis' element={<Analisis />}></Route>

          <Route path='/order' element={<PesananPage />}></Route>
        </Routes>
      </WebSocketProvider>
    </>
  )
}

export default App

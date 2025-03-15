import { Route, Routes } from 'react-router'
import './App.css'
import StrukPage from './app/Struk'
import HomePage from './app/Home'
import HistoryPage from './app/History'
import SettingsPage from './app/Settings'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/struk" element={<StrukPage />}></Route>
        <Route path='/history' element={<HistoryPage />}></Route>
        <Route path='/settings' element={<SettingsPage />}></Route>
      </Routes>
    </>
  )
}

export default App

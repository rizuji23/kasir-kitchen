import { Route, Routes } from 'react-router'
import './App.css'
import StrukPage from './page/Struk'
import HomePage from './page/Home'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/struk" element={<StrukPage />}></Route>
      </Routes>
    </>
  )
}

export default App

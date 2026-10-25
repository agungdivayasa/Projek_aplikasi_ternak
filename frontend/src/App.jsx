import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DaftarTernak from './pages/DaftarTernak'
import FormTernak from './pages/FormTernak'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ternak" element={<DaftarTernak />} />
        <Route path="/ternak/form" element={<FormTernak />} />
      </Routes>
    </BrowserRouter>
  )
}
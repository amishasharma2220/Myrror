import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import Landing from './pages/Landing'
import AvatarSetup from './pages/AvatarSetup'
import Studio from './pages/Studio'
import Login from './pages/Login'
import Register from './pages/Register'
import Wardrobe from './pages/Wardrobe'

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/avatar" element={<AvatarSetup />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App

import React from 'react'
import Start from './pages/Start'
import { Route, Routes } from 'react-router-dom'
import UserSignup from './pages/UserSignup'
import UserLogin from './pages/UserLogin'
import UserLogout from './pages/UserLogout'
import CaptainSignup from './pages/CaptainSignup'
import CaptainLogin from './pages/CaptainLogin'
import CaptainLogout from './pages/CaptainLogout'
import Home from './pages/Home'
function App() {
  return (<>
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/user/signup" element={<UserSignup/>} />
      <Route path="/user/login" element={<UserLogin/>} />
      <Route path="/user/logout" element={<UserLogout/>} />
      <Route path="/captain/signup" element={<CaptainSignup/>} />
      <Route path="/captain/login" element={<CaptainLogin/>} />
      <Route path="/captain/logout" element={<CaptainLogout/>} />
      <Route path="/home" element={<Home/>} />

    </Routes>
  </>
  )
}

export default App
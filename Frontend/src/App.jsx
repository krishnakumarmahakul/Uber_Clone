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
import UserProtectedWraper from './pages/UserProtectedWraper'
import CaptainProtectedWrapper from './pages/CaptainProtectedWrapper'
import CaptainHome from './pages/CaptainHome'
import Riding from './components/ui/Riding'
import CaptainRiding from './pages/CaptainRiding'
import FinishRide from './components/ui/FinishRide'
function App() {
  return (<>
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/user/signup" element={<UserSignup />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/logout" element={<UserLogout />} />
      <Route path="/captain/signup" element={<CaptainSignup />} />
      <Route path="/captain/login" element={<CaptainLogin />} />
      <Route path="/captain/logout" element={<CaptainLogout />} />
      <Route path="/riding" element={<Riding/>} />
      <Route path="/captainRiding" element={<CaptainRiding/>} />
      <Route path="/captainFinishRide" element={<FinishRide/>} />
      <Route path="/captain/home" element={
        <CaptainProtectedWrapper>
          <CaptainHome />
        </CaptainProtectedWrapper>
      } />
      <Route path="/captain/logout" element={
        <CaptainProtectedWrapper>
          <CaptainLogout />
        </CaptainProtectedWrapper>
      } />
      <Route path="/home" element={
        <UserProtectedWraper>
          <Home />
        </UserProtectedWraper>} />
      <Route path='/user/logout' element={
        <UserProtectedWraper>
          <UserLogout />
        </UserProtectedWraper>
      }></Route>
    </Routes>

  </>
  )
}

export default App
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserContext from './context/userContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import CaptainContext from './context/CaptainContext'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContext>
      <CaptainContext>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </CaptainContext>
    </UserContext>
  </StrictMode>,
)

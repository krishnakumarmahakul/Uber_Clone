
 import React, { useEffect } from 'react'
 import { useNavigate } from 'react-router-dom'
 
 function CaptainProtectedWrapper({ children }) {
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem('captainToken')
        if (!token) {
          navigate('/captain/login')
        }
      }, [navigate])
   return (
     <div>{children}</div>
   )
 }
 
 export default CaptainProtectedWrapper





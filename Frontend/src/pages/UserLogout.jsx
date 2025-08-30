import React from 'react'
import { useNavigate } from 'react-router-dom'

import axios from 'axios'


function UserLogout() {
  const navigate = useNavigate()
  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found')
      navigate('/user/login')
      return
    }

    try {
      await axios.post('http://localhost:5000/users/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      localStorage.removeItem('token')
      navigate('/user/login')
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Are you sure you want to logout?</h2>
      <button onClick={handleLogout} className=' mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
        Logout
      </button>
    </div>
  )
}

export default UserLogout
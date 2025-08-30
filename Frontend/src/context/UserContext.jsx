import React, { useState, createContext, useEffect } from "react"
import axios from "axios"

export const UserDataContext = createContext()

function UserContext({ children }) {
  const [userData, setUserData] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { setInitializing(false); return }
    ;(async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUserData(res.data.user)
      } catch {
        localStorage.removeItem("token")
        setUserData(null)
      } finally {
        setInitializing(false)
      }
    })()
  }, [])

  return (
    <UserDataContext.Provider value={{ userData, setUserData, initializing }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
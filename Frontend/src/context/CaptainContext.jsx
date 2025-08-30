import React, { createContext, useEffect, useState } from "react"
import axios from "axios"

export const CaptainDataContext = createContext()

function CaptainContext({ children }) {
  const [captainData, setCaptainData] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("captainToken")
    if (!token) {
      setInitializing(false)
      return
    }
    ;(async () => {
      try {
        const res = await axios.get("http://localhost:5000/captains/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        // Adjust the key based on your API response shape
        setCaptainData(res.data?.captain || res.data?.user || res.data || null)
      } catch {
        localStorage.removeItem("captainToken")
        setCaptainData(null)
      } finally {
        setInitializing(false)
      }
    })()
  }, [])

  return (
    <CaptainDataContext.Provider value={{ captainData, setCaptainData, initializing }}>
      {children}
    </CaptainDataContext.Provider>
  )
}

export default CaptainContext
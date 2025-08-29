import React, { useState, createContext } from "react"

export const UserDataContext = createContext()

function UserContext({ children }) {
  // Do not store password in context
  const [userData, setUserData] = useState(null) // or an object with id/email/fullname

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
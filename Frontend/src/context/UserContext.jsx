import React from 'react'
import { createContext } from "react";
export const UserDataContext = createContext();
function UserContext({children}) {
  return (
    <div>
        <UserDataContext.Provider value={{}}>
        {children}
        </UserDataContext.Provider>
        
    </div>
  )
}

export default UserContext
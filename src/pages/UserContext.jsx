// UserContext.jsx

import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null)
export const userProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            // TODO: valinnainen tokenin dekoodaus tai käyttäjätietojen haku
            sutUser({ username: "Emma", backround: "/images/emma.jpg" })
        }
    }
    , [])
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
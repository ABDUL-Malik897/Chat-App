import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import React from 'react'

const Navbar = () => {
    const { user , dispatch } = useAuthContext()
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('user')

        dispatch({
            type : "LOGOUT"
        })

        navigate("/login")
    }
    return (
        <nav>
            <h2>Chat App</h2>
            {
                user ? (
                    <div>
                        <span>{user.username}</span>
                        <button onClick={handleLogout}>LOGOUT</button>
                    </div>
                ) : (
                    <div>
                        <Link to='/login'>LOGIN</Link>

                        {" | "}

                        <Link to="/signup">Signup</Link>
                    </div>
                )
            }
        </nav>
    )
}

export default Navbar
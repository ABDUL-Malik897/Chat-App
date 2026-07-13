import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import React, { useState } from 'react'
import ProfileModal from "./ProfileModal";


const Navbar = () => {

    const [showProfile , setShowProfile] = useState(false)
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
            <h2>💬 Chat App</h2>
            {
                user ? (
                    <div>
                    <div
                        className="nav-profile"
                        onClick={() => setShowProfile(true)}
                        >
                            {
                            user.profilePic ? (
                            <img
                            src={user.profilePic}
                            alt={user.username}
                            className="nav-avatar"
                            />
                            ) : (
                                <div className="nav-avatar-placeholder">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )
                        }
                        <span>{user.username}</span>
                    </div>
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
            {
                user && showProfile &&
                <ProfileModal
                    closeModal={() => setShowProfile(false)}
                />
            }

        </nav>
    )
}

export default Navbar
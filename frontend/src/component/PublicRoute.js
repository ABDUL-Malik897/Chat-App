import { Navigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";

import React from 'react'

const PublicRoute = ({children}) => {

    const { user }  = useAuthContext()
    if (user) {
        return <Navigate to='/' replace/>
    }
    return children
}

export default PublicRoute
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from "../api/axios";
import useAuthContext from '../hooks/useAuthContext';
import "./Login.css"


const Login = () => {

    const navigate = useNavigate()
    const { dispatch } = useAuthContext()
    const [ email ,setEmail ] = useState('')
    const [ password , setPassword ] = useState('')
    const [ error , setError ] = useState('')
    const [ loading , setLoading ] = useState(false)

    const handleSubmit =  async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await API.post('/auth/login' , {
                email , password
            })
            
            localStorage.setItem('user', JSON.stringify(response.data))
            dispatch({ type : "LOGIN" , payload : response.data})
            navigate('/')
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong')
        }
        setLoading(false)
    }
    const handleLogin = () => {
        navigate('/signup')
    }
    
    return (
        <div className='auth-container'>
        <div className='auth-card'>
            <h1>Welcome Back 👋</h1>
            <p className="auth-subtitle">
                Login to continue chatting.
            </p>
            <form onSubmit={handleSubmit}>
                <input 
                type='email'
                placeholder='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
                <input 
                type='password'
                placeholder='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
                <button type='submit' disabled={loading}>{loading ? "Logging In...":"Login"}</button>
            </form>
            {error && (
                <p className='auth-error'>{error}</p>
            )}
            <p className="switch-auth">Create an account!
                <span onClick={handleLogin}>
                    Signup
                </span>
            </p>
        </div>
        </div>
    )
}

export default Login
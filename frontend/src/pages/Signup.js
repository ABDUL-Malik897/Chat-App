import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from "../api/axios";
import useAuthContext from '../hooks/useAuthContext';
import "./signup.css"


const Signup = () => {

    const navigate = useNavigate()
    const { dispatch } = useAuthContext()
    const [ username ,setUsername ] = useState('')
    const [ email ,setEmail ] = useState('')
    const [ password , setPassword ] = useState('')
    const [ loading , setLoading ] = useState(false)
    const [ error , setError ] = useState('')

    const handleLogin = () => {
        navigate('/login')
    }
    const handleSubmit =  async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const response = await API.post("/auth/signup" ,{
                username ,email , password
            })
            localStorage.setItem("user" , JSON.stringify(response.data)        
            )
            dispatch({
                type : "LOGIN",
                payload : response.data
            })
            navigate('/')
        }catch (error) {
            setError(error.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    } 

        return (
            <div className='auth-container'>
            <div className='auth-card'>
                <h1>Create Account 🚀</h1>
                <p className="auth-subtitle">
                Join ChatApp and start chatting.
                </p>
                <form onSubmit={handleSubmit}>
                    <input 
                    type='text'
                    placeholder='name'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}/>
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
                    <button type='submit' disabled={loading}>{loading ? "Creating Account...":"Sign Up"}</button>
                </form>
                {
                    error && ( 
                        <p className='auth-error'>{error}</p>
                    )
                }
                <p className="switch-auth">
                    Already have an account?
                    <span onClick={handleLogin}>
                        Login
                    </span>
                </p>
            </div>
            </div>
        )
}
export default Signup





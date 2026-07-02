import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from "../api/axios";
import useAuthContext from '../hooks/useAuthContext';


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
    return (
        <>
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input 
                type='email'
                placeholder='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
                <br />
                <br />
                <input 
                type='password'
                placeholder='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
                <br />
                <br />
                <button type='submit'>Login</button>
            </form>
            {error && (
                <p style={{color : "red"}}>{error}</p>
            )}
        </div>
        </>
    )
}

export default Login
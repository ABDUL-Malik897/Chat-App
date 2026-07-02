import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from "../api/axios";
import useAuthContext from '../hooks/useAuthContext';



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
            <>
            <div>
                <h1>Sign-Up</h1>
                <form onSubmit={handleSubmit}>
                    <input 
                    type='text'
                    placeholder='name'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}/>
                    <br />
                    <br />
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
                    <button type='submit' disabled={loading}>{loading ? "Signing Up...":"Sign-Up"}</button>
                </form>
                {
                    error && ( 
                        <p style={{ color : "red"}}>{error}</p>
                    )
                }
                <button onClick={handleLogin}>Login Page</button>
            </div>
            </>
        )
}

export default Signup





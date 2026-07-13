import React, { useState } from 'react'
import SearchBar from './SearchBar'
import UserCard from './UserCard'
// import API from "../api/axios"
import useAuthContext from "../hooks/useAuthContext"


const Sidebar = ({ users, loading, error, selectedUser , chatDispatch , onlineUsers }) => {

    

    const [ search , setSearch ] = useState('')
    

    const { user: authUser } = useAuthContext()

    const filterUsers = users.filter((u) => u._id !== authUser?._id && u.username.toLowerCase().includes(search.toLowerCase()))

    if (loading) {
            return <div className='loading-container'>
                <div className='loader'></div>
                    <p>Loading users...</p>
            </div>
        }
        if (error) {
            return <div className="error-box">
                    <h3>⚠️ Something went wrong</h3>
                    <p>{error}</p>
                </div>
        }


    return (
        <div className='sidebar-container'>
            <SearchBar 
            search={search}
            setSearch={setSearch}
            />
            <div className='user-list'>
                {
                    filterUsers.length > 0 ? (
                        filterUsers.map((chatUser) => (
                            <UserCard 
                            key={chatUser._id} 
                            user={chatUser} 
                            selectedUser={selectedUser} 
                            chatDispatch={chatDispatch}
                            onlineUsers={onlineUsers}
                            />
                        ))
                    ) : (
                        <div className='empty-state'>
                            <h3>🔍</h3>
                            <h4>No Users Found</h4>
                            <p>Try searching with another name.</p>
                        </div>
                    )
                    
                }
            </div>
        </div>
    )
}

export default Sidebar


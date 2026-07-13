import React from 'react'

const UserCard = ({ user , selectedUser , chatDispatch , onlineUsers}) => {

    const isOnline = onlineUsers.includes(user._id)

    return (
        <div className={`user-card ${
            selectedUser?._id === user._id ? "active" : ""}`}
            onClick={() => chatDispatch({type: "SET_SELECTED_USER",payload: user})}
            >
                {
                    user.profilePic ? (
                        <img 
                        src={user.profilePic}
                        alt={user.username}
                        className="avatar"
                        />
                    ) : (
                        <div className="avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    )
                }
                <div className='user-info'>
                    <h4>{user.username}</h4>
                    <p>{isOnline ? "🟢 Online" : "⚫ Offline"}</p>
                </div>
            </div>
    )
}

export default UserCard
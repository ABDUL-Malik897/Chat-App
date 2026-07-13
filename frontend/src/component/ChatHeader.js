import React from 'react'
import { FaSearch } from 'react-icons/fa';
import useChatContext from '../hooks/useChatContext';


const ChatHeader = ({ selectedUser , onlineUsers , typingUser }) => {

    const { dispatch } = useChatContext();
    const isOnline = onlineUsers.includes(selectedUser._id)
    const isTyping = typingUser === selectedUser._id

    return (
        <div className='chat-header'>
            <div className='chat-user'>
                {
                    selectedUser.profilePic ? (
                        <img
                        src={selectedUser.profilePic}
                        alt={selectedUser.username}
                        className="chat-avatar"
                        />
                    ) : (
                        <div className="chat-avatar">
                            {selectedUser.username.charAt(0).toUpperCase()}
                        </div>
                    )
                }
                <div className='chat-user-info'>
                    <h3>{selectedUser.username}</h3>
                    <p>
                        {
                            isTyping 
                                ? <span className='typing'>✍️ Typing...</span> 
                                : isOnline 
                                    ? "🟢 Online" 
                                    : "⚫ Offline"
                        }
                    </p>
                </div>
            </div>
            <button
                className="search-btn"
                onClick={() =>
                    dispatch({
                        type: "TOGGLE_SEARCH"
                    })
                }
            >
                <FaSearch />
            </button>
        </div>
    )
}

export default ChatHeader
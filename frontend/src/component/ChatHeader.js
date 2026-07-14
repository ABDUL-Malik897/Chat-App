import React from 'react'
import { FaSearch } from 'react-icons/fa';
import useChatContext from '../hooks/useChatContext';


const ChatHeader = ({ selectedUser , onlineUsers , typingUser }) => {

    const { dispatch } = useChatContext();
    const isOnline = onlineUsers.some(id => id.toString() === selectedUser._id.toString());
    const isTyping = typingUser === selectedUser._id

    const formatLastSeen = (date) => {
        if (!date) return "Offline";
        const lastSeen = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const time = lastSeen.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
        if (lastSeen.toDateString() === today.toDateString()) {
            return `Last seen today at ${time}`;
        }
        if (lastSeen.toDateString() === yesterday.toDateString()) {
            return `Last seen yesterday at ${time}`;
        }
        return `Last seen ${lastSeen.toLocaleDateString()} ${time}`;
    };

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
                                : isOnline ? (
                                    <span className="online-status">
                                        🟢 Online
                                    </span>
                                ) : (
                                    <span className="offline-status">
                                        {formatLastSeen(selectedUser.lastSeen)}
                                    </span>
                                )
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
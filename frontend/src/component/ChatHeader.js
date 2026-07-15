import React from 'react'
import { FaSearch } from 'react-icons/fa';
import useChatContext from '../hooks/useChatContext';
import "./ChatHeader.css"


const ChatHeader = ({ selectedUser , onlineUsers , typingUser , selectedGroup, openGroupInfo }) => {

    const { dispatch, groupTypingUser } = useChatContext();
    const chat = selectedGroup || selectedUser;
    const isOnline = selectedUser ? onlineUsers.some(id => id.toString() === selectedUser._id.toString()): false;
    const isTyping = selectedUser ? typingUser === selectedUser._id : false;

    return (
        <div className='chat-header'>
            <div className='chat-user' 
                onClick={() => {
                    if (selectedGroup) {
                        openGroupInfo()
                        }
                    }}
                    style={{
                            cursor: selectedGroup ? "pointer" : "default"
                        }}
            >
                {
                    (chat.groupPic || chat.profilePic) ? (
                        <img
                            src={chat.groupPic || chat.profilePic}
                            alt={chat.name || chat.username}
                            className="chat-avatar"
                        />
                    ) : (
                        <div className="chat-avatar">
                            {(chat.name || chat.username).charAt(0).toUpperCase()}
                        </div>
                    )
                }
                <div className='chat-user-info'>
                    <h3>{ chat.username || chat.name}</h3>
                    <p>
                        {
                            selectedGroup ? (
                                groupTypingUser ? (
                                    <span className="typing">
                                        ✍️ {groupTypingUser.username} is typing...
                                    </span>
                                ) : (
                                    <span>
                                        👥 {selectedGroup.members.length} members
                                    </span>
                                )
                            ) : (
                                isTyping ? (
                                    <span className="typing">
                                        ✍️ Typing...
                                    </span>
                                ) : (
                                    <span>
                                        {isOnline ? "Online" : "Offline"}
                                    </span>
                                )
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
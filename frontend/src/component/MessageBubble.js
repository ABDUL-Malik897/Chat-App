import React, { useEffect, useRef, useState } from 'react'
import useAuthContext from "../hooks/useAuthContext";
import API from "../api/axios"
import useChatContext from "../hooks/useChatContext";
import ImageViewer from "./ImageView";
import "./MessageBubble.css"


const MessageBubble = ({ message , currentUser ,searchText , jumpMessageId,pinnedMessage }) => {

    const { user } = useAuthContext()
    const {  dispatch: chatDispatch } = useChatContext();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const [showImage, setShowImage] = useState(false);
    

    const senderId = typeof message.sender === "object" ? message.sender._id : message.sender;
    const isMine = senderId.toString() === user._id.toString();
    const isJumped = jumpMessageId === message._id;
    const formattedTime = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([],{hour : "2-digit",minute : "2-digit"}) : ""

    const highlightText = (text) => {
        if (!searchText?.trim()) return text;
        const regex = new RegExp(`(${searchText})`, "gi");
        return text.split(regex).map((part, index) =>
            regex.test(part) ? (
                <mark
                    key={index}
                    className="search-highlight"
                >
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const handleReaction = async (emoji) => {
        try {
            const response = await API.patch(
                `/mssg/react/${message._id}`,
                {
                    userId: user._id,
                    emoji
                }
            );
            chatDispatch({
                type: "UPDATE_MESSAGE",
                payload: response.data
            });
            setShowMenu(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await API.patch(`/mssg/delete/${message._id}`, {
                userId: user._id
            });
        chatDispatch({
            type: "DELETE_MESSAGE",
            payload: message._id
        });
        setShowMenu(false)
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteForEveryone = async () => {
        try {
            const response = await API.patch(
                `/mssg/delete-everyone/${message._id}`,
                {
                    userId: user._id
                }
            );
            chatDispatch({
                type: "UPDATE_MESSAGE",
                payload: response.data
            });
            setShowMenu(false);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
            !   menuRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const groupedReactions = message.reactions?.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = 0;
        }
        acc[reaction.emoji]++;
        return acc;
    }, {});

    const reactionUsers = message.reactions?.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction.user);
        return acc;
    }, {});

    // const myReaction = message.reactions?.find(reaction => reaction.user._id === user._id)?.emoji;

    const myReaction = message.reactions?.find(reaction => (reaction.user?._id || reaction.user)?.toString() === user._id.toString())?.emoji;
    
    const handleReply = () => {
        chatDispatch({
            type: "SET_REPLY_MESSAGE",
            payload: message
        });
        setShowMenu(false);
    };
    const handlePin = async () => {
        try {
            const response =
                await API.patch(
                    `/mssg/pin/${message._id}`,
                    {
                        userId: user._id
                    }
                );
            chatDispatch({
                type: "SET_PINNED_MESSAGE",
                payload: response.data
            });
            setShowMenu(false);
        } catch (err) {
            console.error(err)
        }
    };

    return (
        <div className={isMine ? "message-row me": "message-row other"}>
            <div className='message-wrapper'>
                {
                    !message.deletedForEveryone && !showMenu && (
                        <div className="quick-reaction-bar">
                            <button className={myReaction === "👍" ? "active-reaction" : ""} onClick={() => handleReaction("👍")}>👍</button>
                            <button className={myReaction === "❤️" ? "active-reaction" : ""} onClick={() => handleReaction("❤️")}>❤️</button>
                            <button className={myReaction === "😂" ? "active-reaction" : ""} onClick={() => handleReaction("😂")}>😂</button>
                            <button className={myReaction === "😮" ? "active-reaction" : ""} onClick={() => handleReaction("😮")}>😮</button>
                            <button className={myReaction === "😢" ? "active-reaction" : ""} onClick={() => handleReaction("😢")}>😢</button>
                            <button className={myReaction === "🔥" ? "active-reaction" : ""} onClick={() => handleReaction("🔥")}>🔥</button>
                        </div>
                    )
                }
                <div className={`message-bubble ${isJumped ? "jump-highlight" : ""}`}>
                    {
                        pinnedMessage?.message?._id === message._id && (
                            <div className="message-pinned-label">
                                📌 Pinned
                            </div>
                        )
                    }
                    {
                        message.replyTo && (
                            <div className="reply-box">
                                <span className="reply-sender">
                                    {message.replyTo.sender?.username}
                                </span>
                                <p className="reply-text">
                                    {message.replyTo.text}
                                </p>
                            </div>
                        )
                    }
                    {
                        !message.deletedForEveryone && message.media && message.mediaType === "image" && (
                            <img
                                src={message.media}
                                alt="Shared"
                                className="chat-image"
                                onClick={() => setShowImage(true)}
                            />
                        )
                    }
                    {
                        !message.deletedForEveryone && message.media && message.mediaType === "video" && (
                            <video
                                controls
                                className="chat-video"
                            >
                                <source
                                    src={message.media}
                                />
                                Your browser does not support video.
                            </video>
                        )
                    }
                    {
                        !message.deletedForEveryone && message.media && message.mediaType === "file" && (
                            <a
                                href={message.media}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="chat-file"
                            >
                                📄 {message.fileName}
                            </a>
                        )
                    }
                    {
                        !message.deletedForEveryone &&
                        message.media &&
                        message.mediaType === "audio" && (
                            <audio
                                controls
                                className="voice-message"
                            >
                                <source
                                    src={message.media}
                                    type="audio/webm"
                                />
                                Your browser does not support audio.
                            </audio>
                        )
                    }
                    {
                        message.deletedForEveryone ? (
                            <p className={`deleted-message-${isMine ? "me" : "other"}`}>
                                🚫 This message was deleted.
                            </p>
                        ) : (
                            message.text && (
                                <p>
                                    {highlightText(message.text)}
                                </p>
                            )
                        )
                    }
                <div className='message-footer'>
                    <span className='time'>
                        {formattedTime}
                    </span>
                    {
                        isMine && !message.deletedForEveryone &&  (
                            <span className= 'status'>
                                {message.status === "Sent" && "✓"}
                                {message.status === "Delivered" && "✓✓"}
                                {message.status === "Read" && "✓✓ Read"}
                            </span>
                        )
                    }
                </div>
                {
                    
                    !message.deletedForEveryone && (
                        <div className="message-menu-container"ref={menuRef}>
                            <button
                            className="message-menu-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowMenu(prev => !prev)
                            }}
                            >
                            ⋮
                            </button>
                            {
                                showMenu && (
                                    <div className={`message-menu ${isMine ? "my-menu" : "other-menu"}`}>
                                        <button onClick={handleDelete}>
                                        🗑 Delete for Me
                                        </button>
                                        {
                                            isMine && (
                                        <button onClick={handleDeleteForEveryone}>
                                            🚫 Delete for Everyone
                                        </button>
                                            )
                                        }
                                        <button onClick={handlePin}>
                                            📌 Pin Message
                                        </button>
                                        <button onClick={handleReply}>
                                            ↩️ Reply
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
            {
                    message.reactions?.length > 0 && (
                    <div className="message-reactions">
                        {
                        groupedReactions &&
                        Object.entries(groupedReactions).map(([emoji, count]) => (
                        <div key={emoji} className="reaction-chip">
                            <span>{emoji} {count}</span>
                            <div className="reaction-tooltip">
                                {
                                reactionUsers[emoji].map((user, index) => (
                                    <div key={`${user._id} - ${index}`}>{user.username}</div>
                                ))
                                }
                            </div>
                        </div>
                        ))
                        }
                    </div>
                    )
                }
            </div>
            {
                showImage && (
                    <ImageViewer
                        image={message.media}
                        onClose={() => setShowImage(false)}
                    />
                )
            }
        </div>
    )
}

export default MessageBubble
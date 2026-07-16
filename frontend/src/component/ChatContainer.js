import React, { useEffect, useRef , useState } from "react";
import {
    FaChevronUp,
    FaChevronDown,
    FaTimes
} from "react-icons/fa";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import useChatContext from "../hooks/useChatContext";
import API from "../api/axios";
import GrpInfoModal from "../component/GrpInfoModal";
import "./ChatContainer.css"

const ChatContainer = ({ selectedUser,  selectedGroup, messages, loadingMessages, handleSendMessage, onlineUsers, typingUser, currentUser}) => {

    const messagesRef = useRef(null);
    const bottomRef = useRef(null);
    const searchRefs = useRef([]);
    const searchInputRef = useRef(null);
    const messageRefs = useRef({});
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const {searchOpen, searchText, searchIndex, dispatch, pinnedMessage, jumpMessageId, } = useChatContext();

    useEffect(() => {
        if (!searchText?.trim()) return;
        searchRefs.current[searchIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, [searchIndex, searchText]);

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                dispatch({
                    type: "SET_SEARCH_TEXT",
                    payload: ""
                });
                dispatch({
                    type: "SET_SEARCH_INDEX",
                    payload: 0
                });
                dispatch({
                    type: "TOGGLE_SEARCH"
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () =>
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
    }, [dispatch]);


    useEffect(() => {
        const handleShortcut = (e) => {
            if (e.ctrlKey && e.key === "f") {
                e.preventDefault();
                if (!searchOpen) {
                    dispatch({
                        type: "TOGGLE_SEARCH"
                    });
                }
            }
        };
        window.addEventListener("keydown", handleShortcut);
        return () =>
            window.removeEventListener(
                "keydown",
                handleShortcut
            );
    }, [dispatch, searchOpen]);

    useEffect(() => {
        if (!selectedUser) return;
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [selectedUser]);

    useEffect(() => {
        if (!jumpMessageId) return;
        messageRefs.current[jumpMessageId]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
        const timer = setTimeout(() => {
            dispatch({
                type: "CLEAR_JUMP_MESSAGE"
            });
        }, 2000);
    return () => clearTimeout(timer);
    }, [jumpMessageId, dispatch]);

    if (!selectedUser && !selectedGroup) {
        return (
            <div className="empty-chat">
                <div className="empty-chat-icon">💬</div>
                <h2>Welcome to ChatApp</h2>
                <p>
                    Select a user from the sidebar to start chatting instantly.
                </p>
            </div>
        );
    }
    if (loadingMessages) {
        return <p>Loading messages...</p>;
    }


    const filteredMessages = messages.filter(message => {
        if (!searchText?.trim()) return true;
        if (message.deletedForEveryone) return false;
        return message.text
            ?.toLowerCase()
            .includes(searchText.toLowerCase());
    });

    const formatMessageDate = (date) => {
        const today = new Date();
        const messageDate = new Date(date);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (messageDate.toDateString() === today.toDateString()) {
            return "Today";
        }
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        return messageDate.toLocaleDateString();
    };

    const matchedMessages = searchText?.trim()
        ? filteredMessages.filter(message =>
                message.text
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase())
            )
        : [];

    const handleUnpin = async () => {
        try {
            if (selectedGroup) {
                await API.delete(
                    `/groups/${selectedGroup._id}/unpin`
                );
            } else {
                await API.delete(
                    `/mssg/unpin/${currentUser._id}/${selectedUser._id}`
                );
            }
            dispatch({
                type: "CLEAR_PINNED_MESSAGE"
            });
        } catch (err) {
            console.error(err);
        }
    };

    let lastDate = "";

    return (
        <div className="chat-container">
            <ChatHeader
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                onlineUsers={onlineUsers}
                typingUser={typingUser}
                openGroupInfo={() => setShowGroupInfo(true)}
            />
            {
                showGroupInfo && selectedGroup && (
                    <GrpInfoModal
                        selectedGroup={selectedGroup}
                        closeModal={() => setShowGroupInfo(false)}
                    />
                )
            }
            {
                pinnedMessage?.message && (
                    <div className="pinned-banner">
                        <div
                            className="pinned-content"
                            onClick={() =>
                                dispatch({
                                    type: "SET_JUMP_MESSAGE",
                                    payload: pinnedMessage.message._id
                                })
                            }
                        >
                            <div className="pin-title">
                                📌 Pinned Message
                            </div>
                            <div className="pin-text">
                                <strong>
                                    {
                                        pinnedMessage.message.sender.username
                                    }
                                    :
                                </strong>
                                {" "}
                                {
                                    pinnedMessage.message.deletedForEveryone
                                        ? "🚫 This message was deleted"

                                        : pinnedMessage.message.mediaType === "image"
                                        ? "📷 Photo"

                                        : pinnedMessage.message.mediaType === "video"
                                        ? "🎥 Video"

                                        : pinnedMessage.message.mediaType === "file"
                                        ? `📄 ${pinnedMessage.message.fileName}`

                                        : pinnedMessage.message.text
                                }
                            </div>
                        </div>
                        <button
                            className="unpin-btn"
                            onClick={handleUnpin}
                        >
                            ✕
                        </button>
                    </div>
                )
            }
            {
                searchOpen && (
                    <div className="chat-search">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search messages..."
                            value={searchText}
                            onChange={(e) => {
                                dispatch({
                                    type: "SET_SEARCH_TEXT",
                                    payload: e.target.value
                                });
                                dispatch({
                                    type: "SET_SEARCH_INDEX",
                                    payload: 0
                                });
                            }}
                        />
                        <span className="search-count">
                            {
                                searchText.trim()
                                    ? (
                                        matchedMessages.length > 0
                                            ? `${searchIndex + 1}/${matchedMessages.length}`
                                            : "0/0"
                                    )
                                    : ""
                            }
                        </span>
                        <button
                            className="search-nav-btn"
                            disabled={searchIndex === 0}
                            onClick={() =>
                                dispatch({
                                    type: "PREVIOUS_SEARCH_RESULT"
                                })
                            }
                        >
                            <FaChevronUp />
                        </button>
                        <button
                            className="search-nav-btn"
                            disabled={
                                searchIndex >=
                                matchedMessages.length - 1
                            }
                            onClick={() =>
                                dispatch({
                                    type: "NEXT_SEARCH_RESULT"
                                })
                            }
                        >
                            <FaChevronDown />
                        </button>
                        <button
                            className="search-close-btn"
                            onClick={() => {
                                dispatch({
                                    type: "SET_SEARCH_TEXT",
                                    payload: ""
                                });
                                dispatch({
                                    type: "SET_SEARCH_INDEX",
                                    payload: 0
                                });
                                dispatch({
                                    type: "TOGGLE_SEARCH"
                                });
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>
                )
            }
            <div
                className="messages"
                ref={messagesRef}
            >
                {
                    messages.length > 0 ? (
                        filteredMessages.map((message, index) => {
                        const currentDate = formatMessageDate(message.createdAt);
                        const showDate = currentDate !== lastDate;
                        lastDate = currentDate;
                        return (
                            <React.Fragment key={message._id}>
                                {
                                    showDate && (
                                        <div className="date-divider">
                                            <span>{currentDate}</span>
                                        </div>
                                    )
                                }
                                <div
                                    ref={el => searchRefs.current[index] = el}
                                >
                                    <MessageBubble
                                        message={message}
                                        currentUser={currentUser}
                                        searchText={searchText}
                                        jumpMessageId={jumpMessageId}
                                        pinnedMessage={pinnedMessage}
                                    />
                                </div>
                            </React.Fragment>
                        );
                    })
                    ) : (
                        <div className="empty-chat-message">
                            <h2>💬</h2>
                            <h3>No Messages Yet</h3>
                            <p>
                                Start the conversation by sending the first message.
                            </p>
                        </div>
                    )
                }
                <div ref={bottomRef}></div>
            </div>
            <MessageInput
                handleSendMessage={handleSendMessage}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
            />
        </div>
    );
};

export default ChatContainer;
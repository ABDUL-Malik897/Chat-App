import React, { useEffect, useState } from 'react'
import Sidebar from "../component/Sidebar";
import ChatContainer from '../component/ChatContainer';
import useAuthContext from '../hooks/useAuthContext';
import API from '../api/axios';
import "./Home.css"
import socket from '../socket/socket';
import useChatContext from '../hooks/useChatContext';
import { showBrowserNotification } from "../utils/notification";
import { playNotificationSound } from "../utils/playNotificationSound";


const Home = () => {

    const { user } = useAuthContext()
    const { selectedUser, messages, dispatch: chatDispatch , onlineUsers , typingUser ,users , groups , selectedGroup  } = useChatContext();
    const [ loadingMssg , setLoadingMssg ] = useState(false)
    const [ loading ,setLoading ] = useState(true)
    const [ error , setError ] = useState("")

    useEffect(() => {
        if (!selectedUser) {
            chatDispatch({
                type: "SET_MESSAGES",
                payload: []
            })
            return
        }setLoadingMssg(true)
        const fetchMssg = async () => {
            try {
                const response = await API.get(`/mssg/${user._id}/${selectedUser._id}`)
                chatDispatch({
                    type: "SET_MESSAGES",
                    payload: response.data
                })
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingMssg(false)
            }
        }
        fetchMssg()
    }, [chatDispatch ,selectedUser , user]);

    useEffect(() => {
        if (!selectedGroup) return;
        const fetchGroupMessages = async () => {
            try {
                const response = await API.get(
                    `/groups/${selectedGroup._id}/messages`
                );
                chatDispatch({
                    type: "SET_MESSAGES",
                    payload: response.data
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchGroupMessages();
        socket.emit("joinGroup", selectedGroup._id);
        return () => {
            socket.emit("leaveGroup", selectedGroup._id);
        };
    }, [selectedGroup , chatDispatch]);

    const handleSendMessage = async (text , replyTo = null , file = null, audioBlob = null ) => {
        try {
            if (file || audioBlob) {
                const formData = new FormData();
                formData.append(
                    "file",
                    file || audioBlob,
                    audioBlob ? "voice.webm" : file.name
                );
                formData.append("sender", user._id);
                formData.append("text", text);
                if (replyTo) {
                    formData.append("replyTo", replyTo);
                }
                if (selectedGroup) {
                    await API.post(
                        `/groups/${selectedGroup._id}/messages`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data"
                            }
                        }
                    );
                } else {
                    formData.append("receiver", selectedUser._id);
                    const response = await API.post(
                        "/mssg/media",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data"
                            }
                        }
                    );
                    chatDispatch({
                        type: "ADD_MESSAGE",
                        payload: response.data
                    });
                }
            }
            else {
                if (selectedGroup) {
                    const response = await API.post(
                        `/groups/${selectedGroup._id}/messages`,
                        {
                            text,
                            replyTo
                        }
                    );
                    chatDispatch({
                        type: "ADD_MESSAGE",
                        payload: response.data
                    });
                } else {
                    const response = await API.post(
                        "/mssg",
                        {
                            sender: user._id,
                            receiver: selectedUser._id,
                            text,
                            replyTo
                        }
                    );
                    chatDispatch({
                        type: "ADD_MESSAGE",
                        payload: response.data
                    });
                }
            }
            chatDispatch({
                type: "CLEAR_REPLY_MESSAGE"
            });
        } catch (error) {
            console.error(error)
            }
    };

    useEffect(() => {
        socket.on("receiveGroupMessage", (message) => {
            if (
                selectedGroup &&
                message.group.toString() === selectedGroup._id.toString()
            ) {
                chatDispatch({
                    type: "ADD_MESSAGE",
                    payload: message
                });
            }
        });
        return () => {
            socket.off("receiveGroupMessage");
        };
    }, [selectedGroup, chatDispatch]);

    useEffect(() => {
        if (!user?._id) return;
        socket.connect();
        socket.on("connect", () => {
            socket.emit("addUser", user._id);
        });
        return () => {
            socket.off("connect");
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            const senderId = typeof message.sender === "object"
            ? message.sender._id
            : message.sender;
            const isCurrentChat = selectedUser && senderId.toString() === selectedUser._id.toString();
            if (!isCurrentChat) {
                playNotificationSound()
                showBrowserNotification(
                    message.sender.username,
                    message.text || "📎 Sent an attachment",
                    message.sender.profilePic
                );
            }
            if (isCurrentChat) {
            chatDispatch({
                type: "ADD_MESSAGE",
                payload: message
            });
        }
    });
        return () => {
            socket.off("receiveMessage")
        }
    },[selectedUser ,chatDispatch]);

    useEffect(() => {
        socket.on("getOnlineUsers", (users) => {
            chatDispatch({
                type: "SET_ONLINE_USERS",
                payload: users
            });
        })
        return () => {
            socket.off("getOnlineUsers")
        }
    },[chatDispatch]);

    useEffect(() => {
        socket.on("userTyping", (senderId) => {
            chatDispatch({
                type: "SET_TYPING_USER",
                payload: senderId
            });
        })
        socket.on("userStoppedTyping" , () => {
            chatDispatch({
                type: "SET_TYPING_USER",
                payload: null
            });
        })
        return () => {
            socket.off("userTyping")
            socket.off("userStoppedTyping")
        }
    },[chatDispatch]);

    useEffect(() => {
        socket.on("groupUserTyping", ({ senderId, groupId }) => {
            if (
                !selectedGroup ||
                selectedGroup._id.toString() !== groupId.toString()
            ) {
                return;
            }
            const typingUser = users.find(
                user => user._id.toString() === senderId.toString()
            );
            if (typingUser) {
                chatDispatch({
                    type: "SET_GROUP_TYPING_USER",
                    payload: typingUser
                });
            }
        });
        socket.on("groupUserStoppedTyping", ({ groupId }) => {
            if (
                !selectedGroup ||
                selectedGroup._id.toString() !== groupId.toString()
            ) {
                return;
            }
            chatDispatch({
                type: "CLEAR_GROUP_TYPING_USER"
            });
        });
        return () => {
            socket.off("groupUserTyping");
            socket.off("groupUserStoppedTyping");
        };
    }, [selectedGroup, users, chatDispatch]);

    useEffect(() => {
        chatDispatch({
            type: "SET_TYPING_USER",
            payload: null
        });
    },[selectedUser , chatDispatch]);

    useEffect(() => {
        if (!selectedUser) return
        const markMssgasRead = async () => {
            try {
                await API.patch('/mssg/read',{
                    senderId : selectedUser._id,
                    receiverId : user._id
                })
                socket.emit("markMssgRead" ,{
                    senderId : selectedUser._id,
                    receiverId : user._id
                })
            } catch (error) {
                console.error(error);
            }
        }
        markMssgasRead()
    },[selectedUser , user]);

    useEffect(() => {
        socket.on("mssgRead", async ({ senderId }) => {
            if (selectedUser?._id !== senderId) return;
            try {
                const response = await API.get(
                    `/mssg/${user._id}/${selectedUser._id}`
                );
                chatDispatch({
                    type: "SET_MESSAGES",
                    payload: response.data
                });
            } catch (error) {
                console.error(error);
            }
        });
        return () => socket.off('mssgRead')
    },[selectedUser ,user ,chatDispatch]);

    useEffect(() => {
        if (!selectedUser) return
        const unreadMssg = messages.some(msg => {
            const senderId = typeof msg.sender === "object"
            ? msg.sender._id
            : msg.sender;
            return (
                senderId.toString() === selectedUser._id.toString() &&
                msg.status === "Delivered"
            );
        });
        if (!unreadMssg) return;
        const markAsRead = async () => {
            await API.patch('/mssg/read', {
                senderId : selectedUser._id,
                receiverId : user._id
            })
            socket.emit("markMssgRead" , {
                senderId : selectedUser._id,
                receiverId : user._id
            })
        }
        markAsRead()
    },[messages ,user ,selectedUser]);

    useEffect(() => {
        socket.off("newUser");
        socket.on("newUser", (newUser) => {
            const exists = users.some(user => user._id === newUser._id);
            if (!exists) {
                chatDispatch({
                    type: "SET_USERS",
                    payload: [...users, newUser]
                });
            }
        });
        return () => {
            socket.off("newUser");
        };
    }, [chatDispatch , users]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                setError("")
                const response = await API.get('/users')
                chatDispatch({
                    type: "SET_USERS",
                    payload: response.data
                });
            } catch (error) {
                setError("failed to load users")
            } finally {
                setLoading(false)
            }
        }
        const fetchGroups = async () => {
            try {
                const res = await API.get("/groups");
                chatDispatch({
                    type: "SET_GROUPS",
                    payload: res.data
                });
            }
            catch (error) {
                console.log(error);
            }
        };
        fetchUsers()
        fetchGroups()
    },[chatDispatch]);

    useEffect(() => {
        socket.off("userUpdated");
        socket.on("userUpdated", (updatedUser) => {
            chatDispatch({
                type: "SET_USERS",
                payload: users.map(user =>
                    user._id === updatedUser._id
                    ? updatedUser
                    : user
                )
            });
            if (selectedUser?._id === updatedUser._id) {
                chatDispatch({
                    type: "SET_SELECTED_USER",
                    payload: updatedUser
                });
            }
        });
        return () => {
            socket.off("userUpdated");
        };
    }, [selectedUser ,chatDispatch ,users]);

    useEffect(() => {
        socket.on("messageDeletedForEveryone",(updatedMessage) => {
                chatDispatch({
                    type: "UPDATE_MESSAGE",
                    payload: updatedMessage
                });
            }
        );
        return () => {
            socket.off("messageDeletedForEveryone");
        };
    }, [chatDispatch]);

    useEffect(() => {
        socket.on(
            "messageReactionUpdated",
            (updatedMessage) => {
                chatDispatch({
                    type: "UPDATE_MESSAGE",
                    payload: updatedMessage
                });
            }
        );
        return () => {
            socket.off("messageReactionUpdated");
        };
    }, [chatDispatch]);

    useEffect(() => {
        socket.on(
            "messagePinned",
            (message) => {
                chatDispatch({
                    type: "SET_PINNED_MESSAGE",
                    payload: message
                });
            }
        );
        socket.on(
            "messageUnpinned",
            () => {
                chatDispatch({
                    type: "CLEAR_PINNED_MESSAGE"
                });
            }
        );
        return () => {
            socket.off("messagePinned");
            socket.off("messageUnpinned");
        };
    }, [chatDispatch]);

    useEffect(() => {
        const loadPinned = async () => {
            try {
                let response;
                if (selectedGroup) {
                    response = await API.get(
                        `/groups/${selectedGroup._id}/pinned`
                    );
                } else if (selectedUser) {
                    response = await API.get(
                        `/mssg/pinned/${user._id}/${selectedUser._id}`
                    );
                } else {
                    chatDispatch({
                        type: "CLEAR_PINNED_MESSAGE"
                    });
                    return;
                }
                chatDispatch({
                    type: "SET_PINNED_MESSAGE",
                    payload: response.data
                });
            } catch {
                chatDispatch({
                    type: "CLEAR_PINNED_MESSAGE"
                });
            }
        };
        loadPinned();
    }, [selectedUser, selectedGroup, user, chatDispatch]);

    useEffect(() => {
        socket.on("userDeleted", (userId) => {
            chatDispatch({
                type: "SET_USERS",
                payload: users.filter(user => user._id !== userId)
            });
            if (selectedUser?._id === userId) {
                chatDispatch({
                    type: "SET_SELECTED_USER",
                    payload: null
                });
            }
        });
        return () => {
            socket.off("userDeleted");
        };
    }, [users, selectedUser, chatDispatch]);

    useEffect(() => {
        socket.on("groupUpdated", (updatedGroup) => {
            chatDispatch({
                type: "UPDATE_GROUP",
                payload: updatedGroup
            });
        });
        return () => {
            socket.off("groupUpdated");
        };
    }, [chatDispatch]);

    return (
    <div className="home">
        <div className="sidebar">
            <Sidebar
                users={users}
                loading={loading}
                error={error}
                selectedUser={selectedUser}
                chatDispatch={chatDispatch}
                onlineUsers={onlineUsers}
                groups={groups}
                selectedGroup={selectedGroup}
            />
        </div>
        <div className="chat-container">
            <ChatContainer
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                messages={messages}
                loadingMessages={loadingMssg}
                handleSendMessage={handleSendMessage}
                onlineUsers={onlineUsers}
                typingUser={typingUser}
                currentUser={user}
            />
        </div>
    </div>
);
}

export default Home
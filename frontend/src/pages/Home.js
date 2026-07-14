import React, { useEffect, useState } from 'react'
import Sidebar from "../component/Sidebar";
import ChatContainer from '../component/ChatContainer';
import useAuthContext from '../hooks/useAuthContext';
import API from '../api/axios';
import socket from '../socket/socket';
import "../index.css"
import useChatContext from '../hooks/useChatContext';


const Home = () => {

    // const [ selectedUser , setSelectedUser ] = useState(null)
    const { user } = useAuthContext()
    // const [ messages , setMessages ] = useState([])
    const { selectedUser, messages, dispatch: chatDispatch , onlineUsers , typingUser ,users  } = useChatContext();
    const [ loadingMssg , setLoadingMssg ] = useState(false)
    // const [ onlineUsers , setOnlineUsers ] = useState([])
    // const [ typingUser , setTypingUser ] = useState(null)
    // const [users, setUsers] = useState([])
    const [ loading ,setLoading ] = useState(true)
    const [ error , setError ] = useState("")
    // const [scrollAction, setScrollAction] = useState(null);

    // const clearScrollAction = () => {
    //     setScrollAction(null);
    // };


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
    }, [chatDispatch ,selectedUser , user])

    const handleSendMessage = async (text , replyTo = null , file = null, audioBlob = null ) => {
        try {
            if (file || audioBlob) {
                const formData = new FormData();
                formData.append("file", file || audioBlob, audioBlob ? "voice.webm" : file.name);
                formData.append("sender", user._id);
                formData.append("receiver", selectedUser._id);
                formData.append("text", text);
                if (replyTo) {
                    formData.append("replyTo", replyTo)
                }
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
            } else {
                const response = await API.post("/mssg", {
                    sender: user._id,
                    receiver: selectedUser._id,
                    text,
                    replyTo
                });
                chatDispatch({
                    type: "ADD_MESSAGE",
                    payload: response.data
                });
            }
            chatDispatch({
                type: "CLEAR_REPLY_MESSAGE"
            });
        } catch (error) {
            console.error(error)
            }
    }

    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect()
        }
    },[])
    useEffect(() =>{
        if (user?._id) {
            socket.emit("addUser" , user._id)
        }
    },[user])
    useEffect(() => {
        socket.on("receiveMessage", (message) => {
            const senderId = typeof message.sender === "object"
            ? message.sender._id
            : message.sender;

            if (selectedUser && senderId.toString() === selectedUser._id.toString()) {
            chatDispatch({
                type: "ADD_MESSAGE",
                payload: message
            });
        }
    });
        return () => {
            socket.off("receiveMessage")
        }
    },[selectedUser ,chatDispatch])
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
    },[chatDispatch])
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
    },[chatDispatch])
    useEffect(() => {
        chatDispatch({
            type: "SET_TYPING_USER",
            payload: null
        });
    },[selectedUser , chatDispatch])
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
    },[selectedUser , user])
    useEffect(() => {
        socket.on("mssgRead",  async ({ receiverId }) => {
            if (selectedUser?._id !== receiverId) return;
            // setMessages(prev => 
            //     prev.map(msg => ({
            //         ...msg, status : msg.status === "Delivered" ? "Read" : msg.status
            //     }))
            // )
            try {
                const response = await API.get(`/mssg/${user._id}/${selectedUser._id}`)
                chatDispatch({
                    type: "SET_MESSAGES",
                    payload: response.data
                })
            } catch (error) {
                console.error(error);
            }
        })
        return () => socket.off('mssgRead')
    },[selectedUser ,user ,chatDispatch])
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
    },[messages ,user ,selectedUser])
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
    }, [chatDispatch , users])
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
        fetchUsers()
    },[chatDispatch])
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

        if (!selectedUser) return;

        const loadPinned = async () => {

            try {

                const response =
                    await API.get(
                        `/mssg/pinned/${user._id}/${selectedUser._id}`
                    );

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

    }, [selectedUser, user, chatDispatch]);


    return (
        <div className='home'>
            <div className='sidebar'>
                <Sidebar
                    users={users}
                    loading={loading}
                    error={error}
                    selectedUser={selectedUser}
                    chatDispatch={chatDispatch}
                    onlineUsers={onlineUsers}
                />
            </div>
            <div className='chat-container'>
                <ChatContainer 
                    selectedUser={selectedUser} 
                    messages={messages} 
                    loadingMessages = {loadingMssg}
                    handleSendMessage={handleSendMessage}
                    onlineUsers={onlineUsers}
                    typingUser={typingUser}
                    currentUser={user}
                    // scrollAction={scrollAction}
                    // clearScrollAction={clearScrollAction}
                />
            </div>
        </div>
    )
}

export default Home
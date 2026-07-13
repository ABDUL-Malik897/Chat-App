import React, { useRef, useState } from 'react';
import socket from "../socket/socket";
import useAuthContext from '../hooks/useAuthContext';
import useChatContext from "../hooks/useChatContext";


const MessageInput = ({ handleSendMessage , selectedUser }) => {

    const [ text , setText ] = useState('')
    const [ sending ,setSending ] = useState(false)
    const { user } = useAuthContext()
    const typingTimeout = useRef(null)
    const { replyMessage , dispatch : chatDispatch } = useChatContext()
    const fileInputRef = useRef(null)
    const [selectedFile, setSelectedFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef(null);

    const handleSend = async () => {

        if (!text.trim() && !selectedFile && !audioBlob) return
        setSending(true)
        await handleSendMessage(text, replyMessage?._id , selectedFile, audioBlob)
        chatDispatch({type : "CLEAR_REPLY_MESSAGE"})
        if (typingTimeout) {
            clearTimeout(typingTimeout)
        }
        socket.emit("stopTyping",{
            senderId : user._id,
            receiverId : selectedUser._id
        })
        setText("") 
        setSelectedFile(null);
        setAudioBlob(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setSending(false)
    }

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRecord = async () => {
        if (!recording) {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
            const recorder =
                new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            recorder.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob =
                    new Blob(audioChunksRef.current, {
                        type: "audio/webm"
                    });
                setAudioBlob(blob);
                clearInterval(timerRef.current);
                setRecordingTime(0);
                stream.getTracks().forEach(track => track.stop());
                audioChunksRef.current = [];
            };
            recorder.start();
            timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000)
            setRecording(true);
        } else {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const formatTime = (seconds) => {

        const min = Math.floor(seconds / 60);

        const sec = seconds % 60;

        return `${min}:${sec.toString().padStart(2,"0")}`;

    };

    const handleCancelRecording = () => {

        mediaRecorderRef.current.stop();

        setAudioBlob(null);

        clearInterval(timerRef.current);

        setRecording(false);

        setRecordingTime(0);

    };

    return (
        <>
        {
            replyMessage && (
                <div className="reply-preview">
                    <div className="reply-content">
                        <strong>
                            Replying to {replyMessage.sender.username}
                        </strong>
                        <p>
                            {replyMessage.text}
                        </p>
                    </div>
                    <button
                    className="reply-close-btn"
                    onClick={() =>
                        chatDispatch({
                        type: "CLEAR_REPLY_MESSAGE"
                        })
                    }
                    >
                    ✕
                    </button>
                </div>
            )
        }
        {
            audioBlob && (
                <div className="audio-preview">

                    <div className="audio-preview-header">

                        <h4>🎤 Voice Message</h4>

                        <button
                            className="remove-audio-btn"
                            onClick={() => setAudioBlob(null)}
                        >
                            ✕
                        </button>

                    </div>

                    <audio
                        controls
                        src={URL.createObjectURL(audioBlob)}
                    />

                </div>
            )
        }
        {
            recording && (

                <div className="recording-indicator">

                    <span className="record-dot"></span>

                    Recording...

                    <span className="record-time">

                        {formatTime(recordingTime)}

                    </span>

                </div>

            )
        }
        {
            recording && (

                <button
                    className="cancel-record-btn"
                    onClick={handleCancelRecording}
                >

                    🗑 Cancel

                </button>

            )
        }
        <div className='message-input-container'>
            {
                selectedFile && (
                    <div className="media-preview">
                        {
                            selectedFile.type.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="preview"
                                />
                            ) : (
                                <span>
                                    📎 {selectedFile.name}
                                    {/* <button
                                    className="mic-btn"
                                    onClick={handleRecord}
                                    >🎤
                                    </button> */}
                                </span>
                                
                            )
                        }
                        <button
                            className="remove-media-btn"
                            onClick={handleRemoveFile}
                        >
                            ✕
                        </button>
                    </div>
                )
            }
            <input
            type="file"
            ref={fileInputRef}
            disabled={recording}
            style={{ display: "none" }}
            onChange={(e) => {
                if (e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                }
            }}
            />
            <button
                className="attach-btn"
                onClick={() => fileInputRef.current.click()}
            >
                📎
            </button>
            <button
                className="mic-btn"
                onClick={handleRecord}
            >
                {recording ? "⏹" : "🎤"}
            </button>
            <input 
            className='message-input'
            disabled={recording}
            type='text'
            placeholder='Type a message...'
            value={text}
            onChange={(e) => {
                setText(e.target.value)
                if (e.target.value.trim()) {
                    socket.emit("typing" , {
                        senderId : user._id,
                        receiverId : selectedUser._id
                    })
                } else {
                    socket.emit("stopTyping" , {
                        senderId : user._id,
                        receiverId : selectedUser._id
                    })
                }
                if (typingTimeout.current) {
                    clearTimeout(typingTimeout.current)
                }
                typingTimeout.current = setTimeout(() => {
                    socket.emit("stopTyping" , {
                        senderId : user._id,
                        receiverId : selectedUser._id
                    })
                }, 1000)
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSend()
                }
            }}
            />
            <button 
            className='send-btn'
            onClick={handleSend} 
            disabled={sending}>
                {sending ? <>⏳ Sending...</> : <>📤 Send</>}
            </button>
        </div>
        </>
    )
}

export default MessageInput
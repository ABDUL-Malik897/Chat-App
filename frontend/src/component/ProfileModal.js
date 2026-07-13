import React, { useRef, useState } from 'react'
import API from '../api/axios'
import useAuthContext from '../hooks/useAuthContext'


const ProfileModal = ({ closeModal }) => {

    const { user ,dispatch } = useAuthContext()
    const fileRef = useRef()
    const [uploading ,setUploading] = useState(false)

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            alert("Please select a valid image")
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be less than 5MB.");
            return;
        }
        const formData = new FormData()
        formData.append("profilePic", file)
        try {
            setUploading(true)
            const response = await API.patch(`/users/profile/${user._id}`,
                formData,
                {
                    headers : {
                        "Content-Type" : "multipart/form-data"
                    }
                }
            )
            dispatch({
                type : "LOGIN",
                payload : response.data
            })
            localStorage.setItem("user",JSON.stringify(response.data))
            closeModal()
        } catch (error) {
            alert(error.response?.data?.message || "Upload failed.");
            console.error(error);
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='profile-modal'>
            <h2>Profile Picture</h2>
            <button
            disabled={uploading}
            onClick={() => fileRef.current.click()}>
                {uploading ? "⏳ Uploading..." : "📷 Choose Image"}
            </button>
            <button onClick={closeModal}>Close</button>
            <input 
            type='file'
            accept='image/*'
            hidden
            ref={fileRef}
            onChange={handleUpload}/>
        </div>
    )
}

export default ProfileModal
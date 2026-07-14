import React, { useState } from "react";
import API from "../api/axios";
import useAuthContext from "../hooks/useAuthContext";

const ProfileModal = ({ closeModal }) => {
    const { user, dispatch } = useAuthContext();

    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio || "");
    const [profilePic, setProfilePic] = useState(user.profilePic);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSaveProfile = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("username", username);
            formData.append("bio", bio);

            if (selectedFile) {
                formData.append("profilePic", selectedFile);
            }

            const response = await API.patch(
                "/users/profile",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            const updatedUser = {...user, ...response.data}

            dispatch({
                type: "LOGIN",
                payload: updatedUser
            });

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            )

            closeModal();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to update profile."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="profile-overlay"
        onClick={closeModal}>
        <div className="profile-modal"
        onClick={(e) => e.stopPropagation()}>

            <h2>My Profile</h2>

            <button
                className="close-profile-btn"
                onClick={closeModal}
            >
                ✕
            </button>

            <div className="profile-avatar-preview">

                {
                    profilePic ? (

                        <img
                            src={profilePic}
                            alt="Profile"
                            className="profile-avatar"
                        />

                    ) : (

                        <div className="profile-avatar-placeholder">
                            {username.charAt(0).toUpperCase()}
                        </div>

                    )
                }

            </div>

            <input
                type="file"
                id="profile-upload"
                hidden
                accept="image/*"
                onChange={(e) => {

                    if (!e.target.files[0]) return;

                    setSelectedFile(e.target.files[0]);

                    setProfilePic(
                        URL.createObjectURL(
                            e.target.files[0]
                        )
                    );

                }}
            />

            <label
                htmlFor="profile-upload"
                className="change-photo-btn"
            >
                📷 Change Photo
            </label>

            <div className="profile-field">

                <label>Username</label>

                <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

            </div>

            <div className="profile-field">

                <label>Email</label>

                <input
                    type="email"
                    value={user.email}
                    readOnly
                />

            </div>

            <div className="profile-field">

                <label>About</label>

                <textarea
                    rows={3}
                    maxLength={120}
                    value={bio}
                    onChange={(e) =>
                        setBio(e.target.value)
                    }
                />

                <div className="bio-counter">
                    {bio.length}/120
                </div>

            </div>

            <button
                className="profile-save-btn"
                onClick={handleSaveProfile}
                disabled={loading}
            >
                {
                    loading
                        ? "Saving..."
                        : "Save Changes"
                }
            </button>

        </div>
        </div>
    );
};

export default ProfileModal;
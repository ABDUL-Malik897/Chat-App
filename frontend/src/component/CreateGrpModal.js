import React, { useEffect, useState } from "react";
import API from "../api/axios";
import useAuthContext from "../hooks/useAuthContext";
import "./CreateGrpModal.css"

const CreateGrpModal = ({ closeModal }) => {

    const { user } = useAuthContext();
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get("/users");
                setUsers(
                    res.data.filter(
                        u => u._id !== user._id
                    )
                );
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [user]);

    const toggleMember = (id) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(
                selectedMembers.filter(member => member !== id)
            );
        } else {
            setSelectedMembers([
                ...selectedMembers,
                id
            ]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            return alert("Please enter a group name.");
        }
        if (selectedMembers.length === 0) {
            return alert("Select at least one member.");
        }
        try {
            setLoading(true);
            await API.post("/groups", {
                name: groupName,
                description,
                members: selectedMembers
            });
            alert("Group created successfully!");
            closeModal();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                "Failed to create group."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="profile-overlay"
            onClick={closeModal}
        >
            <div
                className="profile-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="close-profile-btn"
                    onClick={closeModal}
                >
                    ✕
                </button>
                <h2>👥 Create Group</h2>
                <div className="profile-field">
                    <label>Group Name</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) =>
                            setGroupName(e.target.value)
                        }
                    />
                </div>
                <div className="profile-field">
                    <label>Description</label>
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />
                </div>
                <h3>Select Members</h3>
                {
                    loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <div className="group-users-list">
                            {
                                users.map(user => (
                                    <div
                                        key={user._id}
                                        className={`group-user-item ${
                                            selectedMembers.includes(user._id)
                                                ? "selected-member"
                                                : ""
                                        }`}
                                        onClick={() => toggleMember(user._id)}
                                    >
                                        {
                                            user.profilePic ? (
                                                <img
                                                    src={user.profilePic}
                                                    alt={user.username}
                                                    className="avatar"
                                                />
                                            ) : (
                                                <div className="avatar">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                            )
                                        }
                                        <span>
                                            {user.username}
                                        </span>
                                        {
                                            selectedMembers.includes(user._id) && (
                                                <span className="selected-check">
                                                    ✔
                                                </span>
                                            )
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
                <button 
                    className="profile-save-btn"
                    onClick={handleCreateGroup}
                    disabled={loading}
                >
                    {
                        loading
                            ? "Creating..."
                            : "Create Group"
                    }
                </button>
            </div>
        </div>
    );
};

export default CreateGrpModal;
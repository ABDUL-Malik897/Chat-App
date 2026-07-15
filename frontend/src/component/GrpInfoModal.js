import React, { useEffect, useState ,useRef } from "react";
import API from "../api/axios";
import useChatContext from "../hooks/useChatContext";
import useAuthContext from '../hooks/useAuthContext';
import "./GrpInfoModal.css"


const GroupInfoModal = ({ selectedGroup, closeModal }) => {

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [groupName, setGroupName] = useState("");
    const { dispatch: chatDispatch , groups } = useChatContext();
    const { user } = useAuthContext();
    const fileInputRef = useRef(null);
    const [editingDescription, setEditingDescription] = useState(false);
    const [groupDescription, setGroupDescription] = useState("");
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await API.get(
                    `/groups/${selectedGroup._id}`
                );
                setGroup(response.data);
                setGroupName(response.data.name);
                setGroupDescription(response.data.description || "");
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await API.get("/users");
                setAllUsers(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUsers()
        fetchGroup();
    }, [selectedGroup]);

    if (loading) {
        return (
            <div className="profile-overlay">
                <div className="profile-modal">
                    Loading...
                </div>
            </div>
        );
    }

    const handleRename = async () => {
        try {
            const response = await API.patch(
                `/groups/${selectedGroup._id}`,
                {
                    name: groupName
                }
            );
            setGroup(response.data);
            setGroupName(response.data.name);
            setEditingName(false);
            chatDispatch({
                type: "UPDATE_GROUP",
                payload: response.data
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleGroupPicChange = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("image", file);
            const response = await API.patch(
                `/groups/${selectedGroup._id}/icon`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            setGroup(response.data);
            setGroupName(response.data.name);
            chatDispatch({
                type: "UPDATE_GROUP",
                payload: response.data
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDescriptionUpdate = async () => {
        try {
            const response = await API.patch(
                `/groups/${selectedGroup._id}/description`,
                {
                    description: groupDescription
                }
            );
            setGroup(response.data);
            chatDispatch({
                type: "UPDATE_GROUP",
                payload: response.data
            });
            setEditingDescription(false);
        } catch (error) {
            console.error(error);
        }
    };

    const availableUsers = allUsers.filter(user =>!group?.members.some(member => member._id === user._id));
    const toggleMember = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id)
                ? prev.filter(member => member !== id)
                : [...prev, id]
        );
    };

    const handleAddMembers = async () => {
        try {
            if (selectedMembers.length === 0) return;
            const response = await API.patch(
                `/groups/${selectedGroup._id}/members`,
                {
                    members: selectedMembers
                }
            );
            setGroup(response.data);
            chatDispatch({
                type: "UPDATE_GROUP",
                payload: response.data
            });
            setSelectedMembers([]);
            setShowAddMembers(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            const response = await API.patch(
                `/groups/${selectedGroup._id}/remove-member`,
                {
                    memberId
                }
            );
            setGroup(response.data);
            chatDispatch({
                type: "UPDATE_GROUP",
                payload: response.data
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleLeaveGroup = async () => {
        try {
            await API.patch(
                `/groups/${selectedGroup._id}/leave`
            );
            chatDispatch({
                type: "SET_GROUPS",
                payload: groups.filter(
                    g => g._id !== selectedGroup._id
                ) || []
            });
            chatDispatch({
                type: "SET_SELECTED_GROUP",
                payload: null
            });
            closeModal();
        } catch (error) {
            console.error(error);
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
                <div
                    className="profile-avatar-preview"
                    onClick={() => {
                        if (group.admin?._id === user._id) {
                            fileInputRef.current.click();
                        }
                    }}
                    style={{
                        cursor:
                            group.admin?._id === user._id
                                ? "pointer"
                                : "default"
                    }}
                >
                    {
                        group.groupPic ? (
                            <img
                                src={group.groupPic}
                                alt={group.name}
                                className="profile-avatar"
                            />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                👥
                            </div>
                        )
                    }
                </div>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleGroupPicChange}
                />
                {
                    group.admin?._id === user._id && (
                        <p
                            style={{
                                fontSize: "12px",
                                color: "#777",
                                marginTop: "6px"
                            }}
                        >
                            Click image to change
                        </p>
                    )
                }
                {
                    editingName ? (
                        <div className="rename-group">
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) =>
                                    setGroupName(e.target.value)
                                }
                            />
                            <button
                                onClick={handleRename}
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <h2>
                            {group.name}
                            {
                                group.admin?._id === user._id && (
                                    <button
                                        className="edit-group-btn"
                                        onClick={() =>
                                            setEditingName(true)
                                        }
                                    >
                                        ✏️
                                    </button>
                                )
                            }
                        </h2>
                    )
                }
                <p>
                    {group.members?.length} Members
                </p>
                {
                    group.admin?._id === user._id && (
                        <button
                            className="add-members-btn"
                            onClick={() => setShowAddMembers(true)}
                        >
                            ➕ Add Members
                        </button>
                    )
                }
                <hr />
                {
                    group.admin?._id !== user._id && (
                        <button
                            className="leave-group-btn"
                            onClick={handleLeaveGroup}
                        >
                            🚪 Leave Group
                        </button>
                    )
                }
                <div className="group-description-section">
                    <div className="section-header">
                        <h4>Description</h4>
                        {
                            group.admin?._id === user._id &&
                            !editingDescription && (
                                <button
                                    className="edit-group-btn"
                                    onClick={() =>
                                        setEditingDescription(true)
                                    }
                                >
                                    ✏️
                                </button>
                            )
                        }
                    </div>
                    {
                        editingDescription ? (
                            <div className="rename-group">
                                <textarea
                                    value={groupDescription}
                                    onChange={(e) =>
                                        setGroupDescription(e.target.value)
                                    }
                                    rows={4}
                                    placeholder="Write a group description..."
                                />
                                <div className="group-edit-actions">
                                    <button
                                        onClick={handleDescriptionUpdate}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingDescription(false);
                                            setGroupDescription(group.description || "");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>
                                {group.description || "No description"}
                            </p>
                        )
                    }
                </div>
                <hr />
                <h3>Members</h3>
                {
                    group.members?.map(member => (
                        <div
                            key={member._id}
                            className="group-member"
                        >
                            {
                                member.profilePic ? (
                                    <img
                                        src={member.profilePic}
                                        alt={member.username}
                                        className="avatar"
                                    />
                                ) : (
                                    <div className="avatar">
                                        {member.username.charAt(0)}
                                    </div>
                                )
                            }
                            <div>
                                <strong>
                                    {member.username}
                                </strong>
                                <p>
                                    {member.bio || "No bio"}
                                </p>
                            </div>
                            {
                                group.admin?._id === user._id &&
                                member._id !== user?._id && (
                                    <button
                                        className="remove-member-btn"
                                        onClick={() =>
                                            handleRemoveMember(member._id)
                                        }
                                    >
                                        ❌
                                    </button>
                                )
                            }
                        </div>
                    ))
                }
            </div>
            {
                showAddMembers && (
                    <div
                        className="profile-overlay"
                        onClick={() => setShowAddMembers(false)}
                    >
                        <div
                            className="profile-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2>Add Members</h2>
                            {
                                availableUsers.length === 0 ? (
                                    <p>No users available.</p>
                                ) : (
                                    availableUsers.map(user => (
                                        <div
                                            key={user._id}
                                            className="group-member"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(user._id)}
                                                onChange={() =>
                                                    toggleMember(user._id)
                                                }
                                            />
                                            {
                                                user.profilePic ? (
                                                    <img
                                                        src={user.profilePic}
                                                        alt={user.username}
                                                        className="avatar"
                                                    />
                                                ) : (
                                                    <div className="avatar">
                                                        {user.username.charAt(0)}
                                                    </div>
                                                )
                                            }
                                            <span>
                                                {user.username}
                                            </span>
                                        </div>
                                    ))
                                )
                            }
                            <button
                                className="send-btn-grp"
                                onClick={handleAddMembers}
                            >
                                Add Selected Members
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    );

};

export default GroupInfoModal;
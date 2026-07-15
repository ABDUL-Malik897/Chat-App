import React, { useState } from 'react';
import SearchBar from './SearchBar';
import UserCard from './UserCard';
import GroupCard from "./GroupCard";
import CreateGrpModal from './CreateGrpModal';
import useAuthContext from "../hooks/useAuthContext";
import "./Sidebar.css"

const Sidebar = ({ users, groups, loading, error, selectedUser, selectedGroup, chatDispatch, onlineUsers}) => {

    const [search, setSearch] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const { user: authUser } = useAuthContext();

    const filterUsers = users.filter((u) => u._id !== authUser?._id && u.username.toLowerCase().includes(search.toLowerCase()));
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading users...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="error-box">
                <h3>⚠️ Something went wrong</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="sidebar-container">
            <SearchBar
                search={search}
                setSearch={setSearch}
            />
            <button
                className="create-group-btn"
                onClick={() => setShowCreateGroup(true)}
            >
                👥 New Group
            </button>
            <div className="user-list">
                {groups.length > 0 && (
                    <>
                        <h3 className="sidebar-title">
                            👥 Groups
                        </h3>
                        {groups.map((group) => (
                            <GroupCard
                                key={group._id}
                                group={group}
                                selectedGroup={selectedGroup}
                                chatDispatch={chatDispatch}
                            />
                        ))}
                        <hr className="sidebar-divider" />
                        <h3 className="sidebar-title">
                            💬 Chats
                        </h3>
                    </>
                )}
                {filterUsers.length > 0 ? (
                    filterUsers.map((chatUser) => (
                        <UserCard
                            key={chatUser._id}
                            user={chatUser}
                            selectedUser={selectedUser}
                            chatDispatch={chatDispatch}
                            onlineUsers={onlineUsers}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <h3>🔍</h3>
                        <h4>No Users Found</h4>
                        <p>Try searching with another name.</p>
                    </div>
                )}
            </div>
            {showCreateGroup && (
                <CreateGrpModal
                    closeModal={() => setShowCreateGroup(false)}
                />
            )}
        </div>
    );
};

export default Sidebar;
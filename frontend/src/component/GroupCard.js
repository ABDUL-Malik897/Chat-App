import React from "react";
import "./GroupCard.css"

const GroupCard = ({group, selectedGroup, chatDispatch}) => {

    return (
        <div
            className={`user-card ${
                selectedGroup?._id === group._id
                    ? "active"
                    : ""
            }`}
            onClick={() =>
                chatDispatch({
                    type: "SET_SELECTED_GROUP",
                    payload: group
                })
            }
        >
            {
                group.groupPic ? (
                    <img
                        src={group.groupPic}
                        alt={group.name}
                        className="avatar"
                    />
                ) : (
                    <div className="avatar">
                        👥
                    </div>
                )
            }
            <div className="user-info">
                <h4>{group.name}</h4>
                <p>{group.members.length} members</p>
            </div>
        </div>
    );
};

export default GroupCard;
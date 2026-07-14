import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import API from "../api/axios";
import useAuthContext from "../hooks/useAuthContext";

const SettingsModal = ({ closeModal }) => {

    const { darkMode, setDarkMode, themeColor, setThemeColor } = useTheme();
    const { user, dispatch } = useAuthContext();
    const [lastSeenPrivacy, setLastSeenPrivacy] = useState(user.lastSeenPrivacy || "everyone");
    const [profilePhotoPrivacy, setProfilePhotoPrivacy] = useState(user.profilePhotoPrivacy || "everyone");
    const [aboutPrivacy, setAboutPrivacy] = useState(user.aboutPrivacy || "everyone");
    const [readReceipts, setReadReceipts] = useState(user.readReceipts ?? true);
    const [savingPrivacy, setSavingPrivacy] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);


    const handleSavePrivacy = async () => {

        try {

            setSavingPrivacy(true);

            const response = await API.patch(
                "/users/profile",
                {
                    lastSeenPrivacy,
                    profilePhotoPrivacy,
                    aboutPrivacy,
                    readReceipts
                }
            );

            const updatedUser = {
                ...user,
                ...response.data
            };

            dispatch({
                type: "LOGIN",
                payload: updatedUser
            });

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );
            closeModal()

        } catch (error) {

            console.error(error);

        } finally {

            setSavingPrivacy(false);

        }

    };

    const handleChangePassword = async () => {

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return alert("Please fill all fields.");
        }

        if (newPassword !== confirmPassword) {
            return alert("Passwords do not match.");
        }

        try {

            setChangingPassword(true);

            const response = await API.patch(
                "/users/change-password",
                {
                    currentPassword,
                    newPassword
                }
            );

            alert(response.data.message);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            closeModal()

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to change password."
            );

        } finally {

            setChangingPassword(false);

        }

    };

    return (
        <div
            className="settings-overlay"
            onClick={closeModal}
        >

            <div
                className="settings-modal"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="settings-header">

                    <h2>⚙ Settings</h2>

                    <button
                        className="close-settings-btn"
                        onClick={closeModal}
                    >
                        ✕
                    </button>

                </div>

                <div className="settings-body">

                    {/* GENERAL */}

                    <div className="settings-section">

                        <h3>General</h3>

                        <div className="setting-item">

                            <div>

                                <h4>🌙 Dark Mode</h4>

                                <p>
                                    Switch between light and dark theme.
                                </p>

                            </div>

                            <label className="switch">

                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={() =>
                                        setDarkMode(!darkMode)
                                    }
                                />

                                <span className="slider"></span>

                            </label>

                        </div>

                        <div className="setting-item">

                            <div>

                                <h4>🎨 Theme Color</h4>

                                <p>
                                    Personalize your chat experience.
                                </p>

                            </div>

                            <div className="theme-picker">

                                <button
                                    className={`theme-circle blue ${
                                        themeColor === "blue"
                                            ? "active-theme"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setThemeColor("blue")
                                    }
                                />

                                <button
                                    className={`theme-circle green ${
                                        themeColor === "green"
                                            ? "active-theme"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setThemeColor("green")
                                    }
                                />

                                <button
                                    className={`theme-circle purple ${
                                        themeColor === "purple"
                                            ? "active-theme"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setThemeColor("purple")
                                    }
                                />

                                <button
                                    className={`theme-circle black ${
                                        themeColor === "black"
                                            ? "active-theme"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setThemeColor("black")
                                    }
                                />

                            </div>

                        </div>

                    </div>

                    {/* CHATS */}

                    <div className="settings-section">

                        <h3>Chats</h3>

                        <p>
                            Chat settings will be added in Phase 9.2.5.
                        </p>

                    </div>

                    {/* PRIVACY */}

                    <div className="settings-section">

                        <h3>🔒 Privacy</h3>

                        <div className="setting-item">

                            <label>Last Seen</label>

                            <select
                                value={lastSeenPrivacy}
                                onChange={(e) =>
                                    setLastSeenPrivacy(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="everyone">
                                    Everyone
                                </option>

                                <option value="contacts">
                                    Contacts
                                </option>

                                <option value="nobody">
                                    Nobody
                                </option>

                            </select>

                        </div>

                        <div className="setting-item">

                            <label>Profile Photo</label>

                            <select
                                value={profilePhotoPrivacy}
                                onChange={(e) =>
                                    setProfilePhotoPrivacy(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="everyone">
                                    Everyone
                                </option>

                                <option value="contacts">
                                    Contacts
                                </option>

                                <option value="nobody">
                                    Nobody
                                </option>

                            </select>

                        </div>

                        <div className="setting-item">

                            <label>About</label>

                            <select
                                value={aboutPrivacy}
                                onChange={(e) =>
                                    setAboutPrivacy(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="everyone">
                                    Everyone
                                </option>

                                <option value="contacts">
                                    Contacts
                                </option>

                                <option value="nobody">
                                    Nobody
                                </option>

                            </select>

                        </div>

                        <div className="setting-item">

                            <label>
                                Read Receipts
                            </label>

                            <input
                                type="checkbox"
                                checked={readReceipts}
                                onChange={() =>
                                    setReadReceipts(
                                        !readReceipts
                                    )
                                }
                            />

                        </div>

                        <button
                            className="save-settings-btn"
                            onClick={handleSavePrivacy}
                            disabled={savingPrivacy}
                        >

                            {
                                savingPrivacy
                                    ? "Saving..."
                                    : "Save Privacy"
                            }

                        </button>

                    </div>

                    {/* SECURITY */}

                    <div className="settings-section">

                        <h3>🛡 Security</h3>

                        <div className="profile-field">

                            <label>Current Password</label>

                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                            />

                        </div>

                        <div className="profile-field">

                            <label>New Password</label>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                            />

                        </div>

                        <div className="profile-field">

                            <label>Confirm Password</label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                            />

                        </div>

                        <button
                            className="save-settings-btn"
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                        >
                            {
                                changingPassword
                                    ? "Changing..."
                                    : "Change Password"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );

};

export default SettingsModal;
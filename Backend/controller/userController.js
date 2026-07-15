import users from "../models/users.js";
import { io } from "../server.js";
import bcrypt from "bcrypt";
import Message from "../models/message.js";


export const getUsers = async (req ,res) => {
    try {
        const user = await users.find().select('-password')
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
};

export const updateProfilePic = async (req ,res) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({
                message : "No image uploaded"
            })
        }
        const user = await users.findByIdAndUpdate(req.params.id,
            {
                profilePic : req.file.path
            },{
                new :true
            }
        ).select("-password")
        io.emit("userUpdated", user);
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            message: error.message
        })
    }
}

export const getProfile = async (req, res) => {
    try {
        const user = await users.findById(req.user.id).select("-password");
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updates = {
            username: req.body.username,
            bio: req.body.bio,
            lastSeenPrivacy: req.body.lastSeenPrivacy,
            profilePhotoPrivacy: req.body.profilePhotoPrivacy,
            aboutPrivacy: req.body.aboutPrivacy,
            readReceipts: req.body.readReceipts
        };
        
        if (req.body.username !== undefined) {
            updates.username = req.body.username;
        }
        if (req.body.bio !== undefined) {
            updates.bio = req.body.bio;
        }
        if (req.body.lastSeenPrivacy !== undefined) {
            updates.lastSeenPrivacy = req.body.lastSeenPrivacy;
        }
        if (req.body.profilePhotoPrivacy !== undefined) {
            updates.profilePhotoPrivacy = req.body.profilePhotoPrivacy;
        }
        if (req.body.aboutPrivacy !== undefined) {
            updates.aboutPrivacy = req.body.aboutPrivacy;
        }
        if (req.body.readReceipts !== undefined) {
            updates.readReceipts = req.body.readReceipts === "true";
        }
        if (req.file) {
            updates.profilePic = req.file.path;
        }
        const updatedUser = await users.findByIdAndUpdate(
            req.user.id,
            updates,
            {
                new: true
            }
        ).select("-password");
        io.emit("userUpdated", updatedUser);
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }
        const user = await users.findById(req.user.id);
        const match = await bcrypt.compare(
            currentPassword,
            user.password
        );
        if (!match) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
            newPassword,
            salt
        );
        user.password = hashedPassword;
        await user.save();
        res.json({
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const LogoutAllDev = async (req, res) => {
    try {
        const user = await users.findById(req.user.id)
        if (!user) {
            return res.status(404).json({
                message : "user not found"
            })
        }
        user.tokenVersion += 1
        await user.save()
        res.status(200).json({
            message : "Logged out from all devices successfully"
        })
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const match = await bcrypt.compare(
            password,
            user.password
        );
        if (!match) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }
        await Message.deleteMany({
            $or: [
                { sender: user._id },
                { receiver: user._id }
            ]
        });
        await users.findByIdAndDelete(user._id);
        io.emit("userDeleted", user._id);
        res.json({
            message: "Account deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
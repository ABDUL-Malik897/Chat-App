import Group from "../models/group.js";
import Message from "../models/message.js";
import { io } from "../server.js"
import PinMssg from "../models/pinMssg.js";


export const createGroup = async (req, res) => {
    try {
        const { name , description , members } = req.body
        if (!name) {
            return res.status(400).json({
                message : "Group name is required"
            })
        }
        const group = await Group.create({
            name , description ,admin : req.user.id , members : [req.user.id ,...(members || [])]
        })
        const populatedGrp = await Group.findById(group._id)
            .populate("admin" , "username profilePic")
            .populate("members", "username profilePic")
        
        res.status(201).json(populatedGrp)
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
};

export const getGrp = async (req ,res) => {
    try {
        const groups = await Group.find({
            members : req.user.id
        })
        .populate("admin" ,"username profilePic")
        .populate("members" ,"username profilePic")
        .sort({ updatedAt : -1 })
        res.status(200).json(groups)
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            group: req.params.groupId
        })
        .populate("sender", "username profilePic")
        .populate({
            path: "replyTo",
            populate: {
                path: "sender",
                select: "username profilePic"
            }
        })
        .sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { text, replyTo } = req.body;
        const message = await Message.create({
            sender: req.user.id,
            group: groupId,
            text,
            replyTo: replyTo || null,
            media: req.file ? req.file.path : null,
            mediaType: req.file
                ? (
                    req.file.mimetype.startsWith("image/")
                        ? "image"
                        : req.file.mimetype.startsWith("video/")
                        ? "video"
                        : req.file.mimetype.startsWith("audio/")
                        ? "audio"
                        : "file"
                )
                : null,
            fileName: req.file
                ? req.file.originalname
                : "",
            fileSize: req.file
                ? req.file.size
                : 0,
                    });
        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username profilePic")
            .populate({
                path: "replyTo",
                populate: {
                    path: "sender",
                    select: "username profilePic"
                }
            });
        io.to(groupId).emit(
            "receiveGroupMessage",
            populatedMessage
        );
        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getPinnedGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const pinned = await PinMssg.findOne({
            group: groupId
        })
        .populate({
            path: "message",
            populate: {
                path: "sender",
                select: "username profilePic"
            }
        });
        res.status(200).json(pinned);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const unpinGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        await PinMssg.findOneAndDelete({
            group: groupId
        });
        io.to(groupId).emit("messageUnpinned");
        res.status(200).json({
            message: "Unpinned successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const renameGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name } = req.body;
        if (!name.trim()) {
            return res.status(400).json({
                message: "Group name is required"
            });
        }
        const group = await Group.findByIdAndUpdate(
            groupId,
            {
                name: name.trim()
            },
            {
                new: true
            }
        ).populate(
            "members",
            "username profilePic"
        );
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the admin can rename the group."
            });
        }
        
        io.to(groupId).emit(
            "groupUpdated",
            group
        );
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const rawGroup = await Group.findById(groupId);
        console.log("RAW GROUP:", rawGroup);
        const group = await Group.findById(groupId)
            .populate(
                "members",
                "username profilePic email bio"
            )
            .populate("admin", "username profilePic")
        console.log("POPULATED GROUP:", group);
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateGroupPic = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }
        const group = await Group.findByIdAndUpdate(
            groupId,
            {
                groupPic: req.file.path
            },
            {
                new: true
            }
        ).populate(
            "members",
            "username profilePic"
        );
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the admin can change the group picture."
            });
        }
        io.to(groupId).emit(
            "groupUpdated",
            group
        );
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateGroupDescription = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { description } = req.body;
        const group = await Group.findByIdAndUpdate(
            groupId,
            { description },
            { new: true }
        ).populate(
            "members",
            "username profilePic"
        );
        io.to(groupId).emit(
            "groupUpdated",
            group
        );
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the admin can change the group description."
            });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const addGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { members } = req.body;
        const group = await Group.findById(groupId);
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the admin can add new members."
            });
        }
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        const newMembers = members.filter(
            member =>
                !group.members.some(
                    existing =>
                        existing.toString() === member
                )
        );
        group.members.push(...newMembers);
        await group.save();
        const updatedGroup = await Group.findById(groupId)
            .populate("members", "username profilePic email bio")
            .populate("admin", "username profilePic");
        io.to(groupId).emit(
            "groupUpdated",
            updatedGroup
        );
        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const removeGroupMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;
        const group = await Group.findById(groupId);
        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the admin can remove members."
            });
        }
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        group.members = group.members.filter(
            member =>
                member.toString() !== memberId
        );
        await group.save();
        const updatedGroup = await Group.findById(groupId)
            .populate("members", "username profilePic email bio")
            .populate("admin", "username profilePic");
        io.to(groupId).emit(
            "groupUpdated",
            updatedGroup
        );
        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const group = await Group.findById(groupId);
        if (group.admin.toString() === userId) {
            return res.status(403).json({
                message: "Group admin cannot leave the group."
            });
        }
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }
        group.members = group.members.filter(
            member => member.toString() !== userId
        );
        await group.save();
        const updatedGroup = await Group.findById(groupId)
            .populate("members", "username profilePic email bio")
            .populate("admin", "username profilePic");
        io.to(groupId).emit(
            "groupUpdated",
            updatedGroup
        );
        res.status(200).json({
            message: "Left group successfully",
            groupId
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
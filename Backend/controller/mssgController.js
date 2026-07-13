import Message from "../models/message.js";
import { io, onlineUsers } from "../server.js";
import mongoose from "mongoose"
import PinMssg from "../models/pinMssg.js";


export const sendMssg = async (req, res) => {

    try {

        const { sender, receiver, text, replyTo } = req.body;

        const receiverSocketId = onlineUsers.get(receiver);

        const status = receiverSocketId ? "Delivered" : "Sent";

        const mssg = await Message.create({
            sender,
            receiver,
            text,
            status,
            replyTo: replyTo || null
        });

        const populatedMessage = await Message.findById(mssg._id)
            .populate("sender", "username profilePic")
            .populate({
                path: "replyTo",
                populate: {
                    path: "sender",
                    select: "username profilePic"
                }
            });

        if (receiverSocketId) {

            io.to(receiverSocketId).emit(
                "receiveMessage",
                populatedMessage
            );

        }

        res.status(201).json(populatedMessage);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const getMssg = async (req, res) => {

    try {

        const { senderId, receiverId } = req.params;

        const messages = await Message.find({

            $and: [

                {
                    $or: [

                        {
                            sender: senderId,
                            receiver: receiverId
                        },

                        {
                            sender: receiverId,
                            receiver: senderId
                        }

                    ]
                },

                {
                    deletedFor: {
                        $ne: senderId
                    }
                }

            ]

        })
        .sort({ createdAt: 1 })
        .populate("sender", "username profilePic")
        .populate("reactions.user", "username profilePic")
        .populate({
            path: "replyTo",
            populate: {
                path: "sender",
                select: "username profilePic"
            }
        });

        res.status(200).json(messages);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const markAsRead = async (req, res) => {

    try {

        const { senderId, receiverId } = req.body;

        await Message.updateMany(

            {
                sender: senderId,
                receiver: receiverId,
                status: "Delivered"
            },

            {
                status: "Read"
            }

        );

        const senderSocketId = onlineUsers.get(senderId);

        if (senderSocketId) {

            io.to(senderSocketId).emit("mssgRead", {
                senderId,
                receiverId
            });

        }

        res.json({
            message: "Message marked as read"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const deleteForMe = async (req, res) => {

    try {

        const { messageId } = req.params;
        const { userId } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {

            return res.status(404).json({
                message: "Message not found"
            });

        }

        if (!message.deletedFor.includes(userId)) {

            message.deletedFor.push(userId);

            await message.save();

        }

        res.status(200).json({
            message: "Message deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const deleteForEveryone = async (req, res) => {

    try {

        const { id } = req.params;
        const { userId } = req.body;

        const message = await Message.findById(id);

        if (!message) {

            return res.status(404).json({
                message: "Message not found"
            });

        }

        if (message.sender.toString() !== userId) {

            return res.status(403).json({
                message: "Only the sender can delete this message."
            });

        }

        message.deletedForEveryone = true;
        message.deletedAt = new Date();

        await message.save();

        const updatedMessage = await Message.findById(message._id)
            .populate("sender", "username profilePic")
            .populate("reactions.user", "username profilePic")
            .populate({
                path: "replyTo",
                populate: {
                    path: "sender",
                    select: "username profilePic"
                }
            });

        const receiverSocketId = onlineUsers.get(
            message.receiver.toString()
        );

        if (receiverSocketId) {

            io.to(
                receiverSocketId
            ).emit(
                "messageDeletedForEveryone",
                updatedMessage
            );

        }

        res.status(200).json(updatedMessage);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const reactToMessage = async (req, res) => {

    try {

        const { messageId } = req.params;
        const { userId, emoji } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {

            return res.status(404).json({
                message: "Message not found"
            });

        }

        const existingReaction = message.reactions.find(

            reaction => reaction.user.toString() === userId

        );

        if (!existingReaction) {

            message.reactions.push({
                user: userId,
                emoji
            });

        }

        else if (existingReaction.emoji === emoji) {

            message.reactions = message.reactions.filter(

                reaction =>
                    reaction.user.toString() !== userId

            );

        }

        else {

            existingReaction.emoji = emoji;

        }

        await message.save();

        const updatedMessage = await Message.findById(message._id)
            .populate("sender", "username profilePic")
            .populate("reactions.user", "username profilePic")
            .populate({
                path: "replyTo",
                populate: {
                    path: "sender",
                    select: "username profilePic"
                }
            });

        const receiverSocketId = onlineUsers.get(
            message.receiver.toString()
        );

        if (receiverSocketId) {

            io.to(
                receiverSocketId
            ).emit(
                "messageReactionUpdated",
                updatedMessage
            );

        }

        res.status(200).json(updatedMessage);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const sendMediaMessage = async (req, res) => {
    try {

        const {
            sender,
            receiver,
            text = "",
            replyTo
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded."
            });
        }

        const receiverSocketId = onlineUsers.get(receiver);

        const status = receiverSocketId
            ? "Delivered"
            : "Sent";

        let mediaType = "file";

        if (req.file.mimetype.startsWith("image/")) {
            mediaType = "image";
        }
        else if (req.file.mimetype.startsWith("video/")) {
            mediaType = "video";
        }
        else if (req.file.mimetype.startsWith("audio/")) {
            mediaType = "audio";
        }

//         console.log("BODY:", req.body);
// console.log("FILE:", req.file);

        const message = await Message.create({

            sender,
            receiver,

            text,

            replyTo :  replyTo && mongoose.Types.ObjectId.isValid(replyTo) ? replyTo : null,

            status,

            media: req.file.path,

            mediaType,

            fileName: req.file.originalname,

            fileSize: req.file.size

        });

        const populatedMessage =
            await Message.findById(message._id)
                .populate("sender", "username profilePic")
                .populate({
                    path: "replyTo",
                    populate: {
                        path: "sender",
                        select: "username profilePic"
                    }
                });

        if (receiverSocketId) {
            io.to(receiverSocketId).emit(
                "receiveMessage",
                populatedMessage
            );
        }

        res.status(201).json(populatedMessage);

    } catch (error) {

        // console.error("MEDIA ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }
};


export const pinMessage = async (req, res) => {
    try {

        const { messageId } = req.params;
        const { userId } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                message: "Message not found"
            });
        }

        const users = [
            message.sender.toString(),
            message.receiver.toString()
        ].sort();

        await PinMssg.findOneAndDelete({
            users
        });

        const pinned = await PinMssg.create({
            users,
            message: messageId,
            pinnedBy: userId
        });

        const populatedPinned =
            await PinMssg.findById(pinned._id)
                .populate({
                    path: "message",
                    populate: {
                        path: "sender",
                        select: "username profilePic"
                    }
                });
        
        const receiverSocketId =
            onlineUsers.get(message.receiver.toString());

            const senderSocketId =
                onlineUsers.get(message.sender.toString());

            if (receiverSocketId) {
                io.to(receiverSocketId).emit(
                    "messagePinned",
                    populatedPinned
                );
            }

            if (senderSocketId) {
                io.to(senderSocketId).emit(
                    "messagePinned",
                    populatedPinned
                );
            }

        res.status(200).json(populatedPinned);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

export const getPinnedMessage = async (req, res) => {

    try {

        const { user1, user2 } = req.params;

        const users = [user1, user2].sort();

        const pinned =
            await PinMssg.findOne({
                users
            })
            .populate({
                path: "message",
                populate: {
                    path: "sender",
                    select: "username profilePic"
                }
            });

        res.json(pinned);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const unpinMessage = async (req, res) => {
    try {

        const { user1, user2 } = req.params;

        const users = [user1, user2].sort();

        const pinned = await PinMssg.findOneAndDelete({
            users
        });

        if (!pinned) {
            return res.status(404).json({
                message: "No pinned message found"
            });
        }

        res.json({
            message: "Message unpinned"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
};
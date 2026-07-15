import mongoose from "mongoose"

const mssgSchema = new mongoose.Schema(
    {
        sender : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        receiver : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : function () {
                return !this.group
            },
            default : null

        },
        text : {
            type : String,
            trim : true
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },
        status : {
            type : String,
            enum : ["Sent","Delivered","Read"],
            default : "Sent"
        },
        deletedFor : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        ],
        deletedForEveryone: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        },
        reactions: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                emoji: {
                    type: String
                }
            }
        ],
        media: {
            type: String,
            default: null
        },
        mediaType: {
            type: String,
            enum: ["image", "video", "file", "audio"],
            default: null
        },
        fileName: {
            type: String,
            default: ""
        },
        fileSize: {
            type: Number,
            default: 0
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null
        }
    },{
        timestamps : true
    }
)

export default mongoose.model("Message" , mssgSchema)
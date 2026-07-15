import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username : {
            type : String,
            required : true
        },
        email : {
            type : String,
            required : true,
            unique : true
        },
        password : {
            type : String,
            required : true
        },
        profilePic : {
            type : String,
            default : ''
        },
        bio : {
            type : String,
            default :"Hey there! I'm using Chat-App.",
            maxlength : 120
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        lastSeenPrivacy: {
            type: String,
            enum: ["everyone", "contacts", "nobody"],
            default: "everyone"
        },
        profilePhotoPrivacy: {
            type: String,
            enum: ["everyone", "contacts", "nobody"],
            default: "everyone"
        },
        aboutPrivacy: {
            type: String,
            enum: ["everyone", "contacts", "nobody"],
            default: "everyone"
        },
        readReceipts: {
            type: Boolean,
            default: true
        },
        tokenVersion : {
            type :Number,
            default : 0
        }
    },{timestamps : true}
)

export default mongoose.model("User" , userSchema)
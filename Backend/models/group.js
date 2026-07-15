import mongoose from 'mongoose'
const GrpSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            trim : true
        },
        description : {
            type : String,
            default : ""
        },
        groupPic : {
            type : String,
            default : ""
        },
        admin : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        members: [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        ]
    },
    {
        timestamps : true
    }
)

export default mongoose.model("Group" , GrpSchema)
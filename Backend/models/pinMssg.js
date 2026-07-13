import mongoose from "mongoose";

const pinMssgSchema = new mongoose.Schema(
{
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ],

    message:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
        required:true
    },

    pinnedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
});

export default mongoose.model(
    "PinMssg",
    pinMssgSchema
);
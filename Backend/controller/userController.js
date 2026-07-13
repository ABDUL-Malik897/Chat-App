// import users from "../models/users.js";
import users from "../models/users.js";
import { io } from "../server.js";

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
        // console.log(req.file);
        
        if (!req.file) {
            return res.status(400).json({
                message : "No image uploaded"
            })
        }
//         console.log("req.file:", req.file);
// console.log("Image path:", req.file?.path);
        const user = await users.findByIdAndUpdate(req.params.id,
            {
                profilePic : req.file.path
            },{
                new :true
            }
        ).select("-password")

        // console.log("Updated user:", user);
        // console.log("User ID:", req.params.id);

        io.emit("userUpdated", user);
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            message: error.message
        })
    }
}
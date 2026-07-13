import multer from 'multer' 
import { CloudinaryStorage  } from "multer-storage-cloudinary";
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let resource_type = "image";

        if (file.mimetype.startsWith("video/")) {
            resource_type = "video";
        }
        else if (file.mimetype.startsWith("audio/")) {
            resource_type = "video";
        }
        else if (
            file.mimetype === "application/pdf" ||
            file.mimetype.includes("document") ||
            file.mimetype.includes("sheet") ||
            file.mimetype.includes("presentation") ||
            file.mimetype.includes("zip")
        ) {
            resource_type = "raw";
        }

        return {
            folder : "chat-app",
            resource_type,
            public_id : Date.now() + "-" + file.originalname
        }
    }
}) 

const upload = multer({
    storage,
    limits : {
        fieldSize : 20 * 1024 * 1024
    }
})

export default upload
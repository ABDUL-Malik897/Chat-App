import express from "express";
import { changePassword, getProfile, getUsers ,updateProfile,updateProfilePic } from "../controller/userController.js";
import upload from "../middleware/upload.js";
import requireAuth from "../middleware/requireAuth.js";


const router = express.Router()

router.get('/',getUsers)
router.patch("/profile/:id",upload.single("profilePic"), updateProfilePic);
router.get("/profile",requireAuth, getProfile)
router.patch("/profile",requireAuth,upload.single("profilePic"), updateProfile);
router.patch("/change-password",requireAuth,changePassword);


export default router
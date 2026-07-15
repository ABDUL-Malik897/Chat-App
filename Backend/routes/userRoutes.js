import express from "express";
import { changePassword, deleteAccount, getProfile, getUsers ,LogoutAllDev,updateProfile,updateProfilePic } from "../controller/userController.js";
import upload from "../middleware/upload.js";
import requireAuth from "../middleware/requireAuth.js";


const router = express.Router()

router.get('/',getUsers)
router.patch("/profile/:id",upload.single("profilePic"), updateProfilePic);
router.get("/profile",requireAuth, getProfile)
router.patch("/profile",requireAuth,upload.single("profilePic"), updateProfile);
router.patch("/change-password",requireAuth,changePassword);
router.patch("/logout-all-dev", requireAuth, LogoutAllDev);
router.delete("/delete-account",requireAuth, deleteAccount);


export default router
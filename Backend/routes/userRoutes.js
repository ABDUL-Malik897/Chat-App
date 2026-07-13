import express from "express";
import { getUsers ,updateProfilePic } from "../controller/userController.js";
import upload from "../middleware/upload.js";

const router = express.Router()

router.get('/',getUsers)
router.patch("/profile/:id",upload.single("profilePic"), updateProfilePic);

export default router
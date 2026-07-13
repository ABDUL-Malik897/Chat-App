import express from "express"
import { sendMssg, getMssg, markAsRead, deleteForMe, deleteForEveryone, reactToMessage, sendMediaMessage, pinMessage, getPinnedMessage, unpinMessage } from '../controller/mssgController.js';
import upload from "../middleware/upload.js";

const router = express.Router()

router.post("/", sendMssg)
router.get("/:senderId/:receiverId" , getMssg)
router.patch('/read', markAsRead)
router.patch("/delete/:messageId", deleteForMe);
router.patch("/delete-everyone/:id",deleteForEveryone);
router.patch("/react/:messageId", reactToMessage);
router.post("/media",upload.single("file"),sendMediaMessage);
router.patch("/pin/:messageId", pinMessage);
router.get("/pinned/:user1/:user2",getPinnedMessage);
router.delete("/unpin/:user1/:user2",unpinMessage);


export default router
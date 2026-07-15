import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { addGroupMembers, createGroup, getGroupDetails, getGroupMessages, getGrp, getPinnedGroupMessage, leaveGroup, removeGroupMember, renameGroup, sendGroupMessage, unpinGroupMessage, updateGroupDescription, updateGroupPic } from "../controller/GrpController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", requireAuth, createGroup);
router.get("/",requireAuth,getGrp)
router.get("/:groupId/messages", getGroupMessages);
router.post("/:groupId/messages", requireAuth,upload.single("file"),sendGroupMessage);
router.get("/:groupId/pinned", getPinnedGroupMessage);
router.delete("/:groupId/unpin", unpinGroupMessage);
router.get("/:groupId", requireAuth, getGroupDetails);
router.patch("/:groupId", requireAuth, renameGroup);
router.patch("/:groupId/icon", requireAuth, upload.single("image"),updateGroupPic);
router.patch("/:groupId/description", requireAuth, updateGroupDescription);
router.patch("/:groupId/members", requireAuth,addGroupMembers);
router.patch("/:groupId/remove-member", requireAuth,removeGroupMember);
router.patch("/:groupId/leave",  requireAuth,  leaveGroup);

export default router;
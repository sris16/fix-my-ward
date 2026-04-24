import express from "express";

import {
    createIssue,
    getPublicIssues,
    getNearbyIssues,
    upvoteIssue,
    deleteIssue,
    updateIssue
} from "../controllers/issueController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* 🔓 PUBLIC */
router.post("/", createIssue);
router.get("/nearby", getNearbyIssues);
router.post("/upvote", upvoteIssue);

/* 🔐 ADMIN PROTECTED */
router.get("/", authMiddleware, getPublicIssues);
router.patch("/:id", authMiddleware, updateIssue);
router.delete("/:id", authMiddleware, deleteIssue);

export default router;
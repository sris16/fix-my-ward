import express from "express";
import {
  createIssue,
  getIssues,
  getMyIssues,
  toggleUpvote,
} from "../controllers/issueController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createIssue);
router.get("/", getIssues);
router.get("/my", protect, getMyIssues);
router.post("/:id/upvote", protect, toggleUpvote);

export default router;
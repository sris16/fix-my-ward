import express from "express";

import {
createIssue,
getPublicIssues,
getNearbyIssues,
upvoteIssue,
deleteIssue
} from "../controllers/issueController.js";

const router = express.Router();

router.post("/", createIssue);
router.get("/", getPublicIssues);
router.get("/nearby", getNearbyIssues);
router.post("/upvote", upvoteIssue);
router.delete("/:id", deleteIssue);

export default router;
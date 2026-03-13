const express = require("express");
const router = express.Router();

const {
createIssue,
getPublicIssues,
getNearbyIssues,
upvoteIssue,
deleteIssue
} = require("../controllers/issueController");

router.post("/", createIssue);
router.get("/", getPublicIssues);
router.get("/nearby", getNearbyIssues);
router.post("/upvote", upvoteIssue);

// Delete Issue Route
router.delete("/:id", deleteIssue);

module.exports = router;
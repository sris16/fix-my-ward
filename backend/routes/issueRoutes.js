const express = require("express");
const router = express.Router();

const {
createIssue,
getPublicIssues,
getNearbyIssues,
upvoteIssue
} = require("../controllers/issueController");

router.post("/", createIssue);
router.get("/", getPublicIssues);
router.get("/nearby", getNearbyIssues);
router.post("/upvote", upvoteIssue);

module.exports = router;
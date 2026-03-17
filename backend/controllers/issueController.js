import Issue from "../models/Issue.js";

// Create Issue
export const createIssue = async (req, res) => {

try {

const issue = new Issue(req.body);

await issue.save();

res.status(201).json(issue);

} catch (error) {

res.status(500).json({ message: error.message });

}

};



// Get All Public Issues
export const getPublicIssues = async (req, res) => {

try {

const issues = await Issue.find().sort({ createdAt: -1 });

res.json(issues);

} catch (error) {

res.status(500).json({ message: error.message });

}

};



// Get Nearby Issues
export const getNearbyIssues = async (req, res) => {

try {

const { lat, lng } = req.query;

const issues = await Issue.find();

const nearby = issues.filter(issue => {

const distance = getDistance(
lat,
lng,
issue.lat,
issue.lng
);

return distance <= 5;

});

res.json(nearby);

} catch (error) {

res.status(500).json({ message: error.message });

}

};



// Upvote Issue
export const upvoteIssue = async (req, res) => {

try {

const { issueId, mobile } = req.body;

const issue = await Issue.findById(issueId);

if (!issue) {
return res.status(404).json({ message: "Issue not found" });
}

const index = issue.upvotes.indexOf(mobile);

if (index === -1) {

issue.upvotes.push(mobile);

} else {

issue.upvotes.splice(index, 1);

}

await issue.save();

res.json(issue);

} catch (error) {

res.status(500).json({ message: error.message });

}

};

// Update Issue (ADMIN FEATURE)
export const updateIssue = async (req, res) => {

try {

const { id } = req.params;

const updatedIssue = await Issue.findByIdAndUpdate(
id,
{ ...req.body, updatedAt: Date.now() },
{ new: true }
);

if (!updatedIssue) {
return res.status(404).json({ message: "Issue not found" });
}

res.json(updatedIssue);

} catch (error) {

res.status(500).json({ message: error.message });

}

};



// Delete Issue (NEW FEATURE)
export const deleteIssue = async (req, res) => {

try {

const { id } = req.params;

const issue = await Issue.findById(id);

if (!issue) {
return res.status(404).json({ message: "Issue not found" });
}

await Issue.findByIdAndDelete(id);

res.json({ message: "Issue deleted successfully" });

} catch (error) {

res.status(500).json({ message: error.message });

}

};



// Distance Helper
function getDistance(lat1, lon1, lat2, lon2) {

const R = 6371;

const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;

const a =
Math.sin(dLat / 2) * Math.sin(dLat / 2) +
Math.cos(lat1 * Math.PI / 180) *
Math.cos(lat2 * Math.PI / 180) *
Math.sin(dLon / 2) *
Math.sin(dLon / 2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

return R * c;

}
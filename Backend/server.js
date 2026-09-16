const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "issues.json");

app.use(cors());
app.use(express.json());

function loadIssues() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function saveIssues(issues) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(issues, null, 2));
}

app.get("/", (req, res) => res.send("CivicFix Backend is running!"));
app.get("/api/issues", (req, res) => res.json(loadIssues()));

app.get("/api/issues/:id", (req, res) => {
  const issue = loadIssues().find(i => i.id === Number(req.params.id));
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  res.json(issue);
});

app.post("/api/issues", (req, res) => {
  const issues = loadIssues();
  const { title, description, category, location, reportedBy } = req.body;
  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }
  const newIssue = {
    id: issues.length ? Math.max(...issues.map(i => i.id)) + 1 : 1,
    title, description, category, location,
    reportedBy: reportedBy || "Anonymous",
    status: "Reported", votes: 0, createdAt: new Date().toISOString()
  };
  issues.push(newIssue); saveIssues(issues); res.status(201).json(newIssue);
});

app.patch("/api/issues/:id/status", (req, res) => {
  const issues = loadIssues();
  const issue = issues.find(i => i.id === Number(req.params.id));
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  if (!["Reported", "In Progress", "Resolved"].includes(req.body.status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  issue.status = req.body.status; saveIssues(issues); res.json(issue);
});

app.post("/api/issues/:id/vote", (req, res) => {
  const issues = loadIssues();
  const issue = issues.find(i => i.id === Number(req.params.id));
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  issue.votes += 1; saveIssues(issues); res.json(issue);
});

app.get("/api/stats", (req, res) => {
  const issues = loadIssues();
  res.json({
    total: issues.length,
    reported: issues.filter(i => i.status === "Reported").length,
    inProgress: issues.filter(i => i.status === "In Progress").length,
    resolved: issues.filter(i => i.status === "Resolved").length
  });
});

app.listen(PORT, () => console.log(`CivicFix Backend running at http://localhost:${PORT}`));

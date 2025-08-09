const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();
const PORT = 3001;
const TASKS_FILE = "tasks.json";

app.use(cors());
app.use(bodyParser.json());

// Load tasks for all users
function loadTasks() {
  if (fs.existsSync(TASKS_FILE)) {
    return JSON.parse(fs.readFileSync(TASKS_FILE, "utf8"));
  }
  return {};
}

// Save tasks for all users
function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// Get tasks for a user
app.get("/tasks", (req, res) => {
  const user = req.query.user;
  const tasks = loadTasks();
  res.json(tasks[user] || []);
});

// Add a task for a user
app.post("/tasks", (req, res) => {
  const { user, name, done } = req.body;
  const tasks = loadTasks();
  if (!tasks[user]) tasks[user] = [];
  tasks[user].push({ name, done: !!done });
  saveTasks(tasks);
  res.json(tasks[user]);
});

// Update a task for a user
app.put("/tasks/:index", (req, res) => {
  const user = req.body.user;
  const idx = parseInt(req.params.index, 10);
  const tasks = loadTasks();
  if (tasks[user] && tasks[user][idx]) {
    tasks[user][idx].done = !tasks[user][idx].done;
    saveTasks(tasks);
  }
  res.json(tasks[user] || []);
});

// Configure your transporter (use your email and app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zaynabsugaal@gmail.com", // <-- replace with your email
    pass: "jokyo1", // <-- replace with your app password
  },
});

// Send tasks via email to each user
function sendTasksEmailToAllUsers(subject) {
  const allTasks = loadTasks();
  Object.keys(allTasks).forEach((userEmail) => {
    const text =
      allTasks[userEmail]
        .map((t, i) => `${i + 1}. ${t.name} [${t.done ? "Done" : "Pending"}]`)
        .join("\n") || "No tasks.";
    transporter
      .sendMail({
        from: '"Productivity Tracker" <zaynabsugaal@gmail.com>', // <-- use your sending email
        to: userEmail,
        subject,
        text,
      })
      .then(() => console.log(`Email sent to ${userEmail}`))
      .catch(console.error);
  });
}

// Every 1 hour
cron.schedule("0 * * * *", () => {
  sendTasksEmailToAllUsers("Hourly Productivity Tasks");
});

// Every month on the 1st at 12:05 AM
cron.schedule("5 0 1 * *", () => {
  sendTasksEmailToAllUsers("Monthly Productivity Tasks");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

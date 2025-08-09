// Simple Productivity Tracker (with backend)
localStorage.removeItem("userEmail"); // Always clear email on reload

let tasks = [];
let userEmail = localStorage.getItem("userEmail");

function showTracker() {
  document.getElementById("emailPrompt").style.display = "none";
  document.getElementById("trackerContainer").style.display = "";
  fetchTasks();
}

function showEmailPrompt() {
  document.getElementById("emailPrompt").style.display = "";
  document.getElementById("trackerContainer").style.display = "none";
}

if (!userEmail || userEmail === "null") {
  showEmailPrompt();
} else {
  showTracker();
}

document.getElementById("emailForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const input = document.getElementById("emailInput");
  userEmail = input.value.trim();
  localStorage.setItem("userEmail", userEmail);
  showTracker();
});

async function fetchTasks() {
  const res = await fetch(
    `http://localhost:3001/tasks?user=${encodeURIComponent(userEmail)}`
  );
  tasks = await res.json();
  renderTasks();
}

async function addTask(name) {
  await fetch("http://localhost:3001/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userEmail, name, done: false }),
  });
  await fetchTasks(); // <-- await here
}

async function completeTask(index) {
  await fetch(`http://localhost:3001/tasks/${index}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userEmail }),
  });
  await fetchTasks(); // <-- await here
}

function renderTasks() {
  console.log("Rendering tasks:", tasks); // Add this line
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";
    li.innerHTML = `
      <span>${task.name}</span>
      <button onclick="completeTask(${i})">${task.done ? "✓" : "Done"}</button>
    `;
    taskList.appendChild(li);
  });
}

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const input = document.getElementById("taskInput");
    if (input.value.trim()) {
      addTask(input.value.trim());
      input.value = "";
    }
  });
});

// Expose completeTask to global scope for button onclick
window.completeTask = completeTask;

document
  .getElementById("changeEmailBtn")
  .addEventListener("click", function () {
    localStorage.removeItem("userEmail");
    location.reload();
  });

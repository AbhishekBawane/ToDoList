document.addEventListener("DOMContentLoaded", function() {
// Array to hold all tasks
let tasks = [];

// Request notification permission on load if available
if (("Notification" in window)) {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

// Constructor for tasks
function Task(description, dueDateTime) {
  this.description = description;
  this.dueDateTime = dueDateTime; // Date object (or null)
  this.timer = null; // To store setTimeout reference if scheduled
}

// Adds a task to the tasks array and the DOM
function addTask() {
  const descriptionField = document.getElementById("taskDescription");
  const dueField = document.getElementById("taskDue");
  const description = descriptionField.value.trim();
  let dueDateTime = dueField.value ? new Date(dueField.value) : null;

  if (!description) {
    alert("Please enter a task description.");
    return;
  }

  const task = new Task(description, dueDateTime);
  tasks.push(task);
  appendTaskToDOM(task, tasks.length - 1);
  scheduleAlarm(task, tasks.length - 1);

  descriptionField.value = "";
  dueField.value = "";
}

function appendTaskToDOM(task, index) {
  const taskList = document.getElementById("taskList");

  const li = document.createElement("li");
  li.className = "task-item";
  li.setAttribute("data-index", index);

  const detailsDiv = document.createElement("div");
  detailsDiv.className = "task-details";
  detailsDiv.innerHTML = `<span>${index + 1}. ${task.description}</span>
                          <span>Due: ${task.dueDateTime ? task.dueDateTime.toLocaleString() : "No due date"}</span>`;

  const btnDiv = document.createElement("div");
  btnDiv.className = "task-buttons";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deleteTask(index);

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit Due";
  editBtn.onclick = () => editTaskDue(index);

  btnDiv.appendChild(editBtn);
  btnDiv.appendChild(deleteBtn);

  li.appendChild(detailsDiv);
  li.appendChild(btnDiv);
  taskList.appendChild(li);
}

function updateTaskListDOM() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    appendTaskToDOM(task, index);
  });
}

function deleteTask(index) {
  if (index >= 0 && index < tasks.length) {
    if (tasks[index].timer) {
      clearTimeout(tasks[index].timer);
    }
    tasks.splice(index, 1);
    updateTaskListDOM();
  }
}

function editTaskDue(index) {
  if (index < 0 || index >= tasks.length) return;

  const newDue = prompt("Enter new due date and time (YYYY-MM-DDTHH:MM) or leave empty to remove:", 
                          tasks[index].dueDateTime ? tasks[index].dueDateTime.toISOString().slice(0,16) : "");
  if (newDue === null) return; 

  if (tasks[index].timer) {
    clearTimeout(tasks[index].timer);
    tasks[index].timer = null;
  }

  if (newDue.trim() === "") {
    tasks[index].dueDateTime = null;
  } else {
    const parsedDate = new Date(newDue);
    if (isNaN(parsedDate.getTime())) {
      alert("Invalid date format. No changes made.");
      return;
    } else {
      tasks[index].dueDateTime = parsedDate;
      scheduleAlarm(tasks[index], index);
    }
  }
  updateTaskListDOM();
}

function scheduleAlarm(task, index) {
  if (!task.dueDateTime) return;
  const now = new Date();
  const delay = task.dueDateTime.getTime() - now.getTime();
  
  if (delay <= 0) {
    notifyTask(task);
  } else {
    task.timer = setTimeout(() => {
      notifyTask(task);
    }, delay);
  }
}

function notifyTask(task) {
  if (("Notification" in window) && Notification.permission === "granted") {
    new Notification("Task Due", { body: `${task.description} is due now!` });
  } else {
    alert(`Task Due: ${task.description} is due now!`);
  }
}

document.getElementById("addTaskBtn").addEventListener("click", addTask);
});
/* Persistent To-Do with localStorage
   - Save tasks as array of objects: {id, text, completed}
   - Render list from storage on load
   - Update storage on any change
*/

const STORAGE_KEY = "todo_tasks_v1";

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const totalCount = document.getElementById("totalCount");
const remainingCount = document.getElementById("remainingCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = [];

// --- Initialize ---
loadTasks();
renderTasks();

// --- Events ---
addTaskBtn.addEventListener("click", handleAdd);
taskInput.addEventListener("keypress", e => { if (e.key === "Enter") handleAdd(); });
clearCompletedBtn.addEventListener("click", clearCompleted);
clearAllBtn.addEventListener("click", clearAll);

// --- Functions ---
function handleAdd() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  const newTask = {
    id: Date.now().toString(),
    text,
    completed: false
  };
  tasks.unshift(newTask); // newest on top
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function createTaskElement(task) {
  const li = document.createElement("li");
  if (task.completed) li.classList.add("completed");

  // left side: checkbox + text
  const left = document.createElement("div");
  left.className = "task-left";

  const checkbox = document.createElement("div");
  checkbox.className = "checkbox";
  checkbox.setAttribute("role", "button");
  checkbox.setAttribute("aria-pressed", task.completed ? "true" : "false");
  checkbox.innerHTML = task.completed ? "✓" : "";
  if (task.completed) checkbox.classList.add("checked");

  checkbox.addEventListener("click", () => toggleComplete(task.id));

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = task.text;
  span.addEventListener("click", () => toggleComplete(task.id));

  left.appendChild(checkbox);
  left.appendChild(span);

  // remove button
  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove";
  removeBtn.innerText = "✖";
  removeBtn.setAttribute("aria-label", "Remove task");
  removeBtn.addEventListener("click", () => removeTask(task.id));

  li.appendChild(left);
  li.appendChild(removeBtn);
  return li;
}

function renderTasks() {
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.style.color = "#6b7280";
    empty.style.textAlign = "center";
    empty.style.padding = "1rem";
    empty.textContent = "No tasks yet — add something!";
    taskList.appendChild(empty);
  } else {
    tasks.forEach(task => {
      const el = createTaskElement(task);
      taskList.appendChild(el);
    });
  }
  updateCounts();
}

function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  saveTasks();
  renderTasks();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  const hasCompleted = tasks.some(t => t.completed);
  if (!hasCompleted) return alert("No completed tasks to clear.");
  if (!confirm("Clear all completed tasks?")) return;
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

function clearAll() {
  if (tasks.length === 0) return;
  if (!confirm("Delete ALL tasks? This cannot be undone.")) return;
  tasks = [];
  saveTasks();
  renderTasks();
}

function updateCounts() {
  const total = tasks.length;
  const remaining = tasks.filter(t => !t.completed).length;
  totalCount.textContent = total;
  remainingCount.textContent = remaining;
}

/* Persistence */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Could not save tasks:", e);
  }
}

function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    tasks = data ? JSON.parse(data) : [];
    // make sure tasks is an array and has expected shape
    if (!Array.isArray(tasks)) tasks = [];
  } catch (e) {
    console.error("Failed to load tasks:", e);
    tasks = [];
  }
}

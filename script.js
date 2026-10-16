const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const message = document.getElementById("message");
let tasks = [];
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Please log in again.");
    }
    if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
    }
    return data;
}
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#d64545" : "#777b90";
}
async function loadUser() {
    const user = await apiRequest("/api/me");
    document.getElementById("welcome-user").textContent =
        `Hi, ${user.username}`;
}
async function loadTasks() {
    try {
        tasks = await apiRequest("/api/tasks");
        updateStatistics();
        renderTasks();
    } catch (error) {
        showMessage(error.message, true);
    }
}
function updateStatistics() {
    document.getElementById("total-count").textContent = tasks.length;
    document.getElementById("progress-count").textContent =
        tasks.filter(task => task.status === "In Progress").length;
    document.getElementById("completed-count").textContent =
        tasks.filter(task => task.status === "Completed").length;
}
function createTag(text, extraClass = "") {
    const tag = document.createElement("span");
    tag.className = `tag ${extraClass}`.trim();
    tag.textContent = text;
    return tag;
}
function createButton(text, className, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = className;
    button.addEventListener("click", callback);
    return button;
}
function renderTasks() {
    const searchText = document.getElementById("search-input")
        .value.trim().toLowerCase();
    const selectedStatus = document.getElementById("filter-status").value;
    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchText) ||
            task.description.toLowerCase().includes(searchText);
        const matchesStatus =
            selectedStatus === "All" || task.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });
    taskList.replaceChildren();
    if (filteredTasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task to get started!"
            : "No tasks match your search.";
        taskList.appendChild(empty);
        return;
    }
    filteredTasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card";
        const top = document.createElement("div");
        top.className = "task-card-top";
        const title = document.createElement("h3");
        title.textContent = task.title;
        top.appendChild(title);
        const tags = document.createElement("div");
        tags.className = "task-meta";
        const priorityClass = task.priority === "High"
            ? "priority-high"
            : task.priority === "Low"
                ? "priority-low"
                : "";
        tags.appendChild(createTag(task.priority, priorityClass));
        tags.appendChild(createTag(task.status));
        if (task.due_date) {
            tags.appendChild(createTag(`Due: ${task.due_date}`));
        }
        const description = document.createElement("p");
        description.textContent = task.description || "No description added.";
        const actions = document.createElement("div");
        actions.className = "task-actions";
        actions.appendChild(createButton("Edit", "", () => editTask(task)));
        if (task.status !== "Completed") {
            actions.appendChild(createButton(
                "Mark completed",
                "",
                () => updateTask(task.id, { status: "Completed" })
            ));
        }
        actions.appendChild(createButton(
            "Delete",
            "delete-btn",
            () => deleteTask(task.id)
        ));
        card.append(top, description, tags, actions);
        taskList.appendChild(card);
    });
}
taskForm.addEventListener("submit", async event => {
    event.preventDefault();
    const taskId = document.getElementById("task-id").value;
    const taskData = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value,
        due_date: document.getElementById("due-date").value
    };
    try {
        if (taskId) {
            await apiRequest(`/api/tasks/${taskId}`, {
                method: "PATCH",
                body: JSON.stringify(taskData)
            });
            showMessage("Task updated successfully.");
        } else {
            await apiRequest("/api/tasks", {
                method: "POST",
                body: JSON.stringify(taskData)
            });
            showMessage("Task added successfully.");
        }
        resetForm();
        await loadTasks();
    } catch (error) {
        showMessage(error.message, true);
    }
});
function editTask(task) {
    document.getElementById("task-id").value = task.id;
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("priority").value = task.priority;
    document.getElementById("status").value = task.status;
    document.getElementById("due-date").value = task.due_date;
    document.getElementById("form-heading").textContent = "Edit task";
    document.getElementById("save-button").textContent = "Save changes";
    document.getElementById("cancel-edit").classList.remove("hidden");
    document.getElementById("title").focus();
}
async function updateTask(taskId, changes) {
    try {
        await apiRequest(`/api/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify(changes)
        });
        showMessage("Task updated successfully.");
        await loadTasks();
    } catch (error) {
        showMessage(error.message, true);
    }
}
async function deleteTask(taskId) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this task?"
    );
    if (!confirmed) return;
    try {
        await apiRequest(`/api/tasks/${taskId}`, {
            method: "DELETE"
        });
        showMessage("Task deleted successfully.");
        await loadTasks();
    } catch (error) {
        showMessage(error.message, true);
    }
}
function resetForm() {
    taskForm.reset();
    document.getElementById("task-id").value = "";
    document.getElementById("form-heading").textContent = "Add a new task";
    document.getElementById("save-button").textContent = "Add task";
    document.getElementById("cancel-edit").classList.add("hidden");
}
document.getElementById("cancel-edit").addEventListener("click", resetForm);
document.getElementById("search-input").addEventListener("input", renderTasks);
document.getElementById("filter-status").addEventListener("change", renderTasks);
async function startApp() {
    try {
        await loadUser();
        await loadTasks();
    } catch (error) {
        showMessage(error.message, true);
    }
}
startApp();

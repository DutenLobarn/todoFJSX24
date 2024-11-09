// app.js
// Funktionsbaserad kod utan klasser

// Elementreferenser
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const categoryInput = document.getElementById("category-input");
const tagsInput = document.getElementById("tags-input");
const prioritySelect = document.getElementById("priority-select");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");
const sortTasks = document.getElementById("sort-tasks");
const themeToggle = document.getElementById("theme-toggle");

// Lista över uppgifter
let tasks = [];

// Initialisera applikationen
function init() {
  taskForm.addEventListener("submit", addTask);
  taskList.addEventListener("click", handleTaskAction);
  searchInput.addEventListener("input", renderTasks);
  filterStatus.addEventListener("change", renderTasks);
  sortTasks.addEventListener("change", renderTasks);
  themeToggle.addEventListener("click", toggleTheme);

  // Drag-and-Drop funktionalitet
  enableDragAndDrop();

  // Rendera uppgifter
  renderTasks();

  // Ställ in initialt tema
  setInitialTheme();
}

// Lägg till en ny uppgift
function addTask(e) {
  e.preventDefault();

  const taskText = taskInput.value.trim();
  const category = categoryInput.value.trim();
  const tags = tagsInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
  const priority = prioritySelect.value;

  if (taskText === "") {
    displayMessage("Uppgiften kan inte vara tom.", "error");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: taskText,
    category,
    tags,
    priority,
    completed: false,
    date: new Date(),
  };

  tasks.push(newTask);
  renderTasks();

  // Återställ formuläret
  taskForm.reset();
}

// Hantera klick på uppgiftsknappar
function handleTaskAction(e) {
  const target = e.target.closest("button");
  if (!target) return;

  const taskItem = target.closest(".task-item");
  const taskId = taskItem ? taskItem.dataset.id : null;

  if (!taskId) return;

  if (target.classList.contains("complete-btn")) {
    toggleTaskCompletion(taskId);
  } else if (target.classList.contains("edit-btn")) {
    editTask(taskId);
  } else if (target.classList.contains("delete-btn")) {
    deleteTask(taskId);
  }
}

// Växla uppgiftens status
function toggleTaskCompletion(id) {
  tasks = tasks.map((task) =>
    task.id == id ? { ...task, completed: !task.completed } : task
  );
  renderTasks();
}

// Redigera en uppgift
function editTask(id) {
  const task = tasks.find((task) => task.id == id);

  // Skapa ett redigeringsformulär direkt i uppgiften
  const taskItem = document.querySelector(`.task-item[data-id='${id}']`);
  const editForm = document.createElement("form");
  editForm.classList.add("edit-form");

  editForm.innerHTML = `
        <input type="text" name="edit-text" value="${task.text}" required>
        <button  type="submit"><i class="fas fa-save" aria-label="Spara" title="Spara"></i></button>
        <button type="button" class="cancel-btn"><i class="fas fa-times" aria-label="Avbryt" title="Avbryt"></i></button>
    `;

  // Ersätt uppgiftens detaljer med redigeringsformuläret
  const taskDetails = taskItem.querySelector(".task-details");
  taskItem.replaceChild(editForm, taskDetails);

  // Hantera sparande och avbrytande
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const newText = editForm.elements["edit-text"].value.trim();
    if (newText !== "") {
      task.text = newText;
      renderTasks();
    }
  });

  editForm.querySelector(".cancel-btn").addEventListener("click", function () {
    renderTasks();
  });
}

// Ta bort en uppgift
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id != id);
  renderTasks();
}

// Rendera uppgifterna
function renderTasks() {
  // Få filtervärden
  const searchText = searchInput.value.toLowerCase();
  const filter = filterStatus.value;
  const sort = sortTasks.value;

  let filteredTasks = tasks;

  // Filtrera baserat på söktext
  if (searchText) {
    filteredTasks = filteredTasks.filter((task) =>
      task.text.toLowerCase().includes(searchText)
    );
  }

  // Filtrera baserat på status
  if (filter !== "all") {
    filteredTasks = filteredTasks.filter((task) =>
      filter === "completed" ? task.completed : !task.completed
    );
  }

  // Sortera uppgifterna
  if (sort === "date") {
    filteredTasks.sort((a, b) => b.date - a.date);
  } else if (sort === "priority") {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filteredTasks.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  }

  // Töm nuvarande lista
  taskList.innerHTML = "";

  // Rendera varje uppgift
  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item task-item-add ${
      task.priority
    }-priority category-${task.category.toLowerCase()}`;

    taskItem.setAttribute("draggable", true);
    taskItem.dataset.id = task.id;

    if (task.completed) {
      taskItem.classList.add("completed");
    }

    taskItem.innerHTML = `
      <div class="task-details">
          <strong>${task.text}</strong>
          <p>Kategori: ${task.category || "Ingen"}</p>
          <p>Taggar: ${task.tags.join(", ") || "Inga"}</p>
          <p>Prioritet: ${task.priority}</p>
      </div>
      <div class="task-actions">
          <button class="complete-btn" aria-label="${
            task.completed ? "Markera som ej klar" : "Markera som klar"
          }" title="${
      task.completed ? "Markera som ej klar" : "Markera som klar"
    }">
              <i class="fas ${task.completed ? "fa-undo" : "fa-check"}"></i>
          </button>
          <button class="edit-btn" aria-label="Redigera uppgift" title="Redigera uppgift">
              <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" aria-label="Ta bort uppgift" title="Ta bort uppgift">
              <i class="fas fa-trash"></i>
          </button>
      </div>
    `;

    taskList.appendChild(taskItem);

    // Ta bort animationsklassen efter animationen är klar
    setTimeout(() => {
      taskItem.classList.remove("task-item-add");
    }, 500);
  });
}

// Växla mellan ljus och mörk tema
function toggleTheme() {
  if (document.body.classList.contains("dark-theme")) {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
  }
}

// Ställ in initialt tema
function setInitialTheme() {
  document.body.classList.add("light-theme");
}

// Aktivera Drag-and-Drop funktionalitet
function enableDragAndDrop() {
  let draggedItem = null;

  taskList.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("task-item")) {
      draggedItem = e.target;
      draggedItem.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    }
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) {
      taskList.appendChild(draggedItem);
    } else {
      taskList.insertBefore(draggedItem, afterElement);
    }
  });

  taskList.addEventListener("drop", () => {
    if (draggedItem) {
      draggedItem.classList.remove("dragging");
      reorderTasks();
    }
  });

  taskList.addEventListener("dragend", () => {
    if (draggedItem) {
      draggedItem.classList.remove("dragging");
      draggedItem = null;
    }
  });
}

// Funktion för att hitta närmaste element under muspekaren
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Uppdatera ordningen på uppgifterna
function reorderTasks() {
  const items = Array.from(taskList.children);
  tasks = items.map((item) => {
    const id = item.dataset.id;
    return tasks.find((task) => task.id == id);
  });
}

// Visa meddelanden till användaren
function displayMessage(message, type) {
  // Skapa ett meddelandeelement
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Lägg till meddelandet i container
  document.querySelector(".container").prepend(messageDiv);

  // Ta bort meddelandet efter några sekunder
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Starta applikationen när dokumentet är laddat
document.addEventListener("DOMContentLoaded", init);

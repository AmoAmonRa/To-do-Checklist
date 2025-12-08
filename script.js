// DOM Elements
const todoInput = document.getElementById("todo-input");
const addTodoBtn = document.getElementById("add-todo-btn");
const todoList = document.getElementById("todo-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const totalTasksSpan = document.getElementById("total-tasks");
const completedTasksSpan = document.getElementById("completed-tasks");
const todoEmptyState = document.getElementById("todo-empty-state");

// Modal Elements
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const saveEditBtn = document.getElementById("save-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const closeModal = document.querySelector(".close");

// New elements for edit modal
const editPrioritySelect = document.getElementById("edit-priority-select");
const editDueDateInput = document.getElementById("edit-due-date-input");
const editCategorySelect = document.getElementById("edit-category-select");

// New elements for priority, category and due date
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date-input");
const categorySelect = document.getElementById("category-select");

// State
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";
let currentEditId = null; // Track which todo is being edited

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Set minimum date for due date input to today
  const today = new Date().toISOString().split('T')[0];
  dueDateInput.min = today;
  editDueDateInput.min = today;
  
  renderTodos();
  updateStats();

  // Event listeners
  addTodoBtn.addEventListener("click", addTodo);
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Drag and drop functionality
  setupDragAndDrop();

  // Modal event listeners
  saveEditBtn.addEventListener("click", saveEdit);
  cancelEditBtn.addEventListener("click", closeEditModal);
  closeModal.addEventListener("click", closeEditModal);
  window.addEventListener("click", (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
});

// Add a new todo
function addTodo() {
  const text = todoInput.value.trim();
  if (text === "") return;

  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    priority: prioritySelect.value, // high, medium, low
    category: categorySelect.value, // work, personal, shopping, health
    dueDate: dueDateInput.value || null,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  saveToLocalStorage();
  renderTodos();
  updateStats();

  // Clear input and focus
  todoInput.value = "";
  prioritySelect.value = "medium";
  categorySelect.value = "personal";
  dueDateInput.value = "";
  todoInput.focus();
}

// Toggle todo completion
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveToLocalStorage();
  renderTodos();
  updateStats();
}

// Edit todo text
function editTodo(id, newText) {
  if (newText.trim() === "") return;

  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, text: newText.trim() };
    }
    return todo;
  });

  saveToLocalStorage();
  renderTodos();
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveToLocalStorage();
  renderTodos();
  updateStats();
}

// Set todo priority
function setPriority(id, priority) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, priority };
    }
    return todo;
  });

  saveToLocalStorage();
  renderTodos();
}

// Set todo category
function setCategory(id, category) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, category };
    }
    return todo;
  });

  saveToLocalStorage();
  renderTodos();
}

// Set due date
function setDueDate(id, date) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, dueDate: date };
    }
    return todo;
  });

  saveToLocalStorage();
  renderTodos();
}

// Filter todos based on current filter
function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

// Render todos to the DOM
function renderTodos() {
  const filteredTodos = getFilteredTodos();

  // Clear the list
  todoList.innerHTML = "";

  // Show empty state if no todos
  if (filteredTodos.length === 0) {
    todoEmptyState.style.display = "block";
    return;
  }

  todoEmptyState.style.display = "none";

  // Add todos to the list
  filteredTodos.forEach((todo) => {
    const todoItem = document.createElement("li");
    todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`;
    todoItem.dataset.id = todo.id;
    todoItem.draggable = true; // Add draggable attribute

    // Priority indicator
    let priorityClass = "";
    let priorityText = "";
    switch (todo.priority) {
      case "high":
        priorityClass = "priority-high";
        priorityText = "High";
        break;
      case "medium":
        priorityClass = "priority-medium";
        priorityText = "Medium";
        break;
      case "low":
        priorityClass = "priority-low";
        priorityText = "Low";
        break;
    }

    // Category indicator
    let categoryText = "";
    switch (todo.category) {
      case "work":
        categoryText = "Work";
        break;
      case "personal":
        categoryText = "Personal";
        break;
      case "shopping":
        categoryText = "Shopping";
        break;
      case "health":
        categoryText = "Health";
        break;
    }

    // Due date
    let dueDateText = "";
    if (todo.dueDate) {
      const date = new Date(todo.dueDate);
      dueDateText = `<span class="todo-due-date">${date.toLocaleDateString()}</span>`;
    }

    todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${
              todo.completed ? "checked" : ""
            }>
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <span class="todo-priority ${priorityClass}">${priorityText}</span>
                <span class="todo-category">${categoryText}</span>
                ${dueDateText}
                <button class="todo-edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="todo-delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

    // Add event listeners
    const checkbox = todoItem.querySelector(".todo-checkbox");
    const editBtn = todoItem.querySelector(".todo-edit-btn");
    const deleteBtn = todoItem.querySelector(".todo-delete-btn");
    const todoText = todoItem.querySelector(".todo-text");

    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    editBtn.addEventListener("click", () => openEditModal(todo.id, todo.text));

    // Double-click to edit
    todoText.addEventListener("dblclick", () => openEditModal(todo.id, todo.text));

    todoList.appendChild(todoItem);
  });
}

// Open edit modal
function openEditModal(id, text) {
  currentEditId = id;
  editInput.value = text;
  
  // Find the todo item to get its priority, category and due date
  const todo = todos.find(t => t.id === id);
  if (todo) {
    editPrioritySelect.value = todo.priority;
    editCategorySelect.value = todo.category;
    editDueDateInput.value = todo.dueDate || "";
  }
  
  editModal.style.display = "block";
  editInput.focus();
}

// Save edited todo
function saveEdit() {
  if (currentEditId !== null) {
    const newText = editInput.value.trim();
    if (newText !== "") {
      todos = todos.map((todo) => {
        if (todo.id === currentEditId) {
          return { 
            ...todo, 
            text: newText.trim(),
            priority: editPrioritySelect.value,
            category: editCategorySelect.value,
            dueDate: editDueDateInput.value || null
          };
        }
        return todo;
      });
      
      saveToLocalStorage();
      renderTodos();
      closeEditModal();
    }
  }
}

// Close edit modal
function closeEditModal() {
  editModal.style.display = "none";
  currentEditId = null;
}

// Update statistics
function updateStats() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;

  totalTasksSpan.textContent = `Total: ${total} ${
    total === 1 ? "task" : "tasks"
  }`;
  completedTasksSpan.textContent = `Completed: ${completed}`;
}

// Save todos to localStorage
function saveToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Drag and drop functionality
function setupDragAndDrop() {
  let draggedItem = null;

  todoList.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("todo-item")) {
      draggedItem = e.target;
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", e.target.dataset.id);
    }
  });

  todoList.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("todo-item")) {
      e.target.classList.remove("dragging");
      draggedItem = null;
    }
  });

  todoList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const draggable = document.querySelector(".dragging");

    if (afterElement == null) {
      todoList.appendChild(draggable);
    } else {
      todoList.insertBefore(draggable, afterElement);
    }
  });

  todoList.addEventListener("dragenter", (e) => {
    e.preventDefault();
    if (e.target.classList.contains("todo-item")) {
      e.target.classList.add("drag-over");
    }
  });

  todoList.addEventListener("dragleave", (e) => {
    if (e.target.classList.contains("todo-item")) {
      e.target.classList.remove("drag-over");
    }
  });

  todoList.addEventListener("drop", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const draggable = document.querySelector(".dragging");

    if (afterElement == null) {
      todoList.appendChild(draggable);
    } else {
      todoList.insertBefore(draggable, afterElement);
    }

    // Update todo order in state
    updateTodoOrder();
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".todo-item:not(.dragging)"),
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

function updateTodoOrder() {
  const todoItems = Array.from(todoList.querySelectorAll(".todo-item"));
  const newOrder = todoItems.map((item) => parseInt(item.dataset.id));

  // Create a new array with todos in the correct order
  const orderedTodos = [];
  newOrder.forEach(id => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      orderedTodos.push(todo);
    }
  });

  todos = orderedTodos;
  saveToLocalStorage();
}

// Add some sample todos for demonstration
function addSampleTodos() {
  const sampleTodos = [
    {
      id: 1,
      text: "Create project proposal",
      completed: false,
      priority: "high",
      category: "work",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: 2,
      text: "Buy groceries for the week",
      completed: true,
      priority: "medium",
      category: "shopping",
      dueDate: new Date(Date.now() + 172800000).toISOString(),
    },
    {
      id: 3,
      text: "Morning jog",
      completed: false,
      priority: "low",
      category: "health",
      dueDate: new Date(Date.now() + 259200000).toISOString(),
    },
  ];

  todos = sampleTodos;
  saveToLocalStorage();
  renderTodos();
  updateStats();
}

// Initialize with sample data if no todos exist
if (todos.length === 0) {
  addSampleTodos();
}

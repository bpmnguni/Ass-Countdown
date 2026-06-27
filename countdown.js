// Fallback default dataset if localStorage is completely empty
const defaultAssignments = [
  {
    title: "COS1501 Quiz-1",
    due: new Date(2025, 4, 13, 23, 0, 0).toISOString(),
  },
  {
    title: "MAT1512 Asign-1",
    due: new Date(2025, 5, 20, 23, 0, 0).toISOString(),
  },
];

// Load from local storage, or fallback to default
let assignments =
  JSON.parse(localStorage.getItem("studentAssignments")) || defaultAssignments;

// Convert ISO strings back to actual Date objects
assignments = assignments.map((a) => ({ ...a, due: new Date(a.due) }));

const courseColors = {
  COS1501: "#ffb703",
  MAT1512: "#219ebc",
  APM1513: "#8ac926",
  COS1521: "#00c7c1",
  COS1511: "#1982c4",
  COS1512: "#6a4c93",
  MAT1503: "#fb5607",
};

const container = document.getElementById("tilesContainer");

// Helper function to save current dataset to user local storage
function saveToLocalStorage() {
  localStorage.setItem("studentAssignments", JSON.stringify(assignments));
}

function createTile(assignment, idx) {
  const tile = document.createElement("div");
  tile.className = "tile";

  tile.style.transition = "transform 0.2s, box-shadow 0.2s";
  tile.onmouseenter = () => {
    tile.style.transform = "scale(1.03)";
  };
  tile.onmouseleave = () => {
    tile.style.transform = "scale(1)";
  };

  const courseCode = assignment.title.split(" ")[0];
  tile.style.borderLeft = `8px solid ${courseColors[courseCode] || "#a0a0a0"}`;

  tile.innerHTML = `
      <div class="assignment-title">${assignment.title}</div>
      <div class="countdown" id="countdown${idx}">Loading...</div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="progress${idx}"></div>
      </div>
      <div class="due-date">Due: ${assignment.due.toLocaleString()}</div>
      <button class="delete-btn" onclick="deleteAssignment(${idx})">Delete</button>
    `;

  container.appendChild(tile);
}

function renderAssignments() {
  container.innerHTML = "";

  // Get filter query
  const query = document.getElementById("searchBox").value.toLowerCase();

  assignments.forEach((a, i) => {
    if (a.title.toLowerCase().includes(query)) {
      createTile(a, i);
    }
  });
  updateCountdowns();
}

function updateCountdowns() {
  assignments.forEach((assignment, idx) => {
    const countdownElem = document.getElementById(`countdown${idx}`);
    const progressElem = document.getElementById(`progress${idx}`);

    if (!countdownElem) return; // Skip if filtered out by search

    const now = new Date();
    const distance = assignment.due - now;

    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      countdownElem.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      countdownElem.style.color = days <= 7 ? "#d7263d" : "#06d6a0";

      // Progress simulation (assumes project opened 30 days prior)
      const startTime = new Date(assignment.due);
      startTime.setDate(startTime.getDate() - 30);
      const total = assignment.due - startTime;
      const elapsed = now - startTime;
      const percent = Math.min((elapsed / total) * 100, 100);
      progressElem.style.width = `${Math.max(percent, 0)}%`;
    } else {
      countdownElem.textContent = "Time's up!";
      countdownElem.style.color = "#d7263d";
      progressElem.style.width = `100%`;
    }
  });
}

// Global scope action handler to delete items
window.deleteAssignment = function (idx) {
  assignments.splice(idx, 1);
  saveToLocalStorage();
  renderAssignments();
};

// Event listener for adding items dynamically
document.getElementById("addBtn").addEventListener("click", () => {
  const titleInput = document.getElementById("newTitle");
  const dueInput = document.getElementById("newDue");

  if (!titleInput.value || !dueInput.value) {
    alert("Please fill out both Title and Due Date!");
    return;
  }

  const newAssignment = {
    title: titleInput.value,
    due: new Date(dueInput.value),
  };

  assignments.push(newAssignment);
  saveToLocalStorage();
  renderAssignments();

  // Clear Form Inputs
  titleInput.value = "";
  dueInput.value = "";
});

// Fixed search execution to work with dynamic rendering
document
  .getElementById("searchBox")
  .addEventListener("input", renderAssignments);

document.getElementById("sortSelect").addEventListener("change", function () {
  const sortBy = this.value;
  assignments.sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return a.due - b.due;
  });
  renderAssignments();
});

// Initial Setup
renderAssignments();
setInterval(updateCountdowns, 1000);

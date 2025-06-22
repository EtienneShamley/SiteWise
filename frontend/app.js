let currentNoteId = null;
let activeProjectId = null;
const userId = "demoUser123";

const folderList = document.getElementById("folderList");
const newProjectBtn = document.getElementById("newProjectBtn");
const newFolderBtn = document.getElementById("newFolderBtn");
const newNoteBtn = document.getElementById("newNoteBtn");
const noteList = document.getElementById("folderList");
const submitBtn = document.getElementById("submitBtn");
const textInput = document.getElementById("textInput");
const chatWindow = document.getElementById("chatWindow");

// === CREATE PROJECT ===
newProjectBtn.addEventListener("click", () => {
  const projectId = `project-${Date.now()}`;
  const name = prompt("Project name:", "Untitled Project");
  if (!name) return;

  activeProjectId = projectId;

  const projectEl = document.createElement("li");
  projectEl.className = "text-yellow-500 font-bold flex justify-between items-center";

  projectEl.innerHTML = `
    <span class="project-title">${name}</span>
    <div class="space-x-2 text-xs">
      <i class="fas fa-pen cursor-pointer rename-project" title="Rename Project"></i>
      <i class="fas fa-trash cursor-pointer delete-project" title="Delete Project"></i>
    </div>
  `;

  const folderContainer = document.createElement("ul");
  folderContainer.className = "ml-3 mt-2 space-y-2";
  folderContainer.id = `folders-${projectId}`;

  folderList.appendChild(projectEl);
  folderList.appendChild(folderContainer);
});

// === CREATE FOLDER ===
newFolderBtn.addEventListener("click", async () => {
  const folderId = Date.now().toString();
  const folderName = prompt("Folder name:", "Untitled Folder");

  try {
    const res = await fetch("http://localhost:3001/api/files/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, folderId, name: folderName }),
    });

    const result = await res.json();
    console.log("✅ Folder created:", result);
    renderFolder(folderId, folderName);
  } catch (err) {
    console.error("❌ Failed to create folder:", err);
  }
});

// === RENDER FOLDER ===
function renderFolder(folderId, folderName) {
  const folderEl = document.createElement("li");
  folderEl.className =
    "bg-yellow-500 text-black hover:bg-yellow-600 transition p-2 rounded text-sm font-medium";

  folderEl.innerHTML = `
    <div class="flex justify-between items-center">
      <span class="folder-title">${folderName}</span>
      <div class="space-x-2 text-xs">
        <i class="fas fa-plus cursor-pointer" title="New Note" onclick="addNoteToFolder('${folderId}')"></i>
        <i class="fas fa-pen cursor-pointer rename-folder" title="Rename Folder"></i>
        <i class="fas fa-trash cursor-pointer delete-folder" title="Delete Folder"></i>
      </div>
    </div>
    <ul id="notes-${folderId}" class="ml-4 mt-2 space-y-1 text-xs text-gray-800">
    </ul>
  `;

  const targetContainer =
    document.querySelector(`#folders-${activeProjectId}`) || folderList;
  targetContainer.appendChild(folderEl);
}

// === CREATE NOTE (ROOT) ===
newNoteBtn.addEventListener("click", async () => {
  const noteId = Date.now().toString();
  const title = prompt("Note name:", `Note - ${new Date().toLocaleString()}`) || `Note - ${new Date().toLocaleString()}`;

  try {
    const res = await fetch("http://localhost:3001/api/files/create-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, noteId, title }),
    });

    const data = await res.json();
    console.log("✅ Note created:", data.message);

    renderNote(noteId, title);
  } catch (err) {
    console.error("❌ Failed to create note:", err);
  }
});

// === RENDER NOTE ===
function renderNote(noteId, title, folderId = null) {
  const noteEl = document.createElement("li");
  noteEl.dataset.noteId = noteId;
  noteEl.className =
    "flex justify-between items-center bg-yellow-300 text-black hover:bg-yellow-400 transition p-2 rounded text-sm font-medium";

  noteEl.innerHTML = `
    <span class="note-title">${title}</span>
    <div class="space-x-2 text-xs">
      <i class="fas fa-pen cursor-pointer rename-note" title="Rename Note"></i>
      <i class="fas fa-trash cursor-pointer delete-note" title="Delete Note"></i>
      <i class="fas fa-share cursor-pointer" title="Share (coming soon)"></i>
    </div>
  `;

  if (folderId) {
    const container = document.getElementById(`notes-${folderId}`);
    if (container) container.appendChild(noteEl);
  } else {
    noteList.appendChild(noteEl);
  }
}

// === CREATE NOTE INSIDE FOLDER ===
window.addNoteToFolder = async function (folderId) {
  const noteId = Date.now().toString();
  const title = prompt("Note name:", `Note - ${new Date().toLocaleString()}`) || `Note - ${new Date().toLocaleString()}`;

  try {
    const res = await fetch("http://localhost:3001/api/files/create-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, noteId, title }),
    });

    const data = await res.json();
    console.log("✅ Folder Note created:", data.message);

    renderNote(noteId, title, folderId);
  } catch (err) {
    console.error("❌ Failed to create folder note:", err);
  }
};

// === LOAD NOTE ===
noteList.addEventListener("click", async (e) => {
  const noteEl = e.target.closest("li");
  if (!noteEl || !noteEl.dataset.noteId) return;

  currentNoteId = noteEl.dataset.noteId;

  try {
    const res = await fetch(
      `http://localhost:3001/api/files/load/${userId}/${currentNoteId}`
    );
    const data = await res.json();
    console.log("📄 Loaded note:", data.content);
    renderChatMessages(data.content);
  } catch (err) {
    console.error("❌ Failed to load note:", err);
  }
});

// === CHAT MESSAGE RENDERING ===
function renderChatMessages(content) {
  chatWindow.innerHTML = "";

  if (Array.isArray(content)) {
    content.forEach((msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bg-[#1f1f1f] text-white p-3 rounded-lg";
      bubble.textContent = msg;
      chatWindow.appendChild(bubble);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

// === SUBMIT MESSAGE ===
submitBtn.addEventListener("click", async () => {
  const message = textInput.value.trim();
  if (!message || !currentNoteId) return;

  try {
    const res = await fetch("http://localhost:3001/api/files/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, noteId: currentNoteId, content: message }),
    });

    const result = await res.json();
    console.log("✅ Saved:", result.message);

    const bubble = document.createElement("div");
    bubble.className = "bg-green-700 text-white p-3 rounded-lg";
    bubble.textContent = message;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    textInput.value = "";
  } catch (err) {
    console.error("❌ Failed to save message:", err);
  }
});

// === GLOBAL RENAME/DELETE HANDLER ===
folderList.addEventListener("click", async (e) => {
  const parentEl = e.target.closest("li");
  if (!parentEl) return;

  // === RENAME PROJECT ===
  if (e.target.classList.contains("rename-project")) {
    const titleEl = parentEl.querySelector(".project-title");
    const newName = prompt("Rename project:", titleEl.textContent);
    if (newName) titleEl.textContent = newName;
  }

  // === DELETE PROJECT ===
  if (e.target.classList.contains("delete-project")) {
    if (confirm("Delete project and all folders/notes inside?")) {
      const next = parentEl.nextElementSibling;
      if (next && next.id?.startsWith("folders-")) next.remove();
      parentEl.remove();
    }
  }

  // === RENAME FOLDER ===
  if (e.target.classList.contains("rename-folder")) {
    const titleEl = parentEl.querySelector(".folder-title");
    const newName = prompt("Rename folder:", titleEl.textContent);
    if (newName) titleEl.textContent = newName;
  }

  // === DELETE FOLDER ===
  if (e.target.classList.contains("delete-folder")) {
    if (confirm("Delete this folder and its notes?")) {
      parentEl.remove();
    }
  }

  // === RENAME NOTE ===
  if (e.target.classList.contains("rename-note")) {
    const titleEl = parentEl.querySelector(".note-title");
    const newName = prompt("Rename note:", titleEl.textContent);
    if (newName) titleEl.textContent = newName;
  }

  // === DELETE NOTE ===
  if (e.target.classList.contains("delete-note")) {
    if (confirm("Delete this note?")) {
      parentEl.remove();
    }
  }
});

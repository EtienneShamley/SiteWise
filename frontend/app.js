let currentNoteId = null;
let activeProjectId = null;
const userId = "demoUser123"; // temp, later dynamic

const folderList = document.getElementById("folderList");
const newProjectBtn = document.getElementById("newProjectBtn");
const newFolderBtn = document.getElementById("newFolderBtn");
const newNoteBtn = document.getElementById("newNoteBtn");
const noteList = document.getElementById("folderList");
const submitBtn = document.getElementById("submitBtn");
const textInput = document.getElementById("textInput");
const chatWindow = document.getElementById("chatWindow");

// === PROJECT CREATION ===
newProjectBtn.addEventListener("click", () => {
  const projectId = `project-${Date.now()}`;
  const name = prompt("Project name:", "Untitled Project");
  if (!name) return;

  activeProjectId = projectId;

  const projectEl = document.createElement("li");
  projectEl.className = "text-green-400 font-bold";
  projectEl.textContent = name;

  const folderContainer = document.createElement("ul");
  folderContainer.className = "ml-3 mt-2 space-y-2";
  folderContainer.id = `folders-${projectId}`;

  folderList.appendChild(projectEl);
  folderList.appendChild(folderContainer);
});

// === FOLDER CREATION ===
newFolderBtn.addEventListener("click", async () => {
  const folderId = Date.now().toString();
  const folderData = {
    name: "Untitled Folder",
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch("http://localhost:3001/api/files/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, folderId, ...folderData }),
    });

    const result = await res.json();
    console.log("✅ Folder created:", result);

    renderFolder(folderId, folderData.name);
  } catch (err) {
    console.error("❌ Failed to create folder:", err);
  }
});

// === RENDER FOLDER ===
function renderFolder(folderId, folderName) {
  const folderEl = document.createElement("li");
  folderEl.className = "bg-[#222] p-2 rounded text-sm";

  folderEl.innerHTML = `
    <div class="flex justify-between items-center">
      <span>${folderName}</span>
      <div class="space-x-2 text-xs">
        <i class="fas fa-plus cursor-pointer" title="New Note" onclick="addNoteToFolder('${folderId}')"></i>
        <i class="fas fa-pen cursor-pointer" title="Rename"></i>
        <i class="fas fa-trash cursor-pointer" title="Delete"></i>
      </div>
    </div>
    <ul id="notes-${folderId}" class="ml-4 mt-2 space-y-1 text-xs text-gray-300">
      <!-- Notes will go here -->
    </ul>
  `;

  const targetContainer =
    document.querySelector(`#folders-${activeProjectId}`) || folderList;
  targetContainer.appendChild(folderEl);
}

// === CREATE STANDALONE NOTE (ROOT LEVEL) ===
newNoteBtn.addEventListener("click", async () => {
  const noteId = Date.now().toString();
  const title = "Untitled Note";

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

// === RENDER NOTE (ROOT LEVEL OR INSIDE FOLDER) ===
function renderNote(noteId, title, folderId = null) {
  const noteEl = document.createElement("li");
  noteEl.dataset.noteId = noteId;
  noteEl.className =
    "flex justify-between items-center bg-[#222] p-2 rounded text-sm";
  noteEl.innerHTML = `
    <span>${title}</span>
    <div class="space-x-2 text-xs">
      <i class="fas fa-pen cursor-pointer" title="Rename"></i>
      <i class="fas fa-trash cursor-pointer" title="Delete"></i>
      <i class="fas fa-share cursor-pointer" title="Share"></i>
    </div>
  `;

  if (folderId) {
    const container = document.getElementById(`notes-${folderId}`);
    if (container) container.appendChild(noteEl);
  } else {
    noteList.appendChild(noteEl);
  }
}

// === ADD NOTE TO FOLDER ===
window.addNoteToFolder = async function (folderId) {
  const noteId = Date.now().toString();
  const title = `Note - ${new Date().toLocaleString()}`;

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

// === LOAD NOTE ON CLICK ===
noteList.addEventListener("click", async (e) => {
  const noteEl = e.target.closest("li");
  if (!noteEl) return;

  const noteId = noteEl.dataset.noteId;
  if (!noteId) return;

  currentNoteId = noteId;

  try {
    const res = await fetch(
      `http://localhost:3001/api/files/load/${userId}/${noteId}`
    );
    const data = await res.json();
    console.log("📄 Loaded note:", data.content);

    renderChatMessages(data.content);
  } catch (err) {
    console.error("❌ Failed to load note:", err);
  }
});

// === RENDER CHAT MESSAGES ===
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

// === SUBMIT CHAT MESSAGE ===
submitBtn.addEventListener("click", async () => {
  const message = textInput.value.trim();
  if (!message || !currentNoteId) return;

  try {
    const res = await fetch("http://localhost:3001/api/files/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        noteId: currentNoteId,
        content: message,
      }),
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

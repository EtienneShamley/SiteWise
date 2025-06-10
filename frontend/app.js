let currentNoteId = null;

const userId = "demoUser123"; // temporary, later this will be dynamic
const folderList = document.getElementById("folderList");
const newFolderBtn = document.getElementById("newFolderBtn");
const newNoteBtn = document.getElementById("newNoteBtn");
const noteList = document.getElementById("folderList");
const submitBtn = document.getElementById("submitBtn");
const textInput = document.getElementById("textInput");
const chatWindow = document.getElementById("chatWindow");

// Create folder
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

// Render folder
function renderFolder(folderId, folderName) {
  const folderEl = document.createElement("li");
  folderEl.className = "bg-[#222] p-2 rounded text-sm";

  folderEl.innerHTML = `
    <div class="flex justify-between items-center">
      <span>${folderName}</span>
      <div class="space-x-2 text-xs">
        <i class="fas fa-plus cursor-pointer" title="New Note"></i>
        <i class="fas fa-pen cursor-pointer" title="Rename"></i>
        <i class="fas fa-trash cursor-pointer" title="Delete"></i>
      </div>
    </div>
    <ul id="notes-${folderId}" class="ml-4 mt-2 space-y-1 text-xs text-gray-300">
      <!-- Notes will go here -->
    </ul>
  `;

  folderList.appendChild(folderEl);
}

// Create standalone note
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

// Render a single note
function renderNote(noteId, title) {
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
  noteList.appendChild(noteEl);
}

// Load note and set currentNoteId
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

// Render messages to chat window
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

// Submit new chat message
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

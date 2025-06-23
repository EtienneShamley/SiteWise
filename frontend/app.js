let currentNoteId = null;
let activeProjectId = null;
let folderMap = {};
const userId = "demoUser123";

const projectList = document.getElementById("projectList");
const noteList = document.getElementById("noteList");
const chatWindow = document.getElementById("chatWindow");
const textInput = document.getElementById("textInput");
const submitBtn = document.getElementById("submitBtn");
const newProjectBtn = document.getElementById("newProjectBtn");
const newFolderBtn = document.getElementById("newFolderBtn");
const newNoteBtn = document.getElementById("newNoteBtn");

// === Create Project ===
newProjectBtn.addEventListener("click", () => {
  const name = prompt("Project name:", "Untitled Project");
  if (!name) return;
  const id = `project-${Date.now()}`;
  activeProjectId = id;

  const projectEl = document.createElement("li");
  projectEl.className = "text-white cursor-pointer hover:bg-gray-700 px-2 py-1 rounded";
  projectEl.textContent = name;
  projectEl.onclick = () => {
    renderFolders(id);
  };

  folderMap[id] = [];
  projectList.appendChild(projectEl);
});

// === Create Folder ===
newFolderBtn.addEventListener("click", () => {
  if (!activeProjectId) return alert("Create/select a project first");
  const name = prompt("Folder name:", "Untitled Folder");
  if (!name) return;
  const folderId = `folder-${Date.now()}`;

  folderMap[activeProjectId].push({ id: folderId, name, notes: [] });
  renderFolders(activeProjectId);
});

// === Render Folders + Notes ===
function renderFolders(projectId) {
  noteList.innerHTML = "";
  folderMap[projectId]?.forEach((folder) => {
    const folderEl = document.createElement("li");
    folderEl.className = "text-white bg-[#222] p-2 rounded";
    folderEl.innerHTML = `
      <div class="flex justify-between items-center">
        <span>${folder.name}</span>
        <div class="space-x-2 text-xs">
          <i class="fas fa-plus cursor-pointer" title="Add Note" onclick="addNote('${folder.id}')"></i>
        </div>
      </div>
      <ul id="notes-${folder.id}" class="ml-4 mt-2 space-y-1 text-sm"></ul>
    `;
    noteList.appendChild(folderEl);

    folder.notes.forEach((note) => {
      const noteEl = document.createElement("li");
      noteEl.className = "bg-[#1a1a1a] text-white p-2 rounded flex justify-between items-center hover:bg-gray-700";
      noteEl.innerHTML = `
        <span class="flex-1 cursor-pointer" onclick="loadNote('${note.id}')">${note.title}</span>
        <div class="space-x-2 text-xs flex-shrink-0">
          <i class="fas fa-pen cursor-pointer" title="Rename" onclick="renameNote(event, '${folder.id}', '${note.id}')"></i>
          <i class="fas fa-trash cursor-pointer" title="Delete" onclick="deleteNote(event, '${folder.id}', '${note.id}')"></i>
          <i class="fas fa-share cursor-pointer" title="Share" onclick="shareNote(event, '${note.id}')"></i>
        </div>
      `;
      document.getElementById(`notes-${folder.id}`).appendChild(noteEl);
    });
  });
}

// === Add Note ===
window.addNote = (folderId) => {
  const noteId = `note-${Date.now()}`;
  const title = prompt("Note title:", "Untitled Note");
  if (!title) return;
  const folder = folderMap[activeProjectId].find((f) => f.id === folderId);
  folder.notes.push({ id: noteId, title });
  renderFolders(activeProjectId);
};

// === Load Note ===
window.loadNote = (noteId) => {
  currentNoteId = noteId;
  chatWindow.innerHTML = `<div class="bg-[#2a2a2a] text-white p-3 rounded-lg">Opened: ${noteId}</div>`;
};

// === Rename Note ===
window.renameNote = (event, folderId, noteId) => {
  event.stopPropagation();
  const newTitle = prompt("New title:");
  if (!newTitle) return;
  const folder = folderMap[activeProjectId].find((f) => f.id === folderId);
  const note = folder.notes.find((n) => n.id === noteId);
  note.title = newTitle;
  renderFolders(activeProjectId);
};

// === Delete Note ===
window.deleteNote = (event, folderId, noteId) => {
  event.stopPropagation();
  const confirmDelete = confirm("Delete this note?");
  if (!confirmDelete) return;
  const folder = folderMap[activeProjectId].find((f) => f.id === folderId);
  folder.notes = folder.notes.filter((n) => n.id !== noteId);
  renderFolders(activeProjectId);
};

// === Share Note ===
window.shareNote = (event, noteId) => {
  event.stopPropagation();
  alert(`This would open share/export options for note: ${noteId}`);
};

// === Submit ===
submitBtn.addEventListener("click", () => {
  const message = textInput.value.trim();
  if (!message || !currentNoteId) return;
  const bubble = document.createElement("div");
  bubble.className = "bg-green-700 text-white p-3 rounded-lg";
  bubble.textContent = message;
  chatWindow.appendChild(bubble);
  textInput.value = "";
});

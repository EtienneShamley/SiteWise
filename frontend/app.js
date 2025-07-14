let currentNoteId = null;
let activeProjectId = null;  // Highlighted project
let activeFolderId = null;   // Highlighted folder (inside highlighted project)
let expandedProjectId = null;
let projectData = [];
let folderMap = {};
let rootNotes = [];
const userId = "demoUser123";

document.addEventListener("DOMContentLoaded", () => {
  const projectList    = document.getElementById("projectList");
  const rootNoteList   = document.getElementById("rootNoteList");
  const noteList       = document.getElementById("noteList");
  const chatWindow     = document.getElementById("chatWindow");
  const textInput      = document.getElementById("textInput");
  const submitBtn      = document.getElementById("submitBtn");
  const newProjectBtn  = document.getElementById("newProjectBtn");
  const newFolderBtn   = document.getElementById("newFolderBtn");
  const newRootNoteBtn = document.getElementById("newRootNoteBtn");
  const middlePane     = document.getElementById("middlePane");
  const createTemplateBtn = document.getElementById("createTemplateBtn");
  const addSectionBtn     = document.getElementById("addSectionBtn");
  const templateBuilder   = document.getElementById("templateBuilder");
  const templateSections  = document.getElementById("templateSections");
  const backToChatBtn     = document.getElementById("backToChatBtn");

  middlePane.style.display = "none";

  // --- ROOT NOTE CREATION (and "New Note" logic for left pane) ---
  if (newRootNoteBtn) {
    newRootNoteBtn.addEventListener("click", () => {
      // If a folder is highlighted, create in that folder
      if (activeFolderId && activeProjectId) {
        window.addFolderNote(activeProjectId, activeFolderId);
      } else if (!activeProjectId && !activeFolderId) {
        // Nothing highlighted: root note
        addRootNote();
      } else {
        // Project selected, but no folder
        alert("Select a folder to add a note, or unselect to create a root note.");
      }
    });
  }

  function addRootNote() {
    const title = prompt("Note title:", "Untitled Note");
    if (!title) return;
    const nid = `root-note-${Date.now()}`;
    rootNotes.push({ id: nid, title });
    renderRootNotes();
    showRootNotes();
  }

  function renderRootNotes() {
    if (!rootNoteList) return;
    rootNoteList.innerHTML = "";
    rootNotes.forEach(n => {
      const li = document.createElement("li");
      li.className = "bg-[#252525] text-white p-2 rounded flex justify-between items-center hover:bg-gray-700";
      li.innerHTML = `
        <span class="flex-1 cursor-pointer" onclick="window.loadRootNote('${n.id}')">
          ${n.title} <span class="text-xs bg-gray-600 px-2 py-0.5 rounded ml-2">Note</span>
        </span>
        <div class="space-x-2 text-xs flex-shrink-0">
          <i class="fas fa-pen   cursor-pointer" title="Rename" onclick="window.renameRootNote(event, '${n.id}')"></i>
          <i class="fas fa-trash cursor-pointer" title="Delete" onclick="window.deleteRootNote(event, '${n.id}')"></i>
          <i class="fas fa-share cursor-pointer" title="Share"  onclick="window.shareRootNote(event, '${n.id}')"></i>
        </div>
      `;
      rootNoteList.appendChild(li);
    });
  }

  window.loadRootNote = (nid) => {
    clearActiveSelection();
    middlePane.style.display = "block";
    noteList.innerHTML = "";
    currentNoteId = nid;
    chatWindow.innerHTML = `<div class="bg-[#2a2a2a] text-white p-3 rounded-lg">Opened root note: ${nid}</div>`;
  };

  window.renameRootNote = (e, nid) => {
    e.stopPropagation();
    const note = rootNotes.find(n => n.id === nid);
    if (!note) return;
    const newTitle = prompt("New note title:", note.title);
    if (!newTitle) return;
    note.title = newTitle;
    renderRootNotes();
  };

  window.deleteRootNote = (e, nid) => {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    rootNotes = rootNotes.filter(n => n.id !== nid);
    renderRootNotes();
    noteList.innerHTML = "";
    chatWindow.innerHTML = "";
    currentNoteId = null;
  };

  window.shareRootNote = (e, nid) => {
    e.stopPropagation();
    alert(`Share/export root note ${nid} (placeholder).`);
  };

  function showRootNotes() {
    middlePane.style.display = "block";
    noteList.innerHTML = "";
    rootNotes.forEach(n => {
      const li = document.createElement("li");
      li.className = "bg-[#252525] text-white p-2 rounded flex justify-between items-center hover:bg-gray-700";
      li.innerHTML = `
        <span class="flex-1 cursor-pointer" onclick="window.loadRootNote('${n.id}')">
          ${n.title} <span class="text-xs bg-gray-600 px-2 py-0.5 rounded ml-2">Note</span>
        </span>
        <div class="space-x-2 text-xs flex-shrink-0">
          <i class="fas fa-pen   cursor-pointer" title="Rename" onclick="window.renameRootNote(event, '${n.id}')"></i>
          <i class="fas fa-trash cursor-pointer" title="Delete" onclick="window.deleteRootNote(event, '${n.id}')"></i>
          <i class="fas fa-share cursor-pointer" title="Share"  onclick="window.shareRootNote(event, '${n.id}')"></i>
        </div>
      `;
      noteList.appendChild(li);
    });
  }

  // --- CREATE PROJECT ---
  newProjectBtn.addEventListener("click", () => {
    const name = prompt("Project name:", "Untitled Project");
    if (!name) return;
    const id = `project-${Date.now()}`;
    projectData.push({ id, name });
    folderMap[id] = [];
    expandedProjectId = null;
    setActiveSelection(id, null);
    renderProjects();
  });

  // --- CREATE FOLDER ---
  newFolderBtn.addEventListener("click", () => {
    if (!activeProjectId || activeFolderId) return alert("Highlight a project (not a folder) first.");
    const name = prompt("Folder name:", "Untitled Folder");
    if (!name) return;
    const fid = `folder-${Date.now()}`;
    folderMap[activeProjectId].push({ id: fid, name, notes: [] });
    expandedProjectId = activeProjectId;
    renderProjects();
  });

  // --- HIGHLIGHTING LOGIC ---
  window.selectProject = (pid) => {
    // If already project-selected and no folder selected, deselect
    if (activeProjectId === pid && !activeFolderId) {
      clearActiveSelection();
    } else {
      setActiveSelection(pid, null);
    }
    renderProjects();
  };

  window.selectFolder = (pid, fid) => {
    // If already folder-selected, deselect both
    if (activeFolderId === fid && activeProjectId === pid) {
      clearActiveSelection();
      return;
    }
    setActiveSelection(pid, fid);
    renderProjects();
    window.toggleFolder(pid, fid);
  };

  function setActiveSelection(pid, fid) {
    activeProjectId = pid || null;
    activeFolderId = fid || null;
    expandedProjectId = pid || null;
  }

  function clearActiveSelection() {
    activeProjectId = null;
    activeFolderId = null;
    expandedProjectId = null;
    renderProjects();
    noteList.innerHTML = "";
    middlePane.style.display = "none";
  }

  // --- SIDEBAR RENDERING (PROJECTS/FOLDERS) ---
  function renderProjects() {
    projectList.innerHTML = "";
    if (rootNoteList) renderRootNotes();

    projectData.forEach((proj) => {
      const pid = proj.id;
      const isProjectActive = activeProjectId === pid && !activeFolderId;
      const isExpanded = expandedProjectId === pid;

      // Project row (no highlight on <li>, only inner bar)
      const li = document.createElement("li");
      li.className = "text-white bg-[#111] px-2 py-1 rounded mb-1";
      li.dataset.projectId = pid;

      // Highlight only the row (lighter grey for project)
      li.innerHTML = `
        <div class="flex justify-between items-center rounded ${
          isProjectActive ? "bg-gray-400 text-black font-semibold" : ""
        }">
          <span class="cursor-pointer font-semibold flex items-center"
            onclick="window.selectProject('${pid}')"
            style="user-select: none;">
            <i class="fas fa-chevron-${isExpanded ? "down" : "right"} mr-2 text-xs"></i>${proj.name}
          </span>
          <div class="space-x-2 text-xs flex-shrink-0">
            <i class="fas fa-plus cursor-pointer" title="Add Folder" onclick="window.addFolderToProject(event, '${pid}')"></i>
            <i class="fas fa-pen   cursor-pointer" title="Rename" onclick="window.renameProject(event,'${pid}')"></i>
            <i class="fas fa-trash cursor-pointer" title="Delete" onclick="window.deleteProject(event,'${pid}')"></i>
            <i class="fas fa-share cursor-pointer" title="Share" onclick="window.shareProject(event,'${pid}')"></i>
          </div>
        </div>
      `;

      projectList.appendChild(li);

      // Render folders if expanded
      if (isExpanded) {
        const ul = document.createElement("ul");
        ul.className = "folder-dropdown ml-4 mt-2 space-y-1";
        (folderMap[pid] || []).forEach(folder => {
          const isFolderActive = activeFolderId === folder.id && activeProjectId === pid;
          const fli = document.createElement("li");
          fli.className = "text-white bg-[#222] p-2 rounded";
          // Highlight only folder bar (darker but still clear)
          fli.innerHTML = `
            <div class="flex justify-between items-center rounded ${
              isFolderActive ? "bg-gray-600 font-semibold" : ""
            }">
              <span class="cursor-pointer font-semibold"
                onclick="window.selectFolder('${pid}','${folder.id}')">${folder.name}</span>
              <div class="space-x-2 text-xs">
                <i class="fas fa-plus cursor-pointer" title="Add Note"
                  onclick="window.addFolderNote('${pid}','${folder.id}'); event.stopPropagation();"></i>
                <i class="fas fa-pen   cursor-pointer" title="Rename"
                  onclick="window.renameFolder(event,'${pid}','${folder.id}')"></i>
                <i class="fas fa-trash cursor-pointer" title="Delete"
                  onclick="window.deleteFolder(event,'${pid}','${folder.id}')"></i>
                <i class="fas fa-share cursor-pointer" title="Share"
                  onclick="window.shareFolder(event,'${folder.id}')"></i>
              </div>
            </div>
          `;
          ul.appendChild(fli);
        });
        li.appendChild(ul);
      }
    });
  }

  // --- ADD FOLDER INLINE ---
  window.addFolderToProject = (e, pid) => {
    e.stopPropagation();
    setActiveSelection(pid, null);
    const name = prompt("Folder name:", "Untitled Folder");
    if (!name) return;
    const fid = `folder-${Date.now()}`;
    folderMap[pid].push({ id: fid, name, notes: [] });
    expandedProjectId = pid;
    renderProjects();
  };

  // --- CRUD/SHARE ---
  window.renameProject = (e, pid) => {
    e.stopPropagation();
    const proj = projectData.find(p => p.id === pid);
    if (!proj) return;
    const name = prompt("New project name:", proj.name);
    if (!name) return;
    proj.name = name;
    renderProjects();
  };

  window.deleteProject = (e, pid) => {
    e.stopPropagation();
    if (folderMap[pid]?.length) return alert("Delete folders first.");
    if (!confirm("Delete this project?")) return;
    projectData = projectData.filter(p => p.id !== pid);
    delete folderMap[pid];
    if (expandedProjectId === pid) expandedProjectId = null;
    if (activeProjectId === pid) activeProjectId = null;
    if (activeFolderId) activeFolderId = null;
    renderProjects();
    noteList.innerHTML = "";
    chatWindow.innerHTML = "";
  };

  window.shareProject = (e, pid) => {
    e.stopPropagation();
    alert(`Export project ${pid} to ZIP (placeholder).`);
  };

  window.renameFolder = (e, pid, fid) => {
    e.stopPropagation();
    const f = folderMap[pid].find((x) => x.id === fid);
    if (!f) return;
    const name = prompt("New folder name:", f.name);
    if (!name) return;
    f.name = name;
    renderProjects();
  };

  window.deleteFolder = (e, pid, fid) => {
    e.stopPropagation();
    if (!confirm("Delete this folder?")) return;
    folderMap[pid] = folderMap[pid].filter((x) => x.id !== fid);
    if (activeFolderId === fid) activeFolderId = null;
    renderProjects();
    noteList.innerHTML = "";
    chatWindow.innerHTML = "";
  };

  window.shareFolder = (e, fid) => {
    e.stopPropagation();
    alert(`Share/export folder ${fid} (placeholder).`);
  };

  // --- FOLDER NOTES ---
  window.toggleFolder = (pid, fid) => {
    middlePane.style.display = "block";
    noteList.innerHTML = "";
    // "+ New Note" button
    const newNoteBtn = document.createElement("button");
    newNoteBtn.className =
      "bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm mb-2";
    newNoteBtn.textContent = "+ New Note";
    newNoteBtn.onclick = () => window.addFolderNote(pid, fid);
    noteList.appendChild(newNoteBtn);

    // Notes in this folder
    let folder = folderMap[pid]?.find((f) => f.id === fid);
    if (!folder) return;
    folder.notes.forEach((n) => {
      const li = document.createElement("li");
      li.className =
        "bg-[#1a1a1a] text-white p-2 rounded flex justify-between items-center hover:bg-gray-700";
      li.innerHTML = `
        <span class="flex-1 cursor-pointer"
              onclick="window.loadNote('${fid}','${n.id}')">${n.title}</span>
        <div class="space-x-2 text-xs flex-shrink-0">
          <i class="fas fa-pen   cursor-pointer" title="Rename"
             onclick="window.renameNote(event,'${fid}','${n.id}')"></i>
          <i class="fas fa-trash cursor-pointer" title="Delete"
             onclick="window.deleteNote(event,'${fid}','${n.id}')"></i>
          <i class="fas fa-share cursor-pointer" title="Share"
             onclick="window.shareNote(event,'${n.id}')"></i>
        </div>
      `;
      noteList.appendChild(li);
    });
  };

  window.addFolderNote = (pid, fid) => {
    const nid = `note-${Date.now()}`;
    const title = prompt("Note title:", "Untitled Note");
    if (!title) return;
    let folder = folderMap[pid]?.find((f) => f.id === fid);
    if (!folder) return;
    folder.notes.push({ id: nid, title });
    window.toggleFolder(pid, fid);
  };

  window.loadNote = (fid, nid) => {
    currentNoteId = nid;
    chatWindow.innerHTML = `<div class="bg-[#2a2a2a] text-white p-3 rounded-lg">Opened: ${nid}</div>`;
  };

  window.renameNote = (e, fid, nid) => {
    e.stopPropagation();
    let folder = null;
    for (const pid in folderMap) {
      folder = folderMap[pid].find((f) => f.id === fid);
      if (folder) break;
    }
    if (!folder) return;
    const note = folder.notes.find((n) => n.id === nid);
    if (!note) return;
    const title = prompt("New title:", note.title);
    if (!title) return;
    note.title = title;
    window.toggleFolder(activeProjectId, fid);
  };

  window.deleteNote = (e, fid, nid) => {
    e.stopPropagation();
    let folder = null;
    for (const pid in folderMap) {
      folder = folderMap[pid].find((f) => f.id === fid);
      if (folder) break;
    }
    if (!folder) return;
    if (!confirm("Delete this note?")) return;
    folder.notes = folder.notes.filter((n) => n.id !== nid);
    window.toggleFolder(activeProjectId, fid);
  };

  window.shareNote = (e, nid) => {
    e.stopPropagation();
    alert(`Share/export note ${nid} (placeholder).`);
  };

  // --- CHAT LOGIC ---
  submitBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text || !currentNoteId) return;
    const div = document.createElement("div");
    div.className = "bg-green-700 text-white p-3 rounded-lg";
    div.textContent = text;
    chatWindow.appendChild(div);
    textInput.value = "";
  });

  // --- TEMPLATE BUILDER ---
  let currentTemplate = null;
  createTemplateBtn.addEventListener("click", () => {
    currentTemplate = {
      id: `template-${Date.now()}`,
      sections: ["Site Address", "Weather", "Equipment", "Notes"],
    };
    renderTemplate();
  });
  addSectionBtn.addEventListener("click", () => {
    const name = prompt("Section name:");
    if (name) {
      currentTemplate.sections.push(name);
      renderTemplate();
    }
  });
  function renderTemplate() {
    templateSections.innerHTML = "";
    currentTemplate.sections.forEach((s) => {
      const wrap = document.createElement("div");
      wrap.className = "flex flex-col gap-1";
      wrap.innerHTML = `
        <label class="font-semibold text-sm">${s}</label>
        <textarea rows="2"
          class="expandable-textarea w-full bg-[#1a1a1a] border border-gray-600 rounded p-2 text-white resize-none overflow-hidden"
          placeholder="Type here..."></textarea>`;
      templateSections.appendChild(wrap);
    });

    templateSections.querySelectorAll(".expandable-textarea").forEach((ta) => {
      ta.addEventListener("input", () => {
        ta.style.height = "auto";
        ta.style.height = ta.scrollHeight + "px";
      });
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    });

    templateBuilder.classList.remove("hidden");
    chatWindow.classList.add("hidden");
  }
  if (backToChatBtn) {
    backToChatBtn.addEventListener("click", () => {
      templateBuilder.classList.add("hidden");
      chatWindow.classList.remove("hidden");
    });
  }

  // --- Initial Render ---
  renderRootNotes();
  renderProjects();
});
// --- UPLOAD "+" BUTTON LOGIC ---
const chatUploadBtn = document.getElementById("chatUploadBtn");
const chatFileInput = document.getElementById("chatFileInput");

if (chatUploadBtn && chatFileInput) {
  chatUploadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    chatFileInput.click();
  });

  chatFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now just show an alert, or replace this with your file processing logic
      alert(`Selected: ${file.name}`);
      // TODO: Implement your file handling/upload logic here
    }
  });
}


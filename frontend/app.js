const userId = "demoUser123"; // temporary, later this will be dynamic
const folderList = document.getElementById("folderList");
const newFolderBtn = document.getElementById("newFolderBtn");

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

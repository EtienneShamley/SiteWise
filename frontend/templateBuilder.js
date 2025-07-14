// templateBuilder.js

document.addEventListener("DOMContentLoaded", () => {
  const createTemplateBtn = document.getElementById("createTemplateBtn");
  const chatWindow = document.getElementById("chatWindow");
  let templateBuilderArea = document.getElementById("templateBuilderArea");
  const textInput = document.getElementById("textInput");

  // Create a placeholder container if not present
  if (!templateBuilderArea) {
    templateBuilderArea = document.createElement("div");
    templateBuilderArea.id = "templateBuilderArea";
    templateBuilderArea.className = "w-full bg-[#222] rounded-lg p-6 mb-4";
    templateBuilderArea.style.display = "none";
    chatWindow.parentNode.insertBefore(templateBuilderArea, chatWindow);
  }

  // Show template builder when button is clicked
  createTemplateBtn.addEventListener("click", () => {
    chatWindow.style.display = "none";
    textInput.disabled = true;
    templateBuilderArea.style.display = "block";
    renderBlankDocument();
  });

  function renderBlankDocument() {
    // Detect current theme
    const isDark = document.documentElement.classList.contains("dark-theme");

    const tableBg = isDark ? "#222" : "#fff";
    const sectionBg = isDark ? "#232323" : "#f6f6f6";
    const textColor = isDark ? "#fff" : "#181818";
    const borderColor = isDark ? "#fff2" : "#2223";
    const headingColor = isDark ? "#ccc" : "#222";
    const lineColor = isDark ? "#fff4" : "#2225";

    templateBuilderArea.innerHTML = `
    <div class="flex mb-4" style="background:${tableBg};border-radius:10px;overflow:hidden;border:1px solid ${borderColor};">
      <div style="
        width:22%;min-width:120px;
        background:${sectionBg};
        color:${headingColor};
        padding:16px 8px;
        border-right:1.5px solid ${lineColor};
        display:flex;flex-direction:column;gap:16px;
      ">
        <div contenteditable="true" style="min-height:36px;border-bottom:1px solid ${lineColor};" placeholder="Heading"></div>
        <div contenteditable="true" style="min-height:36px;border-bottom:1px solid ${lineColor};" placeholder="Heading"></div>
        <div contenteditable="true" style="min-height:36px;" placeholder="Heading"></div>
      </div>
      <div style="
        width:78%;
        background:${tableBg};
        color:${textColor};
        padding:16px 12px;
        display:flex;flex-direction:column;gap:16px;
      ">
        <div contenteditable="true" style="min-height:36px;border-bottom:1px solid ${lineColor};" placeholder="Enter text..."></div>
        <div contenteditable="true" style="min-height:36px;border-bottom:1px solid ${lineColor};" placeholder="Enter text..."></div>
        <div contenteditable="true" style="min-height:36px;" placeholder="Enter text..."></div>
      </div>
    </div>
    <button id="closeTemplateBuilder" class="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-xs text-white">Close</button>
  `;
    document.getElementById("closeTemplateBuilder").onclick = () => {
      templateBuilderArea.style.display = "none";
      chatWindow.style.display = "block";
      textInput.disabled = false;
    };
  }
});

// themeToggle.js
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  function applyTheme(theme) {
    document.documentElement.classList.remove("dark-theme", "light-theme");
    document.documentElement.classList.add(theme);
    if (themeToggleBtn) {
      themeToggleBtn.textContent = theme === "dark-theme" ? "🌙" : "☀️";
    }
  }

  // Load saved theme, default to dark
  const savedTheme = localStorage.getItem("sitewise-theme") || "dark-theme";
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.classList.contains("dark-theme") ? "dark-theme" : "light-theme";
      const nextTheme = currentTheme === "dark-theme" ? "light-theme" : "dark-theme";
      applyTheme(nextTheme);
      localStorage.setItem("sitewise-theme", nextTheme);
    });
  }
});

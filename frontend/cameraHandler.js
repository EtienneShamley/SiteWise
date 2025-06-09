const cameraInput = document.getElementById("cameraInput");

cameraInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log("📸 Image captured from camera:", file);

  // Optional preview logic (if needed later)
  // const reader = new FileReader();
  // reader.onload = function(e) {
  //   const img = document.createElement("img");
  //   img.src = e.target.result;
  //   img.className = "w-32 rounded border border-gray-500 mt-2";
  //   document.getElementById("chatWindow").appendChild(img);
  // };
  // reader.readAsDataURL(file);
});

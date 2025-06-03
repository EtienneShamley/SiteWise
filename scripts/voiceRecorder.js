let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("micBtn");

recordBtn.addEventListener("click", async () => {
  try {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = []; // Clear previous chunks

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" }); // Store as Blob
        console.log("🎤 Audio recorded:", audioBlob); // Log Blob

        // Future: Send audioBlob to OpenAI Whisper API here
      };

      mediaRecorder.start(); // Start recording
      recordBtn.classList.add("text-red-500"); // Highlight icon
    } else {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      mediaRecorder.stop();
      recordBtn.classList.remove("text-red-500");
    }
  } catch (err) {
    console.error("Error accessing microphone:", err);
  }
});

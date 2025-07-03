let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("micBtn");

recordBtn.addEventListener("click", async () => {
  try {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        console.log("🎤 Audio recorded:", audioBlob);
        // Future: send to OpenAI Whisper
      };

      mediaRecorder.start();
      recordBtn.classList.add("text-red-500");
    } else {
      mediaRecorder.stop();
      recordBtn.classList.remove("text-red-500");
    }
  } catch (err) {
    console.error("Error accessing microphone:", err);
  }
});

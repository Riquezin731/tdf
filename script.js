]const button = document.getElementById("activate");
const audio = document.getElementById("rage-sound");

button.addEventListener("click", () => {
  document.body.classList.toggle("rage-mode");

  if (document.body.classList.contains("rage-mode")) {
    audio.currentTime = 0;
    audio.play();
    button.textContent = "DESATIVAR RAGE";
  } else {
    audio.pause();
    button.textContent = "ATIVAR MODO RAGE";
  }
});

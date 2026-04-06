const photoInput = document.getElementById("photoInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const preview = document.getElementById("preview");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

analyzeBtn.addEventListener("click", async () => {
  const file = photoInput.files[0];

  if (!file) {
    statusBox.textContent = "Merci de sélectionner une image.";
    return;
  }

  statusBox.textContent = "Analyse en cours...";
  resultBox.textContent = "";

  const formData = new FormData();
  formData.append("photo", file);

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur inconnue.");
    }

    statusBox.textContent = "Analyse terminée.";
    resultBox.textContent = data.result;
  } catch (error) {
    statusBox.textContent = "Une erreur est survenue.";
    resultBox.textContent = error.message;
  }
});

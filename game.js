const role = localStorage.getItem("userRole");
if (role === "profesor") {
  window.location.href = "panel.html";
}

const itemsData = [
  { emoji: "🍌", type: "organico" },
  { emoji: "🍕", type: "organico" },
  { emoji: "🧴", type: "reciclable" },
  { emoji: "📦", type: "reciclable" },
  { emoji: "🗑️", type: "no-reciclable" },
  { emoji: "🛢️", type: "no-reciclable" },
  { emoji: "🍎", type: "organico" },
  { emoji: "🥤", type: "reciclable" },
  { emoji: "🚬", type: "no-reciclable" },
  { emoji: "🥡", type: "reciclable" }
];

let score = 0;
let errores = 0;
let lives = 3;
let tiempo = 0;
let cronometro;

const username = document.getElementById("username");
const avatar = document.getElementById("avatar");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const itemsContainer = document.getElementById("items");
const feedback = document.getElementById("feedback");
const bins = document.querySelectorAll(".bin");

const erroresDisplay = document.createElement("div");
erroresDisplay.id = "errores";
erroresDisplay.style.fontWeight = "bold";
erroresDisplay.style.marginTop = "1rem";
erroresDisplay.style.color = "#d32f2f";
erroresDisplay.textContent = "❌ Errores: 0";
feedback.insertAdjacentElement("afterend", erroresDisplay);

username.textContent = localStorage.getItem("heroName") || "Héroe";
avatar.src = localStorage.getItem("heroAvatar") || "assets/1.png";

cronometro = setInterval(() => tiempo++, 1000);

// Crear ítems en pantalla
itemsData.forEach((item, index) => {
  const div = document.createElement("div");
  div.className = "item";
  div.textContent = item.emoji;
  div.draggable = true;
  div.dataset.type = item.type;
  div.id = `item-${index}`;
  div.addEventListener("dragstart", e =>
    e.dataTransfer.setData("text/plain", div.id)
  );
  itemsContainer.appendChild(div);
});

bins.forEach(bin => {
  bin.addEventListener("dragover", e => e.preventDefault());
  bin.addEventListener("drop", e => {
    const itemId = e.dataTransfer.getData("text/plain");
    const item = document.getElementById(itemId);
    if (!item || !item.draggable) return;

    if (item.dataset.type === bin.dataset.type) {
      bin.appendChild(item);
      item.draggable = false;
      score++;
      feedback.textContent = "¡Correcto! 🌟";
      feedback.style.color = "#2e7d32";
    } else {
      errores++;
      lives--;
      livesDisplay.textContent = "❤️".repeat(lives);
      erroresDisplay.textContent = `❌ Errores: ${errores}`;
      feedback.textContent = "Ups, intenta de nuevo 😬";
      feedback.style.color = "#d32f2f";
    }

    const puntos = Math.max(0, (score * 10) - (errores * 5));
    scoreDisplay.textContent = `Puntos: ${puntos}`;

    if (lives === 0 || score === 10) {
      finalizarPartida();
    }
  });
});

function finalizarPartida() {
  clearInterval(cronometro);
  document.querySelectorAll(".item").forEach(i => i.draggable = false);

  const puntos = Math.max(0, (score * 10) - (errores * 5));

  feedback.innerHTML =
    score === 10
      ? `🎉 ¡Has ganado ${puntos} puntos!<br>¡Eres un verdadero EcoHéroe!<br><a href="panel.html">Ver resultados</a>`
      : `😢 Se acabaron tus vidas o tus intentos.<br>Tu puntuación fue de <strong>${puntos}</strong>.<br><a href="index.html">Volver a intentar</a>`;

  const usuarioId = Number(localStorage.getItem("usuarioId"));
  if (!usuarioId || isNaN(usuarioId)) {
    console.warn("⚠️ usuarioId no válido. No se enviaron resultados.");
    return;
  }

  const resultados = {
    aciertos: score,
    errores,
    puntos,
    tiempo_segundos: tiempo
  };

  console.log("📤 Enviando resultados:", resultados);

  fetch(`http://localhost:5000/api/users/${usuarioId}/resultados`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resultados)
  })
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => console.log("✅ Resultados enviados correctamente:", data))
    .catch(err => console.error("❌ Error al enviar resultados:", err));
}

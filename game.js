const role = localStorage.getItem("userRole");
if (role === "profesor") {
  window.location.href = "panel.html";
}

const nivelActual = parseInt(localStorage.getItem("nivelActual")) || 1;

function obtenerItemsPorNivel(nivel) {
  const niveles = {
    1: [
      { emoji: "🍌", type: "organico" },
      { emoji: "🍕", type: "organico" },
      { emoji: "📦", type: "reciclable" },
      { emoji: "🧴", type: "reciclable" },
      { emoji: "🗑️", type: "no-reciclable" }
    ],
    2: [
      { emoji: "🍎", type: "organico" },
      { emoji: "🧅", type: "organico" },
      { emoji: "🥫", type: "reciclable" },
      { emoji: "🧃", type: "reciclable" },
      { emoji: "🧠", type: "no-reciclable" }
    ],
    3: [
      { emoji: "🥩", type: "organico" },
      { emoji: "🍗", type: "organico" },
      { emoji: "🧻", type: "reciclable" },
      { emoji: "📌", type: "reciclable" },
      { emoji: "🚬", type: "no-reciclable" }
    ],
    4: [
      { emoji: "🍞", type: "organico" },
      { emoji: "🍧", type: "organico" },
      { emoji: "🧹", type: "reciclable" },
      { emoji: "🧺", type: "reciclable" },
      { emoji: "🪲", type: "no-reciclable" }
    ],
    5: [
      { emoji: "🥕", type: "organico" },
      { emoji: "🌮", type: "organico" },
      { emoji: "🪫", type: "reciclable" },
      { emoji: "🧃", type: "reciclable" },
      { emoji: "💊", type: "no-reciclable" }
    ],
    6: [
      { emoji: "🍍", type: "organico" },
      { emoji: "🍓", type: "organico" },
      { emoji: "🥤", type: "reciclable" },
      { emoji: "📰", type: "reciclable" },
      { emoji: "🫸", type: "no-reciclable" }
    ],
    7: [
      { emoji: "🥑", type: "organico" },
      { emoji: "🥚", type: "organico" },
      { emoji: "🚢", type: "reciclable" },
      { emoji: "📚", type: "reciclable" },
      { emoji: "🦠", type: "no-reciclable" }
    ],
    8: [
      { emoji: "🍉", type: "organico" },
      { emoji: "🍈", type: "organico" },
      { emoji: "📄", type: "reciclable" },
      { emoji: "🧼", type: "reciclable" },
      { emoji: "🧪", type: "no-reciclable" }
    ],
    9: [
      { emoji: "🥬", type: "organico" },
      { emoji: "🍠", type: "organico" },
      { emoji: "🔋", type: "reciclable" },
      { emoji: "🧊", type: "reciclable" },
      { emoji: "🫲", type: "no-reciclable" }
    ],
    10: [
      { emoji: "🍇", type: "organico" },
      { emoji: "🍒", type: "organico" },
      { emoji: "🔇", type: "reciclable" },
      { emoji: "📦", type: "reciclable" },
      { emoji: "🫿", type: "no-reciclable" }
    ]
  };

  return niveles[nivel] || niveles[1];
}

const itemsData = obtenerItemsPorNivel(nivelActual);

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

livesDisplay.textContent = "❤️".repeat(lives);

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

    const puntosBase = (score / itemsData.length) * 100;
    const puntos = Math.max(0, Math.round(puntosBase - (errores * 5)));
    scoreDisplay.textContent = `Puntos: ${puntos}`;

    if (lives === 0 || score === itemsData.length) {
      finalizarPartida(puntos);
    }
  });
});

function finalizarPartida(puntos) {
  clearInterval(cronometro);
  document.querySelectorAll(".item").forEach(i => i.draggable = false);

  const nivel = nivelActual;
  const usuarioId = Number(localStorage.getItem("usuarioId"));
  if (!usuarioId || isNaN(usuarioId)) {
    console.warn("⚠️ usuarioId no válido. No se enviaron resultados.");
    return;
  }

  const resultados = {
    aciertos: score,
    errores,
    puntos,
    tiempo_segundos: tiempo,
    nivel
  };

  fetch(`http://localhost:5000/api/users/${usuarioId}/resultados`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resultados)
  })
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (score === itemsData.length) {
        const siguienteNivel = nivelActual + 1;
        if (siguienteNivel <= 10) {
          localStorage.setItem("nivelActual", siguienteNivel);
          feedback.innerHTML = `🎉 ¡Has ganado ${puntos} puntos!<br>Pasando al nivel ${siguienteNivel}...`;
          setTimeout(() => location.reload(), 2500);
        } else {
          feedback.innerHTML = `🏆 ¡Completaste todos los niveles!<br><a href='panel.html'>Ver resultados</a>`;
        }
      } else {
        feedback.innerHTML = `😥 Se acabaron tus vidas o tus intentos.<br>Tu puntuación fue de <strong>${puntos}</strong>.<br><a href='index.html'>Volver a intentar</a>`;
      }
    })
    .catch(err => {
      console.error("❌ Error al enviar resultados:", err);
      feedback.innerHTML = `⚠️ Error al guardar resultados.<br>Tu puntuación fue de <strong>${puntos}</strong>.`;
    });
}

const canvas = document.getElementById("constellation");
const ctx = canvas.getContext("2d");
const photoWrapper = document.getElementById("photoWrapper");
const img = document.getElementById("mainImage");

let particles = [];
let touch = { x: null, y: null, active: false };
let currentMode = "space"; // Режимы: 'space' или 'water'
const dpr = window.devicePixelRatio || 1;

// Контент для разных миров
const content = {
  space: {
    image: "Imany.jpg", // Твое первое фото
    colors: ["#82b4ff", "#c882ff", "#82fff0"],
    bg: "#000000",
  },
  water: {
    image: "water_photo.png", // ЗАМЕНИ на имя второго файла (фото или видео)
    colors: ["#0051ff", "#00d4ff", "#ffffff"],
    bg: "#001e3c",
  },
};

const config = {
  starsCount: 120,
  connectionDist: 90,
  lensPower: 1.15,
};

function init() {
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  particles = [];
  for (let i = 0; i < config.starsCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.3,
    });
  }
}

function draw() {
  // В режиме воды шлейф длиннее (0.15), в космосе короче (0.08)
  ctx.fillStyle =
    currentMode === "water" ? "rgba(0, 20, 60, 0.15)" : "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const colors = content[currentMode].colors;

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

    if (touch.active) {
      let dx = touch.x - p.x;
      let dy = touch.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        // В воде частицы убегают, в космосе тянутся
        let factor = currentMode === "water" ? -0.03 : 0.02;
        p.x += dx * factor;
        p.y += dy * factor;
      }
    }

    const color = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(
      p.x,
      p.y,
      currentMode === "water" ? p.size * 2 : p.size,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Линии созвездий только в режиме космоса
    if (currentMode === "space") {
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let distL = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        if (distL < config.connectionDist) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.2 * (1 - distL / config.connectionDist);
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    }
  });
  requestAnimationFrame(draw);
}

function switchWorld() {
  currentMode = currentMode === "space" ? "water" : "space";

  img.style.opacity = "0"; // Гасим старое

  setTimeout(() => {
    img.src = content[currentMode].image;
    photoWrapper.style.backgroundColor = content[currentMode].bg;

    if (currentMode === "water") {
      img.style.filter = "url(#water-ripple) brightness(0.6) saturate(1.4)";
    } else {
      img.style.filter = "brightness(0.7) contrast(1.1)";
    }

    // Гарантируем появление после смены src
    img.onload = () => {
      img.style.opacity = "1";
    };
    // Если фото уже было в кэше и onload не сработает:
    if (img.complete) img.style.opacity = "1";
  }, 500);
}

function handleAction(e) {
  if (e.cancelable) e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  touch.x = clientX;
  touch.y = clientY;
  touch.active = true;

  if (img && img.style.opacity !== "0") {
    const xPct = (clientX / window.innerWidth) * 100;
    const yPct = (clientY / window.innerHeight) * 100;

    if (currentMode === "water") {
      // "Расталкиваем" воду под пальцем
      img.style.webkitMaskImage = `radial-gradient(circle 120px at ${xPct}% ${yPct}%, black 0%, transparent 80%)`;
      img.style.maskImage = `radial-gradient(circle 120px at ${xPct}% ${yPct}%, black 0%, transparent 80%)`;
    } else {
      // Гравитационная линза
      img.style.transformOrigin = `${xPct}% ${yPct}%`;
      img.style.transform = `scale(${config.lensPower})`;
    }
  }
}

function handleEnd() {
  touch.active = false;
  if (img) {
    img.style.transform = "scale(1)";
    img.style.webkitMaskImage = "none";
    img.style.maskImage = "none";
  }
}

// Слушатели
window.addEventListener("mousedown", handleAction);
window.addEventListener("mousemove", handleAction);
window.addEventListener("mouseup", handleEnd);
window.addEventListener("touchstart", handleAction, { passive: false });
window.addEventListener("touchmove", handleAction, { passive: false });
window.addEventListener("touchend", handleEnd);

// Переключение мира по двойному клику
window.addEventListener("dblclick", switchWorld);

window.addEventListener("resize", init);
init();
draw();

window.addEventListener("load", () => {
  photoWrapper.classList.add("loaded");
  img.style.opacity = "1"; // Принудительно показываем первое фото
});

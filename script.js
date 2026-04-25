const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const photoWrapper = document.getElementById('photoWrapper');
const img = document.querySelector('.photo-wrapper img');

let particles = [];
let touch = { x: null, y: null, active: false };
const dpr = window.devicePixelRatio || 1;

const config = {
    starsCount: 120,
    connectionDist: 90,
    colors: ['#82b4ff', '#c882ff', '#82fff0'],
    lensPower: 1.15
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
            color: config.colors[Math.floor(Math.random() * config.colors.length)]
        });
    }
}

function draw() {
    // Эффект шлейфа (Северное сияние)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

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
                p.x += dx * 0.02;
                p.y += dy * 0.02;
            }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let distL = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
            if (distL < config.connectionDist) {
                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = 0.2 * (1 - distL / config.connectionDist);
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }
        }
    });
    requestAnimationFrame(draw);
}

// Универсальный обработчик (мобилки + ПК)
function handleAction(e) {
    // Останавливаем стандартное поведение браузера (скролл)
    if (e.cancelable) e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    touch.x = clientX;
    touch.y = clientY;
    touch.active = true;

    if (img) {
        const xPct = (clientX / window.innerWidth) * 100;
        const yPct = (clientY / window.innerHeight) * 100;
        img.style.transformOrigin = `${xPct}% ${yPct}%`;
        img.style.transform = `scale(${config.lensPower})`;
        img.style.filter = 'brightness(0.9) contrast(1.2)';
    }
}

function handleEnd() {
    touch.active = false;
    if (img) {
        img.style.transform = 'scale(1)';
        img.style.filter = 'brightness(0.7) contrast(1.1)';
    }
}

// Слушаем всё: и мышь, и касания
window.addEventListener('mousedown', handleAction);
window.addEventListener('mousemove', handleAction);
window.addEventListener('mouseup', handleEnd);

window.addEventListener('touchstart', handleAction, { passive: false });
window.addEventListener('touchmove', handleAction, { passive: false });
window.addEventListener('touchend', handleEnd);

if (img.complete) photoWrapper.classList.add('loaded');
else img.onload = () => photoWrapper.classList.add('loaded');

window.addEventListener('resize', init);
init();
draw();
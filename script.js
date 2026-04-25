const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const photoWrapper = document.getElementById('photoWrapper');
const img = document.querySelector('.photo-wrapper img');

let particles = [];
let touch = { x: null, y: null, active: false };
const dpr = window.devicePixelRatio || 1;

const config = {
    starsCount: 140,
    connectionDist: 100,
    colors: ['#82b4ff', '#c882ff', '#82fff0'], // Цвета для сияния
    lensPower: 1.1 // Сила увеличения линзы
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
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            size: Math.random() * 1.5 + 0.3,
            color: config.colors[Math.floor(Math.random() * config.colors.length)]
        });
    }
}

function draw() {
    // Вместо очистки рисуем слой с прозрачностью 0.05 для эффекта шлейфа
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
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
                p.x += dx * 0.015;
                p.y += dy * 0.015;
            }
        }

        // Рисуем цветные светящиеся звезды
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let distLines = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
            if (distLines < config.connectionDist) {
                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = 0.2 * (1 - distLines / config.connectionDist);
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

// Эффект гравитационной линзы (искажение фото)
function handleMove(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    
    touch.x = x;
    touch.y = y;
    touch.active = true;

    if (img) {
        // Вычисляем точку фокуса в процентах
        const xPct = (x / window.innerWidth) * 100;
        const yPct = (y / window.innerHeight) * 100;
        
        // Смещаем центр трансформации под палец
        img.style.transformOrigin = `${xPct}% ${yPct}%`;
        img.style.transform = `scale(${config.lensPower})`;
        img.style.filter = 'brightness(0.85) contrast(1.2)';
    }
}

function handleEnd() {
    touch.active = false;
    if (img) {
        img.style.transform = 'scale(1)';
        img.style.filter = 'brightness(0.7) contrast(1.1)';
    }
}

window.addEventListener('mousemove', handleMove);
window.addEventListener('touchstart', handleMove);
window.addEventListener('touchmove', handleMove);
window.addEventListener('touchend', handleEnd);
window.addEventListener('mouseleave', handleEnd);

if (img.complete) photoWrapper.classList.add('loaded');
else img.onload = () => photoWrapper.classList.add('loaded');

window.addEventListener('resize', init);
init();
draw();
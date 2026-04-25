const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const photoWrapper = document.getElementById('photoWrapper');
const img = document.querySelector('.photo-wrapper img');

let particles = [];
let touch = { x: null, y: null, active: false };
let tilt = { x: 0, y: 0 }; 
const dpr = window.devicePixelRatio || 1;

// Конфигурация системы
const config = {
    starsCount: 150,       // Количество звезд
    connectionDist: 100,   // Дистанция линий созвездий
    gravityRadius: 150,    // Радиус притяжения к пальцу
    pulseSpeed: 0.02       // Скорость мерцания
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
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 1.3 + 0.2,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p, i) => {
        // 1. Движение и мерцание
        p.phase += config.pulseSpeed;
        const opacity = 0.4 + Math.sin(p.phase) * 0.4;

        p.x += p.vx;
        p.y += p.vy;

        // Отскок от краев
        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        // 2. Взаимодействие с касанием
        if (touch.active) {
            let dx = touch.x - p.x;
            let dy = touch.y - p.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < config.gravityRadius) {
                p.x += dx * 0.03;
                p.y += dy * 0.03;
            }
        }

        // Применяем легкий параллакс от наклона/движения
        const renderX = p.x + (tilt.x * 20);
        const renderY = p.y + (tilt.y * 20);

        // 3. Отрисовка звезды
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // 4. Отрисовка линий созвездий
        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            const rX2 = p2.x + (tilt.x * 20);
            const rY2 = p2.y + (tilt.y * 20);
            
            let dxL = renderX - rX2;
            let dyL = renderY - rY2;
            let distL = Math.sqrt(dxL * dxL + dyL * dyL);

            if (distL < config.connectionDist) {
                ctx.beginPath();
                const lineAlpha = (1 - distL / config.connectionDist) * 0.3 * opacity;
                ctx.strokeStyle = `rgba(150, 200, 255, ${lineAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(renderX, renderY);
                ctx.lineTo(rX2, rY2);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(draw);
}

// Управление событиями и визуальными эффектами фото
const handleInteraction = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    touch.x = x;
    touch.y = y;
    touch.active = true;

    // Параллакс эффект
    tilt.x = (x / window.innerWidth) - 0.5;
    tilt.y = (y / window.innerHeight) - 0.5;

    // "Проявляем" фото при касании
    if (img) {
        img.style.filter = 'brightness(0.85) contrast(1.1) saturate(1.1)';
    }
};

const stopInteraction = () => {
    touch.active = false;
    if (img) {
        img.style.filter = 'brightness(0.65) contrast(1.1) saturate(1)';
    }
};

// Слушатели событий
window.addEventListener('mousemove', handleInteraction);
window.addEventListener('touchstart', handleInteraction);
window.addEventListener('touchmove', handleInteraction);
window.addEventListener('touchend', stopInteraction);
window.addEventListener('mouseleave', stopInteraction);

// Инициализация при загрузке фото
if (img.complete) {
    photoWrapper.classList.add('loaded');
} else {
    img.onload = () => photoWrapper.classList.add('loaded');
}

window.addEventListener('resize', init);

init();
draw();
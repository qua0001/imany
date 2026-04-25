const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const photoWrapper = document.getElementById('photoWrapper');
const img = document.querySelector('.photo-wrapper img');

let particles = [];
let touch = { x: null, y: null };
let tilt = { x: 0, y: 0 }; // Для эффекта параллакса
const dpr = window.devicePixelRatio || 1;

// Настройки системы
const config = {
    mainStarsCount: 80,
    dustCount: 150,
    connectionDist: 100,
    gravityRadius: 150
};

function init() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    
    particles = [];

    // Создаем основные звезды (созвездия)
    for (let i = 0; i < config.mainStarsCount; i++) {
        particles.push(createParticle(true));
    }
    // Создаем звездную пыль (глубина)
    for (let i = 0; i < config.dustCount; i++) {
        particles.push(createParticle(false));
    }
}

function createParticle(isMain) {
    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * (isMain ? 0.2 : 0.1),
        vy: (Math.random() - 0.5) * (isMain ? 0.2 : 0.1),
        size: isMain ? Math.random() * 1.5 + 0.5 : Math.random() * 0.4,
        isMain: isMain,
        // Индивидуальный коэффициент параллакса для глубины
        parallaxMult: isMain ? 1.5 : 0.5 
    };
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Плавное возвращение наклона в ноль
    tilt.x *= 0.95;
    tilt.y *= 0.95;

    particles.forEach((p, i) => {
        // Движение
        p.x += p.vx;
        p.y += p.vy;

        // Отскок от краев
        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        // Интерактив с касанием (притяжение)
        if (touch.x !== null) {
            let dx = touch.x - p.x;
            let dy = touch.y - p.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < config.gravityRadius) {
                p.x += dx * 0.01;
                p.y += dy * 0.01;
            }
        }

        // Финальные координаты с учетом параллакса
        const renderX = p.x + (tilt.x * p.parallaxMult * 20);
        const renderY = p.y + (tilt.y * p.parallaxMult * 20);

        // Рисуем точку
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.isMain ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // Рисуем связи только для главных звезд
        if (p.isMain) {
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                if (p2.isMain) {
                    const rX2 = p2.x + (tilt.x * p2.parallaxMult * 20);
                    const rY2 = p2.y + (tilt.y * p2.parallaxMult * 20);
                    
                    let dxL = renderX - rX2;
                    let dyL = renderY - rY2;
                    let distLines = Math.sqrt(dxL * dxL + dyL * dyL);

                    if (distLines < config.connectionDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(140, 190, 255, ${0.3 * (1 - distLines / config.connectionDist)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(renderX, renderY);
                        ctx.lineTo(rX2, rY2);
                        ctx.stroke();
                    }
                }
            }
        }
    });

    requestAnimationFrame(draw);
}

// Обработка появления фото
if (img.complete) {
    photoWrapper.classList.add('loaded');
} else {
    img.onload = () => photoWrapper.classList.add('loaded');
}

// Слушатели событий
window.addEventListener('touchstart', e => { 
    touch.x = e.touches[0].clientX; 
    touch.y = e.touches[0].clientY; 
});

window.addEventListener('touchmove', e => { 
    touch.x = e.touches[0].clientX; 
    touch.y = e.touches[0].clientY;
    // Параллакс от движения пальца
    tilt.x = (e.touches[0].clientX / window.innerWidth) - 0.5;
    tilt.y = (e.touches[0].clientY / window.innerHeight) - 0.5;
});

window.addEventListener('touchend', () => { 
    touch.x = null; 
});

// Для десктопной проверки (мышь)
window.addEventListener('mousemove', e => {
    tilt.x = (e.clientX / window.innerWidth) - 0.5;
    tilt.y = (e.clientY / window.innerHeight) - 0.5;
});

init();
draw();
window.addEventListener('resize', init);
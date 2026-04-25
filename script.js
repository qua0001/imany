const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const photoWrapper = document.getElementById('photoWrapper');

let particles = [];
let touch = { x: null, y: null };
const dpr = window.devicePixelRatio || 1; // Коэффициент для четкости

function init() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr); // Устанавливаем масштаб под Retina/HighDPI
    
    particles = [];
    // Делаем звезды мелкими, как пыль
    for (let i = 0; i < 130; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.3, // Медленное движение
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 1.3 + 0.3
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Отскок от границ экрана
        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        // Эффект притяжения/отталкивания при касании
        if (touch.x !== null) {
            let dx = touch.x - p.x;
            let dy = touch.y - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 120) {
                // Звезды немного тянутся к пальцу
                p.x += dx * 0.01;
                p.y += dy * 0.01;
            }
        }

        // Отрисовка самой звезды (как светящейся точки)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Ярко-белый
        ctx.fill();

        // Отрисовка связей (линий)
        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let distLines = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
            if (distLines < 90) {
                ctx.beginPath();
                // Тонкие, чуть голубоватые нити
                ctx.strokeStyle = `rgba(130, 180, 255, ${0.4 * (1 - distLines/90)})`;
                ctx.lineWidth = 0.5; 
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(draw);
}

// Запускаем плавное появление фото через CSS, когда JS готов
window.addEventListener('load', () => {
    photoWrapper.classList.add('loaded');
});

// Управление касанием для мобилок
window.addEventListener('touchstart', e => { touch.x = e.touches[0].clientX; touch.y = e.touches[0].clientY; });
window.addEventListener('touchmove', e => { touch.x = e.touches[0].clientX; touch.y = e.touches[0].clientY; });
window.addEventListener('touchend', () => { touch.x = null; });

init();
draw();
window.addEventListener('resize', init);
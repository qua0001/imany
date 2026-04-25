const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');

let particles = [];
const mouse = { x: null, y: null, radius: 150 };

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    // Делаем много мелких звезд
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 1.5 + 0.5
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Отскок
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Отрисовка звезды
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        // Связи
        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dx = p.x - p2.x;
            let dy = p.y - p2.y;
            let dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(100, 150, 255, ${1 - dist/100})`; // Голубоватый оттенок
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(draw);
}

// Управление на мобилке
window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    
    // При касании частицы немного разлетаются или ускоряются
    particles.forEach(p => {
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < mouse.radius) {
            p.x -= dx * 0.02;
            p.y -= dy * 0.02;
        }
    });
});

window.addEventListener('resize', init);
init();
draw();
const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const img = document.getElementById('source-photo');

let particles = [];
let touch = { x: null, y: null };
const dpr = window.devicePixelRatio || 1;

function init() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    
    particles = [];
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 1.2 + 0.5
        });
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.save();
    
    ctx.beginPath();
    if (touch.x !== null) {
        let gradient = ctx.createRadialGradient(touch.x, touch.y, 0, touch.x, touch.y, 150);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.arc(touch.x, touch.y, 150, 0, Math.PI * 2);
        ctx.fill();
    }
    
    particles.forEach(p => {
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
    });
    ctx.clip();

    const aspect = img.width / img.height;
    let drawW = window.innerWidth;
    let drawH = window.innerWidth / aspect;
    if (drawH < window.innerHeight) {
        drawH = window.innerHeight;
        drawW = window.innerHeight * aspect;
    }
    ctx.drawImage(img, (window.innerWidth - drawW)/2, (window.innerHeight - drawH)/2, drawW, drawH);
    ctx.restore();

    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(150, 200, 255, ${0.4 * (1 - dist/100)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(draw);
}

const updateTouch = (e) => {
    touch.x = e.touches[0].clientX;
    touch.y = e.touches[0].clientY;
};
window.addEventListener('touchstart', updateTouch);
window.addEventListener('touchmove', updateTouch);
window.addEventListener('touchend', () => { touch.x = null; });

window.addEventListener('resize', init);
img.onload = () => {
    init();
    draw();
};
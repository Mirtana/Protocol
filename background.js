const canvas = document.getElementById('circuitCanvas');
const ctx = canvas.getContext('2d');

let width, height, particles = [];
let mouse = { x: null, y: null, radius: 200 };

const SETTINGS = {
    particleCount: 80,    // Теперь можно больше, так как код стал легче
    particleSize: 2,
    speed: 0.3,
    
};

function setCanvasSize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Разная скорость для эффекта параллакса (глубины)
        this.z = Math.random() * 1 + 0.2; 
        this.vx = (Math.random() - 0.5) * SETTINGS.speed * this.z;
        this.vy = (Math.random() - 0.5) * SETTINGS.speed * this.z;
        this.radius = Math.random() * SETTINGS.particleSize * this.z;
        this.alpha = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Бесконечный цикл (вылетают с другой стороны)
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Взаимодействие с мышью
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < mouse.radius) {
                // Рисуем линию только если мышь рядом (очень быстро для процессора)
                let opacity = 1 - (dist / mouse.radius);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 242, 255, ${opacity * 0.4})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
                
                // Легкое притяжение
                this.x += dx * 0.002;
                this.y += dy * 0.002;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 255, ${this.alpha})`;
        ctx.shadowBlur = this.z * 5; // Небольшое свечение для "дальних" точек
        ctx.shadowColor = SETTINGS.color;
        ctx.fill();
    }
}

function init() {
    setCanvasSize();
    particles = [];
    for (let i = 0; i < SETTINGS.particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    // Делаем фон чуть прозрачным при очистке, чтобы оставался легкий шлейф (Motion Blur)
    ctx.fillStyle = 'rgba(9, 10, 14, 0.2)'; 
    ctx.fillRect(0, 0, width, height);
    
    // Убираем тень для линий, чтобы не тормозило
    ctx.shadowBlur = 0;

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('resize', init);

init();
animate();
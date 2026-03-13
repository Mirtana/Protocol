const canvas = document.getElementById('circuitCanvas');
const ctx = canvas.getContext('2d');

let width, height, particles = [];
let mouse = { x: null, y: null, radius: 150 };

const SETTINGS = {
    particleCount: 50,    // Количество узлов (не делай больше 120 для скорости)
    maxDistance: 160,    // Расстояние, при котором появляется связь
    particleSize: 1.5,   // Размер точки
    lineOpacity: 0.25,   // Максимальная яркость линий
    speed: 0.3           // Скорость движения
};

function setCanvasSize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * SETTINGS.speed;
        this.vy = (Math.random() - 0.5) * SETTINGS.speed;
        this.radius = Math.random() * SETTINGS.particleSize + 1;
    }

    update() {
        // Движение
        this.x += this.vx;
        this.y += this.vy;

        // Отскок от краев экрана
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Взаимодействие с мышью (легкое притяжение)
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                this.x += dx * 0.0015;
                this.y += dy * 0.0015;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2ff';
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
    ctx.clearRect(0, 0, width, height);
    // Глубокий темный фон (можно задать в CSS, но здесь для надежности)
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Связи между узлами
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < SETTINGS.maxDistance) {
                // Чем ближе точки, тем ярче линия
                let opacity = 1 - (distance / SETTINGS.maxDistance);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 242, 255, ${opacity * SETTINGS.lineOpacity})`;
                ctx.lineWidth = 0.8;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
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
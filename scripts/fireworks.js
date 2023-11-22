window.addEventListener("resize", resizecanvasFire, false);
window.addEventListener("DOMContentLoaded", onLoad, false);

window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };

var ctxFire, w, h, particles = [], probability = 0.04, xPoint, yPoint;

function onLoad() {
    canvasFire = document.getElementById("firework-canvas");
    ctxFire = canvasFire.getContext("2d");

    canvasFire.style.display = "none";

    resizecanvasFire();

    window.requestAnimationFrame(updateWorld);
}

function resizecanvasFire() {
    if (canvasFire) {
        w = canvasFire.width = window.innerWidth;
        h = canvasFire.height = window.innerHeight;
    }
}

function updateWorld() {
    update();
    paint();
    window.requestAnimationFrame(updateWorld);
}

function update() {
    if (!fireworksOn) {
        canvasFire.style.display = "none";
        return;
    }
    canvasFire.style.display = "block";
    if (particles.length < 500 && Math.random() < probability && fireworksOn) {
        createFirework();
    }
    var alive = [];
    for (var i = 0; i < particles.length; i++) {
        if (particles[i].move()) {
            alive.push(particles[i]);
        }
    }
    particles = alive;
}

function paint() {
    ctxFire.globalCompositeOperation = 'source-over';
    var grd = ctxFire.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#0a1330");
    grd.addColorStop(1, "#372b10");
    ctxFire.fillStyle = grd;
    ctxFire.fillRect(0, 0, w, h);
    ctxFire.globalCompositeOperation = 'lighter';
    for (var i = 0; i < particles.length; i++) {
        particles[i].draw(ctxFire);
    }
}

function createFirework() {
    xPoint = Math.random() * (w - 200) + 100;
    yPoint = Math.random() * (h - 200) + 100;
    var nFire = Math.random() * 50 + 100;
    /*var c = "rgb(" + (~~(Math.random() * 200 + 55)) + ","
        + (~~(Math.random() * 200 + 55)) + "," + (~~(Math.random() * 200 + 55)) + ")";*/
    var c = primaryColors[parseInt(teamTheme)];
    if (Math.random() > 0.5) {
        c = secondaryColors[parseInt(teamTheme)];
    }
    for (var i = 0; i < nFire; i++) {
        var particle = new Particle();
        particle.color = c;
        var vy = Math.sqrt(25 - particle.vx * particle.vx);
        if (Math.abs(particle.vy) > vy) {
            particle.vy = particle.vy > 0 ? vy : -vy;
        }
        particles.push(particle);
    }
}

function Particle() {
    this.w = this.h = Math.random() * 4 + 1;

    this.x = xPoint - this.w / 2;
    this.y = yPoint - this.h / 2;

    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;

    this.alpha = Math.random() * .25 + .75;

    this.color;
}

Particle.prototype = {
    gravity: 0.05,
    move: function () {
        this.x += this.vx;
        this.vy += this.gravity;
        this.y += this.vy;
        this.alpha -= 0.01;
        if (this.x <= -this.w || this.x >= screen.width ||
            this.y >= screen.height ||
            this.alpha <= 0) {
            return false;
        }
        return true;
    },
    draw: function (c) {
        c.save();
        c.beginPath();

        c.translate(this.x + this.w / 2, this.y + this.h / 2);
        c.arc(0, 0, this.w, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.globalAlpha = this.alpha;

        c.closePath();
        c.fill();
        c.restore();
    }
} 
// =============================================
// Main Game Class
// =============================================
export class KatakisGame {
    constructor() {
        this.id = 'katakis';
        this.CANVAS_W = 640;
        this.CANVAS_H = 400;
        this.PLAYER_W = 36;
        this.PLAYER_H = 28;
        this.canvas = null;
        this.ctx = null;
        this.statusEl = null;
        // Player
        this.px = 80;
        this.py = 180;
        this.pSpeed = 4;
        this.pHp = 5;
        this.pMaxHp = 5;
        this.pInvincible = 0;
        this.pWeapon = 'basic';
        this.pWeaponLevel = 1;
        this.pScore = 0;
        this.pLives = 3;
        this.pShootTimer = 0;
        this.pShootInterval = 12;
        // Input
        this.keys = new Set();
        // Game objects
        this.stars = [];
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        // Level
        this.level = 0;
        this.levelTimer = 0;
        this.levelEnemyTimer = 0;
        this.scrollX = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.bossActive = false;
        this.levelTransition = 0;
        // Buttons
        this.resetBtn = null;
        this.btnLeft = null;
        this.btnRight = null;
        this.btnUp = null;
        this.btnDown = null;
        this.btnShoot = null;
        this.btnForce = null;
        this.canvas = document.getElementById('katakisCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.statusEl = document.getElementById('katakisStatus');
        this.resetBtn = document.getElementById('resetKatakisBtn');
        this.btnLeft = document.getElementById('katakisBtnLeft');
        this.btnRight = document.getElementById('katakisBtnRight');
        this.btnUp = document.getElementById('katakisBtnUp');
        this.btnDown = document.getElementById('katakisBtnDown');
        this.btnShoot = document.getElementById('katakisBtnShoot');
        this.btnForce = document.getElementById('katakisBtnForce');
        this.force = { x: 0, y: 0, active: true, attached: true, angle: 0, side: 1 };
        this.setupEventListeners();
        this.setupMobileControls();
    }
    // =============================================
    // Setup
    // =============================================
    setupEventListeners() {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.init());
        }
    }
    setupMobileControls() {
        const addCtrl = (btn, action) => {
            if (!btn)
                return;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); });
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); action(); });
        };
        addCtrl(this.btnLeft, () => { if (!this.gameOver)
            this.px = Math.max(10, this.px - 12); });
        addCtrl(this.btnRight, () => { if (!this.gameOver)
            this.px = Math.min(this.CANVAS_W - this.PLAYER_W - 10, this.px + 12); });
        addCtrl(this.btnUp, () => { if (!this.gameOver)
            this.py = Math.max(10, this.py - 12); });
        addCtrl(this.btnDown, () => { if (!this.gameOver)
            this.py = Math.min(this.CANVAS_H - this.PLAYER_H - 10, this.py + 12); });
        addCtrl(this.btnShoot, () => { if (!this.gameOver)
            this.playerShoot(); });
        addCtrl(this.btnForce, () => { if (!this.gameOver)
            this.toggleForce(); });
    }
    // =============================================
    // Game Interface
    // =============================================
    init() {
        if (this.gameInterval)
            clearInterval(this.gameInterval);
        this.px = 80;
        this.py = this.CANVAS_H / 2 - this.PLAYER_H / 2;
        this.pHp = 5;
        this.pMaxHp = 5;
        this.pInvincible = 0;
        this.pWeapon = 'basic';
        this.pWeaponLevel = 1;
        this.pScore = 0;
        this.pLives = 3;
        this.pShootTimer = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.level = 0;
        this.levelTimer = 0;
        this.levelEnemyTimer = 0;
        this.scrollX = 0;
        this.bossActive = false;
        this.levelTransition = 0;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        this.keys.clear();
        this.force = { x: 0, y: 0, active: true, attached: true, angle: 0, side: 1 };
        this.generateStars();
        this.updateStatus();
        this.draw();
        this.gameInterval = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }
    cleanup() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = undefined;
        }
        this.keys.clear();
    }
    // =============================================
    // Starfield
    // =============================================
    generateStars() {
        this.stars = [];
        for (let i = 0; i < 120; i++) {
            this.stars.push({
                x: Math.random() * this.CANVAS_W,
                y: Math.random() * this.CANVAS_H,
                speed: 0.5 + Math.random() * 2.5,
                brightness: 0.3 + Math.random() * 0.7,
            });
        }
    }
    // =============================================
    // Input Handling
    // =============================================
    handleKeyDown(e) {
        this.keys.add(e.key);
        if (e.key === ' ' || e.key === 'Space') {
            this.playerShoot();
        }
        if (e.key === 'f' || e.key === 'F') {
            this.toggleForce();
        }
        e.preventDefault();
    }
    handleKeyUp(e) {
        this.keys.delete(e.key);
    }
    toggleForce() {
        if (this.force.active) {
            this.force.attached = !this.force.attached;
        }
    }
    // =============================================
    // Player Shooting
    // =============================================
    playerShoot() {
        if (this.pShootTimer > 0)
            return;
        this.pShootTimer = this.pShootInterval;
        const cx = this.px + this.PLAYER_W / 2;
        const cy = this.py + this.PLAYER_H / 2;
        switch (this.pWeapon) {
            case 'basic':
                this.bullets.push({ x: this.px + this.PLAYER_W, y: cy - 2, w: 12, h: 4, speed: 8, type: 'player', damage: 1 });
                break;
            case 'laser':
                this.bullets.push({ x: this.px + this.PLAYER_W, y: cy - 1, w: 20, h: 3, speed: 12, type: 'player', damage: 2 });
                break;
            case 'spread':
                this.bullets.push({ x: this.px + this.PLAYER_W, y: cy - 6, w: 10, h: 3, speed: 7, type: 'player', damage: 1 });
                this.bullets.push({ x: this.px + this.PLAYER_W, y: cy + 3, w: 10, h: 3, speed: 7, type: 'player', damage: 1 });
                this.bullets.push({ x: this.px + this.PLAYER_W, y: cy, w: 12, h: 3, speed: 9, type: 'player', damage: 1 });
                break;
        }
    }
    // =============================================
    // Update
    // =============================================
    update() {
        if (this.gameOver)
            return;
        this.handleInput();
        this.updateStars();
        this.updateForce();
        this.updateBullets();
        this.updateEnemies();
        this.updatePowerUps();
        this.updateParticles();
        this.updateLevel();
        this.checkCollisions();
        this.updateInvincibility();
        this.pShootTimer = Math.max(0, this.pShootTimer - 1);
        if (this.pHp <= 0) {
            this.playerDeath();
        }
    }
    handleInput() {
        if (this.gameOver)
            return;
        if (this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A')) {
            this.px = Math.max(10, this.px - this.pSpeed);
        }
        if (this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D')) {
            this.px = Math.min(this.CANVAS_W - this.PLAYER_W - 10, this.px + this.pSpeed);
        }
        if (this.keys.has('ArrowUp') || this.keys.has('w') || this.keys.has('W')) {
            this.py = Math.max(10, this.py - this.pSpeed);
        }
        if (this.keys.has('ArrowDown') || this.keys.has('s') || this.keys.has('S')) {
            this.py = Math.min(this.CANVAS_H - this.PLAYER_H - 10, this.py + this.pSpeed);
        }
        if (this.keys.has(' ') || this.keys.has('Space')) {
            this.playerShoot();
        }
        if (this.keys.has('f') || this.keys.has('F')) {
            this.toggleForce();
        }
    }
    updateStars() {
        for (const star of this.stars) {
            star.x -= star.speed;
            if (star.x < 0) {
                star.x = this.CANVAS_W;
                star.y = Math.random() * this.CANVAS_H;
            }
        }
    }
    updateForce() {
        if (!this.force.active)
            return;
        if (this.force.attached) {
            // Orbit around the player
            this.force.angle += 0.04;
            this.force.side = Math.cos(this.force.angle) > 0 ? 1 : -1;
            const orbitR = 30;
            const fx = this.px + this.PLAYER_W / 2 + Math.cos(this.force.angle) * orbitR;
            const fy = this.py + this.PLAYER_H / 2 + Math.sin(this.force.angle) * orbitR;
            this.force.x = fx - 12;
            this.force.y = fy - 10;
            // Force shoots automatically
            if (Math.abs(Math.cos(this.force.angle)) > 0.7) {
                const dir = this.force.side > 0 ? 1 : -1;
                this.bullets.push({
                    x: this.force.x + (dir > 0 ? 24 : -4),
                    y: this.force.y + 8,
                    w: 10, h: 3, speed: 6 * dir, type: 'force', damage: 1
                });
            }
        }
        else {
            // Free force - moves independently, can be repositioned
            // Force stays where detached
        }
    }
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.speed;
            if (b.x < -20 || b.x > this.CANVAS_W + 20 || b.y < -20 || b.y > this.CANVAS_H + 20) {
                this.bullets.splice(i, 1);
            }
        }
    }
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            // Move enemy based on type
            switch (e.type) {
                case 'fighter':
                    e.x -= 2;
                    e.y += Math.sin(e.moveTimer * 0.05) * 1.5;
                    break;
                case 'bomber':
                    e.x -= 1.5;
                    e.y += e.speedY;
                    if (e.y <= 20 || e.y >= this.CANVAS_H - e.h - 20)
                        e.speedY *= -1;
                    break;
                case 'turret':
                    // Stationary or slowly moving
                    break;
                case 'runner':
                    e.x -= 3.5;
                    break;
                case 'boss':
                    if (e.x > this.CANVAS_W - 150)
                        e.x -= 1;
                    e.y += Math.sin(e.moveTimer * 0.03) * 1.2;
                    break;
            }
            e.moveTimer++;
            // Enemy shooting
            e.shootTimer--;
            if (e.shootTimer <= 0 && e.x > 0 && e.x < this.CANVAS_W + 20 && e.type !== 'runner') {
                e.shootTimer = 60 + Math.floor(Math.random() * 60);
                if (e.type === 'boss')
                    e.shootTimer = 20 + Math.floor(Math.random() * 30);
                this.bullets.push({
                    x: e.x - 5,
                    y: e.y + e.h / 2 - 3,
                    w: 8, h: 6, speed: -3 - Math.random() * 2,
                    type: 'enemy', damage: 1
                });
                if (e.type === 'boss') {
                    // Boss shoots spread
                    this.bullets.push({
                        x: e.x - 5,
                        y: e.y + 5,
                        w: 6, h: 6, speed: -3,
                        type: 'enemy', damage: 1
                    });
                    this.bullets.push({
                        x: e.x - 5,
                        y: e.y + e.h - 5,
                        w: 6, h: 6, speed: -3,
                        type: 'enemy', damage: 1
                    });
                }
            }
            // Remove if off screen
            if (e.x < -100) {
                this.enemies.splice(i, 1);
            }
        }
    }
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            p.x -= 1.5;
            if (p.x < -30) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    updateInvincibility() {
        if (this.pInvincible > 0)
            this.pInvincible--;
    }
    // =============================================
    // Level System
    // =============================================
    updateLevel() {
        this.levelTimer++;
        this.levelEnemyTimer++;
        const spawnEnemy = (type, x, y, hp) => {
            const sizes = {
                fighter: { w: 28, h: 22 },
                bomber: { w: 34, h: 26 },
                turret: { w: 24, h: 30 },
                runner: { w: 20, h: 16 },
                boss: { w: 80, h: 60 },
            };
            const size = sizes[type];
            this.enemies.push({
                x, y, w: size.w, h: size.h,
                hp, maxHp: hp,
                type,
                moveTimer: 0,
                shootTimer: 30 + Math.floor(Math.random() * 60),
                speedY: type === 'bomber' ? (Math.random() > 0.5 ? 1 : -1) : 0,
                phase: 0,
            });
        };
        const spawnPowerUp = (x, y) => {
            this.spawnPowerUpAt(x, y);
        };
        // Level 1 - Easy
        if (this.level === 0) {
            if (this.levelEnemyTimer % 90 === 0 && !this.bossActive) {
                const y = 30 + Math.random() * (this.CANVAS_H - 80);
                spawnEnemy('fighter', this.CANVAS_W + 10, y, 2);
            }
            if (this.levelEnemyTimer % 180 === 0 && !this.bossActive) {
                spawnEnemy('bomber', this.CANVAS_W + 10, 40, 3);
            }
            if (this.levelTimer > 1200 && !this.bossActive) {
                this.bossActive = true;
                spawnEnemy('boss', this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 25);
            }
            if (this.bossActive && this.enemies.filter(e => e.type === 'boss').length === 0 && this.levelTimer > 1300) {
                this.nextLevel();
            }
        }
        // Level 2 - Medium
        else if (this.level === 1) {
            if (this.levelEnemyTimer % 60 === 0 && !this.bossActive) {
                const y = 20 + Math.random() * (this.CANVAS_H - 60);
                spawnEnemy('fighter', this.CANVAS_W + 10, y, 3);
            }
            if (this.levelEnemyTimer % 120 === 0 && !this.bossActive) {
                spawnEnemy('bomber', this.CANVAS_W + 10, 30, 4);
            }
            if (this.levelEnemyTimer % 200 === 0 && !this.bossActive) {
                spawnEnemy('runner', this.CANVAS_W + 10, 50 + Math.random() * 250, 2);
            }
            if (this.levelEnemyTimer % 150 === 0 && !this.bossActive) {
                spawnEnemy('turret', this.CANVAS_W + 10, 50 + Math.random() * 250, 5);
            }
            if (this.levelTimer > 1400 && !this.bossActive) {
                this.bossActive = true;
                spawnEnemy('boss', this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 40);
            }
            if (this.bossActive && this.enemies.filter(e => e.type === 'boss').length === 0 && this.levelTimer > 1500) {
                this.nextLevel();
            }
        }
        // Level 3 - Hard
        else if (this.level === 2) {
            if (this.levelEnemyTimer % 40 === 0 && !this.bossActive) {
                const y = 20 + Math.random() * (this.CANVAS_H - 60);
                spawnEnemy('fighter', this.CANVAS_W + 10, y, 4);
            }
            if (this.levelEnemyTimer % 100 === 0 && !this.bossActive) {
                spawnEnemy('bomber', this.CANVAS_W + 10, 50, 5);
            }
            if (this.levelEnemyTimer % 150 === 0 && !this.bossActive) {
                spawnEnemy('runner', this.CANVAS_W + 10, 60 + Math.random() * 220, 3);
            }
            if (this.levelEnemyTimer % 130 === 0 && !this.bossActive) {
                spawnEnemy('turret', this.CANVAS_W + 10, 100 + Math.random() * 200, 6);
            }
            if (this.levelTimer > 1500 && !this.bossActive) {
                this.bossActive = true;
                spawnEnemy('boss', this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 60);
            }
            if (this.bossActive && this.enemies.filter(e => e.type === 'boss').length === 0 && this.levelTimer > 1600) {
                this.nextLevel();
            }
        }
        // Level 4 - Final boss
        else if (this.level === 3) {
            if (this.levelEnemyTimer % 50 === 0 && !this.bossActive) {
                const y = 20 + Math.random() * (this.CANVAS_H - 60);
                spawnEnemy('fighter', this.CANVAS_W + 10, y, 5);
            }
            if (this.levelEnemyTimer % 200 === 0 && !this.bossActive) {
                spawnEnemy('bomber', this.CANVAS_W + 10, 30, 6);
                spawnEnemy('bomber', this.CANVAS_W + 30, this.CANVAS_H - 30, 6);
            }
            if (this.levelEnemyTimer % 180 === 0 && !this.bossActive) {
                spawnEnemy('turret', this.CANVAS_W + 10, 120, 8);
                spawnEnemy('turret', this.CANVAS_W + 10, this.CANVAS_H - 120, 8);
            }
            if (this.levelTimer > 1000 && !this.bossActive) {
                this.bossActive = true;
                spawnEnemy('boss', this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 100);
            }
            if (this.bossActive && this.enemies.filter(e => e.type === 'boss').length === 0 && this.levelTimer > 1100) {
                this.gameOver = true;
                this.gameWon = true;
                if (this.statusEl)
                    this.statusEl.textContent = `🎉 KATAKIS BESIEGT! Punkte: ${this.pScore}`;
            }
        }
    }
    nextLevel() {
        this.level++;
        this.levelTimer = 0;
        this.levelEnemyTimer = 0;
        this.bossActive = false;
        this.levelTransition = 60; // brief transition
        this.updateStatus();
        // Heal player a bit
        this.pHp = Math.min(this.pMaxHp, this.pHp + 2);
    }
    // =============================================
    // Collision Detection
    // =============================================
    checkCollisions() {
        // Player bullets vs enemies
        for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
            const b = this.bullets[bi];
            if (b.type === 'enemy')
                continue;
            for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
                const e = this.enemies[ei];
                if (this.rectsOverlap(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
                    e.hp -= b.damage;
                    this.bullets.splice(bi, 1);
                    // Hit particles
                    this.spawnExplosion(b.x, b.y, 5, '#ff0');
                    if (e.hp <= 0) {
                        this.enemies.splice(ei, 1);
                        const pts = e.type === 'boss' ? 200 : (e.type === 'turret' ? 50 : (e.type === 'bomber' ? 40 : 20));
                        this.pScore += pts;
                        // Big explosion
                        this.spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, 20, '#f80');
                        this.spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, 15, '#ff0');
                        // Maybe drop power-up
                        if (Math.random() < 0.15 || e.type === 'boss') {
                            this.spawnPowerUpAt(e.x + e.w / 2, e.y + e.h / 2);
                        }
                        this.updateStatus();
                    }
                    break;
                }
            }
        }
        // Enemy bullets vs player
        if (this.pInvincible <= 0) {
            for (const b of this.bullets) {
                if (b.type !== 'enemy')
                    continue;
                if (this.rectsOverlap(b.x, b.y, b.w, b.h, this.px, this.py, this.PLAYER_W, this.PLAYER_H)) {
                    this.hitPlayer(b.damage);
                    b.x = -100; // remove bullet
                    break;
                }
            }
            // Enemies vs player
            for (const e of this.enemies) {
                if (this.rectsOverlap(e.x, e.y, e.w, e.h, this.px, this.py, this.PLAYER_W, this.PLAYER_H)) {
                    this.hitPlayer(1);
                    break;
                }
            }
            // Force vs enemy bullets (force can block!)
            if (this.force.active) {
                for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
                    const b = this.bullets[bi];
                    if (b.type !== 'enemy')
                        continue;
                    if (this.rectsOverlap(b.x, b.y, b.w, b.h, this.force.x, this.force.y, 24, 20)) {
                        this.bullets.splice(bi, 1);
                        this.spawnExplosion(b.x, b.y, 3, '#0af');
                    }
                }
            }
        }
        // Power-ups vs player
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            if (this.rectsOverlap(p.x, p.y, 20, 16, this.px, this.py, this.PLAYER_W, this.PLAYER_H)) {
                this.applyPowerUp(p.type);
                this.powerUps.splice(i, 1);
            }
        }
    }
    rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }
    hitPlayer(damage) {
        if (this.pInvincible > 0)
            return;
        this.pHp -= damage;
        this.pInvincible = 40;
        this.spawnExplosion(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2, 10, '#f00');
        this.updateStatus();
    }
    playerDeath() {
        this.pLives--;
        if (this.pLives <= 0) {
            this.gameOver = true;
            this.gameWon = false;
            this.spawnExplosion(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2, 40, '#f80');
            this.spawnExplosion(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2, 30, '#ff0');
            if (this.statusEl) {
                this.statusEl.textContent = `💀 GAME OVER! Punkte: ${this.pScore}`;
            }
        }
        else {
            // Respawn
            this.px = 80;
            this.py = this.CANVAS_H / 2 - this.PLAYER_H / 2;
            this.pHp = this.pMaxHp;
            this.pInvincible = 90;
            this.updateStatus();
        }
    }
    applyPowerUp(type) {
        switch (type) {
            case 'laser':
                this.pWeapon = 'laser';
                break;
            case 'spread':
                this.pWeapon = 'spread';
                break;
            case 'force':
                if (!this.force.active) {
                    this.force.active = true;
                    this.force.attached = true;
                }
                break;
            case 'speed':
                this.pSpeed = Math.min(7, this.pSpeed + 1);
                break;
            case 'health':
                this.pHp = Math.min(this.pMaxHp, this.pHp + 2);
                break;
        }
        this.updateStatus();
    }
    spawnPowerUpAt(x, y) {
        const types = ['laser', 'spread', 'force', 'speed', 'health'];
        this.powerUps.push({ x, y, type: types[Math.floor(Math.random() * types.length)] });
    }
    spawnExplosion(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 15 + Math.floor(Math.random() * 20),
                maxLife: 35,
                color,
                size: 2 + Math.random() * 4,
            });
        }
    }
    // =============================================
    // Drawing
    // =============================================
    draw() {
        if (!this.ctx || !this.canvas)
            return;
        const ctx = this.ctx;
        // Background
        const grad = ctx.createLinearGradient(0, 0, this.CANVAS_W, 0);
        if (this.level === 0) {
            grad.addColorStop(0, '#0a0a1a');
            grad.addColorStop(1, '#1a0a2a');
        }
        else if (this.level === 1) {
            grad.addColorStop(0, '#0a0a0a');
            grad.addColorStop(1, '#0a1a2a');
        }
        else if (this.level === 2) {
            grad.addColorStop(0, '#1a0a0a');
            grad.addColorStop(1, '#2a0a1a');
        }
        else {
            grad.addColorStop(0, '#0a0000');
            grad.addColorStop(1, '#1a0000');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
        // Stars
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255,255,255,${star.brightness * 0.6})`;
            ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1.5, 1.5);
        }
        // Subtle grid lines for depth
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let x = (this.scrollX % 60); x < this.CANVAS_W; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.CANVAS_H);
            ctx.stroke();
        }
        // Power-ups
        for (const p of this.powerUps) {
            this.drawPowerUp(p);
        }
        // Enemies
        for (const e of this.enemies) {
            this.drawEnemy(e);
        }
        // Force module
        if (this.force.active) {
            this.drawForce();
        }
        // Player bullets
        for (const b of this.bullets) {
            if (b.type === 'enemy')
                continue;
            ctx.fillStyle = b.type === 'force' ? '#0af' : '#0f0';
            ctx.shadowColor = b.type === 'force' ? '#0af' : '#0f0';
            ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.shadowBlur = 0;
        }
        // Enemy bullets
        for (const b of this.bullets) {
            if (b.type !== 'enemy')
                continue;
            ctx.fillStyle = '#f44';
            ctx.shadowColor = '#f44';
            ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.shadowBlur = 0;
        }
        // Player ship
        if (!this.gameOver || this.pLives > 0) {
            this.drawPlayer();
        }
        // Particles
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
        // Level transition overlay
        if (this.levelTransition > 0) {
            this.levelTransition--;
            ctx.fillStyle = `rgba(255,255,255,${this.levelTransition / 60 * 0.3})`;
            ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`LEVEL ${this.level + 1}`, this.CANVAS_W / 2, this.CANVAS_H / 2);
        }
        // Game over overlay
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
            ctx.fillStyle = this.gameWon ? '#f1c40f' : '#e74c3c';
            ctx.font = 'bold 40px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const msg = this.gameWon ? '🎉 KATAKIS BESIEGT!' : '💀 GAME OVER';
            ctx.fillText(msg, this.CANVAS_W / 2, this.CANVAS_H / 2 - 20);
            ctx.font = '24px Segoe UI, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText(`Punkte: ${this.pScore}`, this.CANVAS_W / 2, this.CANVAS_H / 2 + 30);
        }
    }
    drawPlayer() {
        const ctx = this.ctx;
        if (this.pInvincible > 0 && Math.floor(this.pInvincible / 4) % 2 === 0)
            return;
        const x = this.px;
        const y = this.py;
        // Engine glow
        ctx.shadowColor = '#0af';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#0af';
        ctx.beginPath();
        ctx.moveTo(x - 8, y + this.PLAYER_H / 2 - 4);
        ctx.lineTo(x - 16, y + this.PLAYER_H / 2);
        ctx.lineTo(x - 8, y + this.PLAYER_H / 2 + 4);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Ship body
        ctx.fillStyle = '#4a9eff';
        ctx.shadowColor = '#4a9eff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(x + this.PLAYER_W, y + this.PLAYER_H / 2); // nose
        ctx.lineTo(x + this.PLAYER_W - 10, y + 2); // top-right
        ctx.lineTo(x + 4, y + 4); // top-left
        ctx.lineTo(x, y + this.PLAYER_H / 2 - 2); // top indentation
        ctx.lineTo(x, y + this.PLAYER_H / 2 + 2); // bottom indentation
        ctx.lineTo(x + 4, y + this.PLAYER_H - 4); // bottom-left
        ctx.lineTo(x + this.PLAYER_W - 10, y + this.PLAYER_H - 2); // bottom-right
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Cockpit
        ctx.fillStyle = '#8cf';
        ctx.beginPath();
        ctx.ellipse(x + this.PLAYER_W - 14, y + this.PLAYER_H / 2, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wing accents
        ctx.fillStyle = '#6ab0ff';
        ctx.fillRect(x + 4, y + 4, 8, 3);
        ctx.fillRect(x + 4, y + this.PLAYER_H - 7, 8, 3);
        // HP bar above ship
        const hpW = this.PLAYER_W;
        const hpH = 3;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y - 8, hpW, hpH);
        ctx.fillStyle = this.pHp > 2 ? '#0f0' : '#f00';
        ctx.fillRect(x, y - 8, hpW * (this.pHp / this.pMaxHp), hpH);
    }
    drawEnemy(e) {
        const ctx = this.ctx;
        switch (e.type) {
            case 'fighter': {
                ctx.fillStyle = '#e74c3c';
                ctx.shadowColor = '#e74c3c';
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.moveTo(e.x, e.y + e.h / 2);
                ctx.lineTo(e.x + e.w - 6, e.y + 2);
                ctx.lineTo(e.x + e.w, e.y + e.h / 2);
                ctx.lineTo(e.x + e.w - 6, e.y + e.h - 2);
                ctx.closePath();
                ctx.fill();
                // Cockpit
                ctx.fillStyle = '#ff8';
                ctx.fillRect(e.x + e.w - 10, e.y + e.h / 2 - 3, 5, 6);
                ctx.shadowBlur = 0;
                break;
            }
            case 'bomber': {
                ctx.fillStyle = '#9b59b6';
                ctx.shadowColor = '#9b59b6';
                ctx.shadowBlur = 4;
                ctx.fillRect(e.x, e.y, e.w, e.h);
                ctx.fillStyle = '#c39bd3';
                ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
                // Wings
                ctx.fillStyle = '#8e44ad';
                ctx.fillRect(e.x + e.w / 2 - 8, e.y - 6, 16, 6);
                ctx.fillRect(e.x + e.w / 2 - 8, e.y + e.h, 16, 6);
                ctx.shadowBlur = 0;
                break;
            }
            case 'turret': {
                ctx.fillStyle = '#2ecc71';
                ctx.shadowColor = '#2ecc71';
                ctx.shadowBlur = 4;
                // Base
                ctx.fillRect(e.x + 2, e.y + e.h / 2 - 12, e.w - 4, 24);
                // Gun barrel
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(e.x - 8, e.y + e.h / 2 - 3, 12, 6);
                ctx.shadowBlur = 0;
                break;
            }
            case 'runner': {
                ctx.fillStyle = '#e67e22';
                ctx.shadowColor = '#e67e22';
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f39c12';
                ctx.beginPath();
                ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                break;
            }
            case 'boss': {
                // Boss - large menacing ship
                ctx.shadowColor = '#e74c3c';
                ctx.shadowBlur = 10;
                // Main body
                ctx.fillStyle = '#4a0a0a';
                ctx.fillRect(e.x, e.y, e.w, e.h);
                // Armor plates
                ctx.fillStyle = '#6a1a1a';
                ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, 12);
                ctx.fillRect(e.x + 4, e.y + e.h - 16, e.w - 8, 12);
                ctx.fillRect(e.x + 4, e.y + e.h / 2 - 4, e.w - 8, 8);
                // Core
                ctx.fillStyle = '#f00';
                ctx.shadowColor = '#f00';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 12, 0, Math.PI * 2);
                ctx.fill();
                // Cannons
                ctx.shadowBlur = 4;
                ctx.fillStyle = '#888';
                ctx.fillRect(e.x - 8, e.y + 8, 12, 6);
                ctx.fillRect(e.x - 8, e.y + e.h - 14, 12, 6);
                // HP bar
                ctx.shadowBlur = 0;
                const hpW = e.w;
                const hpH = 4;
                ctx.fillStyle = '#333';
                ctx.fillRect(e.x, e.y - 10, hpW, hpH);
                ctx.fillStyle = e.hp > e.maxHp * 0.5 ? '#0f0' : (e.hp > e.maxHp * 0.25 ? '#ff0' : '#f00');
                ctx.fillRect(e.x, e.y - 10, hpW * (e.hp / e.maxHp), hpH);
                ctx.shadowBlur = 0;
                break;
            }
        }
        // HP bar for non-boss enemies
        if (e.type !== 'boss' && e.hp < e.maxHp) {
            ctx.fillStyle = '#333';
            ctx.fillRect(e.x, e.y - 5, e.w, 3);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(e.x, e.y - 5, e.w * (e.hp / e.maxHp), 3);
        }
        ctx.shadowBlur = 0;
    }
    drawForce() {
        const ctx = this.ctx;
        const fx = this.force.x;
        const fy = this.force.y;
        const fw = 24;
        const fh = 20;
        if (this.force.attached) {
            // Orbiting force module
            ctx.fillStyle = '#0af';
            ctx.shadowColor = '#0af';
            ctx.shadowBlur = 8;
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(fx + fw / 2, fy);
            ctx.lineTo(fx + fw, fy + fh / 2);
            ctx.lineTo(fx + fw / 2, fy + fh);
            ctx.lineTo(fx, fy + fh / 2);
            ctx.closePath();
            ctx.fill();
            // Inner glow
            ctx.fillStyle = '#8df';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(fx + fw / 2, fy + fh / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            // Connection line to player
            ctx.strokeStyle = 'rgba(0,170,255,0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(fx + fw / 2, fy + fh / 2);
            ctx.lineTo(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        else {
            // Detached - different color
            ctx.fillStyle = '#f80';
            ctx.shadowColor = '#f80';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(fx + fw / 2, fy);
            ctx.lineTo(fx + fw, fy + fh / 2);
            ctx.lineTo(fx + fw / 2, fy + fh);
            ctx.lineTo(fx, fy + fh / 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fd8';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(fx + fw / 2, fy + fh / 2, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
    drawPowerUp(p) {
        const ctx = this.ctx;
        const x = p.x;
        const y = p.y;
        // Floating effect
        const bob = Math.sin(Date.now() * 0.005) * 2;
        // Glow
        ctx.shadowBlur = 10;
        const colors = {
            laser: '#ff0',
            spread: '#0f0',
            force: '#0af',
            speed: '#f0f',
            health: '#f00',
        };
        const labels = {
            laser: 'L',
            spread: 'S',
            force: 'F',
            speed: '>',
            health: '+',
        };
        ctx.fillStyle = colors[p.type];
        ctx.shadowColor = colors[p.type];
        ctx.fillRect(x, y + bob, 18, 14);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[p.type], x + 9, y + 7 + bob);
    }
    // =============================================
    // Status
    // =============================================
    updateStatus() {
        if (!this.statusEl)
            return;
        const weaponNames = { basic: 'Basic', laser: 'Laser', spread: 'Spread' };
        this.statusEl.textContent =
            `❤️ ${'♥'.repeat(this.pHp)}${'♡'.repeat(Math.max(0, this.pMaxHp - this.pHp))}` +
                ` | Leben: ${'🛸'.repeat(this.pLives)}` +
                ` | Waffe: ${weaponNames[this.pWeapon]}` +
                ` | Punkte: ${this.pScore}` +
                ` | Level ${this.level + 1}/4`;
    }
}
//# sourceMappingURL=KatakisGame.js.map
import { Game, GameId } from '../types/common';

interface TdWaypoint {
    c: number;
    r: number;
}

interface TdEnemy {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    speed: number;
    baseSpeed: number;
    reward: number;
    pathIndex: number;
    radius: number;
    color: string;
    frozen: number;
    poison: number;
    poisonTimer: number;
    type: 'normal' | 'fast' | 'tank' | 'boss';
}

interface TdTower {
    c: number;
    r: number;
    type: 'archer' | 'fire' | 'ice' | 'lightning';
    level: number;
    cooldown: number;
    maxCooldown: number;
    range: number;
    damage: number;
}

interface TdProjectile {
    x: number;
    y: number;
    target: TdEnemy;
    type: 'arrow' | 'fireball' | 'ice' | 'lightning';
    damage: number;
    speed: number;
    splash?: number;
    chain?: number;
    chainHits?: number;
}

interface TdParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export class TowerDefenseGame implements Game {
    public readonly id: GameId = 'towerDefense';

    private readonly TD_COLS: number = 15;
    private readonly TD_ROWS: number = 12;
    private readonly TD_CELL_SIZE: number = 40;
    private readonly TD_WIDTH: number = 600;
    private readonly TD_HEIGHT: number = 480;

    private readonly TD_TOWER_DATA: Record<TdTower['type'], { name: string; cost: number; range: number; damage: number; cooldown: number; color: string; desc: string }> = {
        archer: { name: 'Bogenschütze', cost: 50, range: 120, damage: 12, cooldown: 25, color: '#28a745', desc: 'Schnell, Einzelziel' },
        fire: { name: 'Feuer', cost: 120, range: 100, damage: 20, cooldown: 55, color: '#ff6600', desc: 'Flächenschaden' },
        ice: { name: 'Eis', cost: 100, range: 110, damage: 6, cooldown: 40, color: '#00ccff', desc: 'Verlangsamt Gegner' },
        lightning: { name: 'Blitz', cost: 175, range: 140, damage: 18, cooldown: 45, color: '#cc00ff', desc: 'Kettenblitz' }
    };

    private readonly TD_WAVES: { count: number; interval: number; hp: number; speed: number; reward: number; type: TdEnemy['type']; color: string; radius: number }[] = [
        { count: 6, interval: 900, hp: 30, speed: 1.2, reward: 8, type: 'normal', color: '#e74c3c', radius: 10 },
        { count: 8, interval: 800, hp: 40, speed: 1.4, reward: 8, type: 'normal', color: '#e74c3c', radius: 10 },
        { count: 10, interval: 700, hp: 35, speed: 2.2, reward: 10, type: 'fast', color: '#f1c40f', radius: 8 },
        { count: 7, interval: 1000, hp: 90, speed: 0.9, reward: 14, type: 'tank', color: '#7f8c8d', radius: 13 },
        { count: 12, interval: 650, hp: 55, speed: 1.8, reward: 11, type: 'fast', color: '#f1c40f', radius: 8 },
        { count: 9, interval: 850, hp: 130, speed: 1.0, reward: 16, type: 'tank', color: '#7f8c8d', radius: 13 },
        { count: 15, interval: 600, hp: 70, speed: 2.4, reward: 12, type: 'fast', color: '#f1c40f', radius: 8 },
        { count: 1, interval: 1200, hp: 900, speed: 0.7, reward: 150, type: 'boss', color: '#8e44ad', radius: 18 },
        { count: 18, interval: 550, hp: 110, speed: 1.9, reward: 13, type: 'normal', color: '#e74c3c', radius: 10 },
        { count: 3, interval: 1500, hp: 700, speed: 0.8, reward: 120, type: 'boss', color: '#8e44ad', radius: 18 }
    ];

    private readonly TD_PATH: TdWaypoint[] = [
        { c: 0, r: 1 }, { c: 3, r: 1 }, { c: 3, r: 5 }, { c: 7, r: 5 },
        { c: 7, r: 2 }, { c: 11, r: 2 }, { c: 11, r: 8 }, { c: 5, r: 8 },
        { c: 5, r: 10 }, { c: 14, r: 10 }
    ];

    private tdInterval: ReturnType<typeof setInterval> | undefined;
    private tdGold: number = 150;
    private tdLives: number = 20;
    private tdScore: number = 0;
    private tdWave: number = 0;
    private tdEnemies: TdEnemy[] = [];
    private tdTowers: TdTower[] = [];
    private tdProjectiles: TdProjectile[] = [];
    private tdParticles: TdParticle[] = [];
    private tdSelectedTower: TdTower['type'] = 'archer';
    private tdWaveActive: boolean = false;
    private tdWaveSpawned: number = 0;
    private tdWaveToSpawn: number = 0;
    private tdSpawnTimer: number = 0;
    private tdGameOver: boolean = false;
    private tdWon: boolean = false;
    private tdHoverCell: { c: number; r: number } | null = null;

    private tdCtx: CanvasRenderingContext2D | null = null;
    private resetTdBtn: HTMLElement | null = null;
    private tdCanvas: HTMLCanvasElement | null = null;
    private tdStatus: HTMLElement | null = null;
    private tdGoldDisplay: HTMLElement | null = null;
    private tdLivesDisplay: HTMLElement | null = null;
    private tdWaveDisplay: HTMLElement | null = null;
    private tdScoreDisplay: HTMLElement | null = null;
    private tdNextWaveBtn: HTMLButtonElement | null = null;

    constructor() {
        this.resetTdBtn = document.getElementById('resetTdBtn');
        this.tdCanvas = document.getElementById('tdCanvas') as HTMLCanvasElement | null;
        this.tdStatus = document.getElementById('tdStatus');
        this.tdGoldDisplay = document.getElementById('tdGold');
        this.tdLivesDisplay = document.getElementById('tdLives');
        this.tdWaveDisplay = document.getElementById('tdWave');
        this.tdScoreDisplay = document.getElementById('tdScore');
        this.tdNextWaveBtn = document.getElementById('tdNextWaveBtn') as HTMLButtonElement | null;

        this.tdCtx = this.tdCanvas ? this.tdCanvas.getContext('2d') : null;

        this.setupEventListeners();
        this.setupTdTowerButtons();
    }

    private setupEventListeners(): void {
        if (this.tdCanvas) {
            this.tdCanvas.addEventListener('click', (e: MouseEvent) => this.handleTdClick(e));
            this.tdCanvas.addEventListener('mousemove', (e: MouseEvent) => this.handleTdMouseMove(e));
            this.tdCanvas.addEventListener('mouseleave', () => { this.tdHoverCell = null; });
        }
        if (this.resetTdBtn) this.resetTdBtn.addEventListener('click', () => this.init());
        if (this.tdNextWaveBtn) this.tdNextWaveBtn.addEventListener('click', () => this.startNextWave());
    }

    public init(): void {
        if (this.tdInterval) clearInterval(this.tdInterval);
        if (!this.tdCanvas || !this.tdCtx) return;

        this.tdGold = 180;
        this.tdLives = 20;
        this.tdScore = 0;
        this.tdWave = 0;
        this.tdEnemies = [];
        this.tdTowers = [];
        this.tdProjectiles = [];
        this.tdParticles = [];
        this.tdSelectedTower = 'archer';
        this.tdWaveActive = false;
        this.tdWaveSpawned = 0;
        this.tdWaveToSpawn = 0;
        this.tdSpawnTimer = 0;
        this.tdGameOver = false;
        this.tdWon = false;

        this.updateUi();
        this.draw();

        this.tdInterval = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }

    public cleanup(): void {
        if (this.tdInterval) {
            clearInterval(this.tdInterval);
            this.tdInterval = undefined;
        }
    }

    private update(): void {
        if (this.tdGameOver || this.tdWon) return;

        if (this.tdWaveActive && this.tdWaveSpawned < this.tdWaveToSpawn) {
            this.tdSpawnTimer -= 16;
            if (this.tdSpawnTimer <= 0) {
                const wave = this.TD_WAVES[this.tdWave - 1];
                this.spawnEnemy(wave);
                this.tdWaveSpawned++;
                this.tdSpawnTimer = wave.interval;
            }
        }

        if (this.tdWaveActive && this.tdWaveSpawned >= this.tdWaveToSpawn && this.tdEnemies.length === 0) {
            this.tdWaveActive = false;
            if (this.tdWave >= this.TD_WAVES.length) {
                this.tdWon = true;
                this.updateUi();
                return;
            }
            this.updateUi();
        }

        for (let i = this.tdEnemies.length - 1; i >= 0; i--) {
            const enemy = this.tdEnemies[i];
            this.updateEnemy(enemy);
            if (enemy.hp <= 0) {
                this.tdGold += enemy.reward;
                this.tdScore += enemy.reward * 10;
                this.spawnParticles(enemy.x, enemy.y, enemy.color, 8);
                this.tdEnemies.splice(i, 1);
                this.updateUi();
            } else if (enemy.pathIndex >= this.TD_PATH.length) {
                this.tdLives--;
                this.tdEnemies.splice(i, 1);
                this.updateUi();
                if (this.tdLives <= 0) {
                    this.tdGameOver = true;
                    this.updateUi();
                    return;
                }
            }
        }

        for (const tower of this.tdTowers) {
            if (tower.cooldown > 0) tower.cooldown--;
            if (tower.cooldown <= 0) {
                const target = this.findTarget(tower);
                if (target) {
                    this.shootProjectile(tower, target);
                    tower.cooldown = tower.maxCooldown;
                }
            }
        }

        for (let i = this.tdProjectiles.length - 1; i >= 0; i--) {
            const proj = this.tdProjectiles[i];
            if (this.tdEnemies.indexOf(proj.target) === -1 || proj.target.hp <= 0) {
                this.tdProjectiles.splice(i, 1);
                continue;
            }
            const dx = proj.target.x - proj.x;
            const dy = proj.target.y - proj.y;
            const dist = Math.hypot(dx, dy);
            if (dist <= proj.speed) {
                this.hitEnemy(proj.target, proj);
                this.tdProjectiles.splice(i, 1);
            } else {
                proj.x += (dx / dist) * proj.speed;
                proj.y += (dy / dist) * proj.speed;
            }
        }

        for (let i = this.tdParticles.length - 1; i >= 0; i--) {
            const p = this.tdParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.tdParticles.splice(i, 1);
        }
    }

    private spawnEnemy(wave: typeof this.TD_WAVES[0]): void {
        const start = this.TD_PATH[0];
        this.tdEnemies.push({
            x: start.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2,
            y: start.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2,
            hp: wave.hp,
            maxHp: wave.hp,
            speed: wave.speed,
            baseSpeed: wave.speed,
            reward: wave.reward,
            pathIndex: 0,
            radius: wave.radius,
            color: wave.color,
            frozen: 0,
            poison: 0,
            poisonTimer: 0,
            type: wave.type
        });
    }

    private updateEnemy(enemy: TdEnemy): void {
        if (enemy.frozen > 0) {
            enemy.frozen--;
            enemy.speed = enemy.baseSpeed * 0.5;
        } else {
            enemy.speed = enemy.baseSpeed;
        }

        if (enemy.poison > 0) {
            enemy.poisonTimer--;
            if (enemy.poisonTimer <= 0) {
                enemy.hp -= enemy.poison;
                enemy.poisonTimer = 30;
                this.spawnParticles(enemy.x, enemy.y, '#00ff00', 2);
            }
            enemy.poison--;
        }

        const target = this.TD_PATH[Math.min(enemy.pathIndex + 1, this.TD_PATH.length - 1)];
        const tx = target.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
        const ty = target.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
        const dx = tx - enemy.x;
        const dy = ty - enemy.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= enemy.speed) {
            enemy.x = tx;
            enemy.y = ty;
            enemy.pathIndex++;
        } else {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
    }

    private findTarget(tower: TdTower): TdEnemy | null {
        const tx = tower.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
        const ty = tower.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
        let best: TdEnemy | null = null;
        let bestProgress = -1;
        for (const enemy of this.tdEnemies) {
            const dist = Math.hypot(enemy.x - tx, enemy.y - ty);
            if (dist <= tower.range) {
                const progress = enemy.pathIndex * 1000 + Math.hypot(enemy.x - tx, enemy.y - ty);
                if (progress > bestProgress) {
                    bestProgress = progress;
                    best = enemy;
                }
            }
        }
        return best;
    }

    private shootProjectile(tower: TdTower, target: TdEnemy): void {
        const tx = tower.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
        const ty = tower.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
        const type = tower.type === 'archer' ? 'arrow' : tower.type === 'fire' ? 'fireball' : tower.type;
        this.tdProjectiles.push({
            x: tx,
            y: ty,
            target,
            type,
            damage: tower.damage,
            speed: type === 'lightning' ? 15 : 8,
            splash: tower.type === 'fire' ? 60 : undefined,
            chain: tower.type === 'lightning' ? 3 : undefined,
            chainHits: 0
        });
    }

    private hitEnemy(enemy: TdEnemy, proj: TdProjectile): void {
        if (proj.type === 'fireball' && proj.splash) {
            for (const e of this.tdEnemies) {
                const dist = Math.hypot(e.x - enemy.x, e.y - enemy.y);
                if (dist <= proj.splash) {
                    e.hp -= Math.round(proj.damage * (1 - dist / proj.splash));
                    if (e !== enemy) this.spawnParticles(e.x, e.y, '#ff6600', 3);
                }
            }
            this.spawnParticles(enemy.x, enemy.y, '#ff6600', 12);
        } else if (proj.type === 'ice') {
            enemy.hp -= proj.damage;
            enemy.frozen = 60;
            this.spawnParticles(enemy.x, enemy.y, '#00ccff', 6);
        } else if (proj.type === 'lightning') {
            this.chainLightning(enemy, proj);
        } else {
            enemy.hp -= proj.damage;
            this.spawnParticles(enemy.x, enemy.y, '#ffff00', 4);
        }
    }

    private chainLightning(first: TdEnemy, proj: TdProjectile): void {
        let current: TdEnemy | null = first;
        const hit: Set<TdEnemy> = new Set();
        let damage = proj.damage;
        while (current && proj.chain && hit.size < proj.chain) {
            current.hp -= damage;
            hit.add(current);
            this.spawnParticles(current.x, current.y, '#cc00ff', 5);
            damage = Math.round(damage * 0.7);
            let next: TdEnemy | null = null;
            let bestDist = 100;
            for (const e of this.tdEnemies) {
                if (!hit.has(e)) {
                    const dist = Math.hypot(e.x - current!.x, e.y - current!.y);
                    if (dist < bestDist) {
                        bestDist = dist;
                        next = e;
                    }
                }
            }
            current = next;
        }
    }

    private spawnParticles(x: number, y: number, color: string, count: number): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            this.tdParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 20 + Math.floor(Math.random() * 20),
                maxLife: 40,
                color,
                size: 2 + Math.random() * 3
            });
        }
    }

    private draw(): void {
        if (!this.tdCtx || !this.tdCanvas) return;

        this.tdCtx.fillStyle = '#1a2a1a';
        this.tdCtx.fillRect(0, 0, this.TD_WIDTH, this.TD_HEIGHT);

        this.tdCtx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.tdCtx.lineWidth = 1;
        for (let c = 0; c <= this.TD_COLS; c++) {
            this.tdCtx.beginPath();
            this.tdCtx.moveTo(c * this.TD_CELL_SIZE, 0);
            this.tdCtx.lineTo(c * this.TD_CELL_SIZE, this.TD_HEIGHT);
            this.tdCtx.stroke();
        }
        for (let r = 0; r <= this.TD_ROWS; r++) {
            this.tdCtx.beginPath();
            this.tdCtx.moveTo(0, r * this.TD_CELL_SIZE);
            this.tdCtx.lineTo(this.TD_WIDTH, r * this.TD_CELL_SIZE);
            this.tdCtx.stroke();
        }

        this.tdCtx.fillStyle = 'rgba(139, 90, 43, 0.6)';
        for (let i = 0; i < this.TD_PATH.length; i++) {
            const wp = this.TD_PATH[i];
            this.tdCtx.fillRect(wp.c * this.TD_CELL_SIZE, wp.r * this.TD_CELL_SIZE, this.TD_CELL_SIZE, this.TD_CELL_SIZE);
            if (i < this.TD_PATH.length - 1) {
                const next = this.TD_PATH[i + 1];
                const minC = Math.min(wp.c, next.c);
                const maxC = Math.max(wp.c, next.c);
                const minR = Math.min(wp.r, next.r);
                const maxR = Math.max(wp.r, next.r);
                for (let c = minC; c <= maxC; c++) {
                    for (let r = minR; r <= maxR; r++) {
                        this.tdCtx.fillRect(c * this.TD_CELL_SIZE, r * this.TD_CELL_SIZE, this.TD_CELL_SIZE, this.TD_CELL_SIZE);
                    }
                }
            }
        }

        if (this.TD_PATH.length > 0) {
            const start = this.TD_PATH[0];
            const end = this.TD_PATH[this.TD_PATH.length - 1];
            this.tdCtx.fillStyle = '#2ecc71';
            this.tdCtx.font = '14px sans-serif';
            this.tdCtx.textAlign = 'center';
            this.tdCtx.fillText('START', start.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2, start.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2 + 5);
            this.tdCtx.fillStyle = '#e74c3c';
            this.tdCtx.fillText('END', end.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2, end.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2 + 5);
        }

        if (this.tdHoverCell && !this.tdGameOver && !this.tdWon) {
            const data = this.TD_TOWER_DATA[this.tdSelectedTower];
            const cx = this.tdHoverCell.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
            const cy = this.tdHoverCell.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
            const canPlace = this.canPlaceTower(this.tdHoverCell.c, this.tdHoverCell.r) && this.tdGold >= data.cost;
            this.tdCtx.fillStyle = canPlace ? 'rgba(40, 167, 69, 0.3)' : 'rgba(231, 76, 60, 0.3)';
            this.tdCtx.fillRect(this.tdHoverCell.c * this.TD_CELL_SIZE, this.tdHoverCell.r * this.TD_CELL_SIZE, this.TD_CELL_SIZE, this.TD_CELL_SIZE);
            this.tdCtx.strokeStyle = canPlace ? '#28a745' : '#e74c3c';
            this.tdCtx.beginPath();
            this.tdCtx.arc(cx, cy, data.range, 0, Math.PI * 2);
            this.tdCtx.stroke();
        }

        for (const tower of this.tdTowers) {
            this.drawTower(tower);
        }

        for (const enemy of this.tdEnemies) {
            this.drawEnemy(enemy);
        }

        for (const proj of this.tdProjectiles) {
            this.tdCtx!.fillStyle = proj.type === 'arrow' ? '#ffff00' : proj.type === 'fireball' ? '#ff6600' : proj.type === 'ice' ? '#00ccff' : '#cc00ff';
            this.tdCtx!.beginPath();
            this.tdCtx!.arc(proj.x, proj.y, proj.type === 'arrow' ? 3 : 5, 0, Math.PI * 2);
            this.tdCtx!.fill();
        }

        for (const p of this.tdParticles) {
            this.tdCtx!.globalAlpha = p.life / p.maxLife;
            this.tdCtx!.fillStyle = p.color;
            this.tdCtx!.beginPath();
            this.tdCtx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.tdCtx!.fill();
        }
        this.tdCtx!.globalAlpha = 1;

        if (this.tdGameOver || this.tdWon) {
            this.tdCtx.fillStyle = 'rgba(0,0,0,0.7)';
            this.tdCtx.fillRect(0, 0, this.TD_WIDTH, this.TD_HEIGHT);
            this.tdCtx.fillStyle = this.tdWon ? '#2ecc71' : '#e74c3c';
            this.tdCtx.font = 'bold 36px sans-serif';
            this.tdCtx.textAlign = 'center';
            this.tdCtx.fillText(this.tdWon ? 'SIEG!' : 'GAME OVER', this.TD_WIDTH / 2, this.TD_HEIGHT / 2);
            this.tdCtx.font = '18px sans-serif';
            this.tdCtx.fillStyle = '#fff';
            this.tdCtx.fillText(`Punkte: ${this.tdScore}`, this.TD_WIDTH / 2, this.TD_HEIGHT / 2 + 30);
        }
    }

    private drawTower(tower: TdTower): void {
        if (!this.tdCtx) return;
        const x = tower.c * this.TD_CELL_SIZE;
        const y = tower.r * this.TD_CELL_SIZE;
        const data = this.TD_TOWER_DATA[tower.type];

        this.tdCtx.fillStyle = data.color;
        this.tdCtx.fillRect(x + 4, y + 4, this.TD_CELL_SIZE - 8, this.TD_CELL_SIZE - 8);
        this.tdCtx.strokeStyle = '#fff';
        this.tdCtx.lineWidth = 2;
        this.tdCtx.strokeRect(x + 4, y + 4, this.TD_CELL_SIZE - 8, this.TD_CELL_SIZE - 8);

        this.tdCtx.fillStyle = '#fff';
        for (let i = 0; i < tower.level; i++) {
            this.tdCtx.beginPath();
            this.tdCtx.arc(x + 10 + i * 8, y + 10, 2, 0, Math.PI * 2);
            this.tdCtx.fill();
        }

        this.tdCtx.fillStyle = '#fff';
        this.tdCtx.font = 'bold 16px sans-serif';
        this.tdCtx.textAlign = 'center';
        let symbol = 'A';
        if (tower.type === 'fire') symbol = 'F';
        if (tower.type === 'ice') symbol = 'I';
        if (tower.type === 'lightning') symbol = 'L';
        this.tdCtx.fillText(symbol, x + this.TD_CELL_SIZE / 2, y + this.TD_CELL_SIZE / 2 + 6);
    }

    private drawEnemy(enemy: TdEnemy): void {
        if (!this.tdCtx) return;
        this.tdCtx.fillStyle = enemy.color;
        this.tdCtx.beginPath();
        this.tdCtx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        this.tdCtx.fill();
        this.tdCtx.strokeStyle = '#000';
        this.tdCtx.lineWidth = 1;
        this.tdCtx.stroke();

        const barW = enemy.radius * 2;
        const barH = 4;
        const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
        this.tdCtx.fillStyle = '#000';
        this.tdCtx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 8, barW, barH);
        this.tdCtx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f1c40f' : '#e74c3c';
        this.tdCtx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 8, barW * hpPct, barH);

        if (enemy.frozen > 0) {
            this.tdCtx.strokeStyle = '#00ccff';
            this.tdCtx.beginPath();
            this.tdCtx.arc(enemy.x, enemy.y, enemy.radius + 4, 0, Math.PI * 2);
            this.tdCtx.stroke();
        }
    }

    private isPathCell(c: number, r: number): boolean {
        for (let i = 0; i < this.TD_PATH.length - 1; i++) {
            const a = this.TD_PATH[i];
            const b = this.TD_PATH[i + 1];
            const minC = Math.min(a.c, b.c);
            const maxC = Math.max(a.c, b.c);
            const minR = Math.min(a.r, b.r);
            const maxR = Math.max(a.r, b.r);
            if (c >= minC && c <= maxC && r >= minR && r <= maxR) return true;
        }
        return false;
    }

    private canPlaceTower(c: number, r: number): boolean {
        if (c < 0 || c >= this.TD_COLS || r < 0 || r >= this.TD_ROWS) return false;
        if (this.isPathCell(c, r)) return false;
        for (const tower of this.tdTowers) {
            if (tower.c === c && tower.r === r) return false;
        }
        return true;
    }

    private handleTdClick(e: MouseEvent): void {
        if (this.tdGameOver || this.tdWon || !this.tdCanvas) return;
        const rect = this.tdCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const c = Math.floor(x / this.TD_CELL_SIZE);
        const r = Math.floor(y / this.TD_CELL_SIZE);
        if (this.canPlaceTower(c, r)) {
            const data = this.TD_TOWER_DATA[this.tdSelectedTower];
            if (this.tdGold >= data.cost) {
                this.tdGold -= data.cost;
                this.tdTowers.push({
                    c, r,
                    type: this.tdSelectedTower,
                    level: 1,
                    cooldown: 0,
                    maxCooldown: data.cooldown,
                    range: data.range,
                    damage: data.damage
                });
                this.updateUi();
            }
        }
    }

    private handleTdMouseMove(e: MouseEvent): void {
        if (!this.tdCanvas) return;
        const rect = this.tdCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const c = Math.floor(x / this.TD_CELL_SIZE);
        const r = Math.floor(y / this.TD_CELL_SIZE);
        if (c >= 0 && c < this.TD_COLS && r >= 0 && r < this.TD_ROWS) {
            this.tdHoverCell = { c, r };
        } else {
            this.tdHoverCell = null;
        }
    }

    private startNextWave(): void {
        if (this.tdWaveActive || this.tdGameOver || this.tdWon) return;
        if (this.tdWave < this.TD_WAVES.length) {
            this.tdWave++;
            this.tdWaveActive = true;
            this.tdWaveSpawned = 0;
            this.tdWaveToSpawn = this.TD_WAVES[this.tdWave - 1].count;
            this.tdSpawnTimer = 0;
            this.updateUi();
        }
    }

    private updateUi(): void {
        if (this.tdGoldDisplay) this.tdGoldDisplay.textContent = String(this.tdGold);
        if (this.tdLivesDisplay) this.tdLivesDisplay.textContent = String(this.tdLives);
        if (this.tdWaveDisplay) this.tdWaveDisplay.textContent = `${this.tdWave}/${this.TD_WAVES.length}`;
        if (this.tdScoreDisplay) this.tdScoreDisplay.textContent = String(this.tdScore);
        if (this.tdStatus) {
            if (this.tdWon) {
                this.tdStatus.textContent = `🎉 Sieg! Punkte: ${this.tdScore}`;
            } else if (this.tdGameOver) {
                this.tdStatus.textContent = '💀 Game Over!';
            } else if (this.tdWaveActive) {
                this.tdStatus.textContent = `Welle ${this.tdWave} läuft...`;
            } else if (this.tdWave >= this.TD_WAVES.length) {
                this.tdStatus.textContent = 'Alle Wellen geschafft!';
            } else {
                this.tdStatus.textContent = 'Baue Türme und starte die nächste Welle!';
            }
        }
        if (this.tdNextWaveBtn) {
            this.tdNextWaveBtn.disabled = this.tdWaveActive || this.tdGameOver || this.tdWon || this.tdWave >= this.TD_WAVES.length;
        }
    }

    private setupTdTowerButtons(): void {
        const types: TdTower['type'][] = ['archer', 'fire', 'ice', 'lightning'];
        for (const type of types) {
            const btn = document.getElementById(`tdTower${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.tdSelectedTower = type;
                    document.querySelectorAll('.td-tower-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
            }
        }
    }
}

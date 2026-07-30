import { Game, GameId } from '../types/common';

interface Target {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alive: boolean;
    kind: 'duck' | 'rabbit' | 'pheasant';
    hitAnim: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export class MoorhuhnGame implements Game {
    public readonly id: GameId = 'moorhuhn';

    private readonly MOORHUEHN_WIDTH: number = 640;
    private readonly MOORHUEHN_HEIGHT: number = 400;
    private readonly TARGET_RADIUS_MIN: number = 14;
    private readonly TARGET_RADIUS_MAX: number = 22;
    private readonly DUCK_SPEED_MIN: number = 0.6;
    private readonly DUCK_SPEED_MAX: number = 2.0;
    private readonly SPAWN_INTERVAL_MS: number = 800;
    private readonly GAME_DURATION_SEC: number = 60;

    private moorhuhnInterval: ReturnType<typeof setInterval> | undefined;
    private moorhuhnAnimationFrame: number | undefined;
    private moorhuhnLastTime: number = 0;
    private moorhuhnsTargets: Target[] = [];
    private moorhuhnParticles: Particle[] = [];
    private moorhuhnScore: number = 0;
    private moorhuhnShots: number = 0;
    private moorhuhnHits: number = 0;
    private moorhuhnGameOver: boolean = false;
    private moorhuhnTimeRemaining: number = this.GAME_DURATION_SEC;
    private moorhuhnSpawnTimer: number = 0;

    private resetMoorhuhnBtn: HTMLElement | null = null;
    private moorhuhnCanvas: HTMLCanvasElement | null = null;
    private moorhuhnStatusElement: HTMLElement | null = null;

    private moorhuhnCtx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.moorhuhnCanvas = document.getElementById('moorhuhnCanvas') as HTMLCanvasElement | null;
        this.moorhuhnStatusElement = document.getElementById('moorhuhnStatus');
        this.resetMoorhuhnBtn = document.getElementById('resetMoorhuhnBtn');
        this.moorhuhnCtx = this.moorhuhnCanvas ? this.moorhuhnCanvas.getContext('2d') : null;
        this.setupEventListeners();
        this.setupMouseControl();
    }

    private setupEventListeners(): void {
        if (this.resetMoorhuhnBtn) {
            this.resetMoorhuhnBtn.addEventListener('click', () => this.init());
        }
    }

    private setupMouseControl(): void {
        if (this.moorhuhnCanvas) {
            this.moorhuhnCanvas.addEventListener('mousedown', (e: MouseEvent) => {
                if (this.moorhuhnGameOver) return;
                const rect: DOMRect = this.moorhuhnCanvas!.getBoundingClientRect();
                const mouseX: number = e.clientX - rect.left;
                const mouseY: number = e.clientY - rect.top;
                this.shoot(mouseX, mouseY);
            });
        }
    }

    private spawnTarget(): void {
        const directions: ('left' | 'right')[] = ['left', 'right'];
        const direction: 'left' | 'right' = directions[Math.floor(Math.random() * directions.length)];
        const sideMargin: number = 30;
        const startY: number = 80 + Math.random() * (this.MOORHUEHN_HEIGHT - 180);
        const kindRoll: number = Math.random();
        let kind: 'duck' | 'rabbit' | 'pheasant';
        let radius: number;
        let speed: number;
        let color: string;

        if (kindRoll < 0.5) {
            kind = 'duck';
            radius = 16 + Math.random() * 4;
            speed = this.DUCK_SPEED_MIN + Math.random() * (this.DUCK_SPEED_MAX - this.DUCK_SPEED_MIN);
            color = '#4CAF50';
        } else if (kindRoll < 0.85) {
            kind = 'rabbit';
            radius = 18 + Math.random() * 4;
            speed = (this.DUCK_SPEED_MIN + 0.3) + Math.random() * (this.DUCK_SPEED_MAX - this.DUCK_SPEED_MIN);
            color = '#FF9800';
        } else {
            kind = 'pheasant';
            radius = 20 + Math.random() * 2;
            speed = (this.DUCK_SPEED_MIN + 0.5) + Math.random() * (this.DUCK_SPEED_MAX - this.DUCK_SPEED_MIN);
            color = '#E91E63';
        }

        const startX: number = direction === 'left' ? -radius : this.MOORHUEHN_WIDTH + radius;
        const vx: number = direction === 'left' ? speed : -speed;
        const vy: number = (Math.random() - 0.5) * 0.6;

        this.moorhuhnsTargets.push({
            x: startX,
            y: startY,
            vx,
            vy,
            radius,
            alive: true,
            kind,
            hitAnim: 0,
        });
    }

    private shoot(x: number, y: number): void {
        this.moorhuhnShots++;
        let hitSomething: boolean = false;

        for (const target of this.moorhuhnsTargets) {
            if (!target.alive) continue;
            const dx: number = target.x - x;
            const dy: number = target.y - y;
            const distSq: number = dx * dx + dy * dy;
            if (distSq <= target.radius * target.radius) {
                target.alive = false;
                target.hitAnim = 12;
                this.moorhuhnHits++;
                hitSomething = true;
                this.createHitEffect(target.x, target.y, target.kind);
                const points: number = this.pointsForKind(target.kind);
                this.moorhuhnScore += points;
                if (this.moorhuhnStatusElement) {
                    this.moorhuhnStatusElement.textContent = `Punkte: ${this.moorhuhnScore} | Treffer: ${this.moorhuhnHits}/${this.moorhuhnShots} | ⏱ ${Math.ceil(this.moorhuhnTimeRemaining)}s`;
                }
                break;
            }
        }

        if (!hitSomething) {
            this.moorhuhnScore = Math.max(0, this.moorhuhnScore - 5);
            if (this.moorhuhnStatusElement) {
                this.moorhuhnStatusElement.textContent = `Punkte: ${this.moorhuhnScore} | Treffer: ${this.moorhuhnHits}/${this.moorhuhnShots} | ⏱ ${Math.ceil(this.moorhuhnTimeRemaining)}s`;
            }
        }
    }

    private pointsForKind(kind: 'duck' | 'rabbit' | 'pheasant'): number {
        switch (kind) {
            case 'duck': return 10;
            case 'rabbit': return 25;
            case 'pheasant': return 50;
            default: return 10;
        }
    }

    private createHitEffect(x: number, y: number, kind: 'duck' | 'rabbit' | 'pheasant'): void {
        let color: string;
        switch (kind) {
            case 'duck': color = '#4CAF50'; break;
            case 'rabbit': color = '#FF9800'; break;
            case 'pheasant': color = '#E91E63'; break;
            default: color = '#fff';
        }
        const particleCount: number = 8 + Math.floor(Math.random() * 6);
        for (let i = 0; i < particleCount; i++) {
            const angle: number = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
            const speed: number = 1 + Math.random() * 3;
            this.moorhuhnParticles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 18 + Math.random() * 8,
                color,
            });
        }
    }

    public init(): void {
        if (this.moorhuhnInterval) clearInterval(this.moorhuhnInterval);
        if (this.moorhuhnAnimationFrame) cancelAnimationFrame(this.moorhuhnAnimationFrame);
        if (!this.moorhuhnCanvas) return;

        this.moorhuhnsTargets = [];
        this.moorhuhnParticles = [];
        this.moorhuhnScore = 0;
        this.moorhuhnShots = 0;
        this.moorhuhnHits = 0;
        this.moorhuhnGameOver = false;
        this.moorhuhnTimeRemaining = this.GAME_DURATION_SEC;
        this.moorhuhnSpawnTimer = 0;
        this.moorhuhnLastTime = 0;

        if (this.moorhuhnStatusElement) {
            this.moorhuhnStatusElement.textContent = `Punkte: 0 | Treffer: 0/0 | ⏱ ${this.GAME_DURATION_SEC}s`;
        }

        this.spawnTarget();
        this.moorhuhnLastTime = performance.now();
        this.moorhuhnLoop(this.moorhuhnLastTime);
    }

    public cleanup(): void {
        if (this.moorhuhnInterval) {
            clearInterval(this.moorhuhnInterval);
            this.moorhuhnInterval = undefined;
        }
        if (this.moorhuhnAnimationFrame) {
            cancelAnimationFrame(this.moorhuhnAnimationFrame);
            this.moorhuhnAnimationFrame = undefined;
        }
    }

    private moorhuhnLoop(timestamp: number): void {
        if (!this.moorhuhnCanvas || !this.moorhuhnCtx) return;

        const deltaSec: number = (timestamp - this.moorhuhnLastTime) / 1000;
        this.moorhuhnLastTime = timestamp;

        this.update(deltaSec);
        this.draw();

        if (!this.moorhuhnGameOver) {
            this.moorhuhnAnimationFrame = requestAnimationFrame(this.moorhuhnLoop.bind(this));
        }
    }

    private update(deltaSec: number): void {
        if (this.moorhuhnGameOver) return;

        this.moorhuhnTimeRemaining -= deltaSec;
        // Status-Text jedes Frame aktualisieren (Countdown, Punkte)
        if (this.moorhuhnStatusElement && !this.moorhuhnGameOver) {
            this.moorhuhnStatusElement.textContent = `Punkte: ${this.moorhuhnScore} | Treffer: ${this.moorhuhnHits}/${this.moorhuhnShots} | ⏱ ${Math.ceil(this.moorhuhnTimeRemaining)}s`;
        }
        if (this.moorhuhnTimeRemaining <= 0) {
            this.moorhuhnTimeRemaining = 0;
            this.endGame();
            return;
        }

        this.moorhuhnSpawnTimer += deltaSec * 1000;
        if (this.moorhuhnSpawnTimer >= this.SPAWN_INTERVAL_MS) {
            this.moorhuhnSpawnTimer -= this.SPAWN_INTERVAL_MS;
            this.spawnTarget();
        }

        for (const target of this.moorhuhnsTargets) {
            if (!target.alive) {
                if (target.hitAnim > 0) target.hitAnim--;
                continue;
            }
            target.x += target.vx;
            target.y += target.vy;

            if (target.y < this.TARGET_RADIUS_MIN || target.y > this.MOORHUEHN_HEIGHT - this.TARGET_RADIUS_MIN) {
                target.vy *= -1;
                target.y = target.y < this.TARGET_RADIUS_MIN ? this.TARGET_RADIUS_MIN : this.MOORHUEHN_HEIGHT - this.TARGET_RADIUS_MIN;
            }

            if (target.x + target.radius < 0 || target.x - target.radius > this.MOORHUEHN_WIDTH) {
                target.alive = false;
            }
        }

        this.moorhuhnsTargets = this.moorhuhnsTargets.filter(t => t.alive || t.hitAnim > 0);

        for (let i = this.moorhuhnParticles.length - 1; i >= 0; i--) {
            const p: Particle = this.moorhuhnParticles[i];
            p.life -= deltaSec * 60;
            if (p.life <= 0) {
                this.moorhuhnParticles.splice(i, 1);
            } else {
                p.vy += 0.15;
                p.x += p.vx;
                p.y += p.vy;
            }
        }
    }

    private draw(): void {
        if (!this.moorhuhnCtx || !this.moorhuhnCanvas) return;
        const ctx: CanvasRenderingContext2D = this.moorhuhnCtx;

        ctx.clearRect(0, 0, this.MOORHUEHN_WIDTH, this.MOORHUEHN_HEIGHT);

        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, 0, this.MOORHUEHN_WIDTH, this.MOORHUEHN_HEIGHT);

        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.MOORHUEHN_WIDTH, this.MOORHUEHN_HEIGHT);

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(60 + i * 220, this.MOORHUEHN_HEIGHT - 30, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#27ae60';
            ctx.fill();
        }

        for (const target of this.moorhuhnsTargets) {
            this.drawTarget(ctx, target);
        }

        for (const p of this.moorhuhnParticles) {
            ctx.globalAlpha = Math.max(0, p.life / 30);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    private drawTarget(ctx: CanvasRenderingContext2D, target: Target): void {
        ctx.save();
        ctx.translate(target.x, target.y);

        if (target.hitAnim > 0) {
            ctx.globalAlpha = target.hitAnim / 12;
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;

        switch (target.kind) {
            case 'duck':
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(-target.radius * 0.3, -target.radius * 0.2, target.radius * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(target.radius * 0.3, -target.radius * 0.2, target.radius * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFC107';
                ctx.beginPath();
                ctx.moveTo(-target.radius * 0.15, -target.radius * 0.1);
                ctx.lineTo(-target.radius * 0.05, target.radius * 0.15);
                ctx.lineTo(target.radius * 0.05, -target.radius * 0.1);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(-target.radius * 0.3, -target.radius * 0.3, target.radius * 0.12, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(target.radius * 0.3, -target.radius * 0.3, target.radius * 0.12, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'rabbit':
                ctx.fillStyle = '#FF9800';
                ctx.beginPath();
                ctx.arc(0, 0, target.radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(-target.radius * 0.35, -target.radius * 0.15, target.radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(target.radius * 0.35, -target.radius * 0.15, target.radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(-target.radius * 0.35, -target.radius * 0.25, target.radius * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(target.radius * 0.35, -target.radius * 0.25, target.radius * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FF9800';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(-target.radius * 0.55, target.radius * 0.2, target.radius * 0.18, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(target.radius * 0.55, target.radius * 0.2, target.radius * 0.18, 0, Math.PI * 2);
                ctx.stroke();
                break;

            case 'pheasant':
                ctx.fillStyle = '#E91E63';
                ctx.beginPath();
                ctx.ellipse(0, 0, target.radius * 0.75, target.radius * 0.55, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(-target.radius * 0.3, -target.radius * 0.4);
                ctx.lineTo(-target.radius * 0.1, -target.radius * 0.65);
                ctx.lineTo(target.radius * 0.1, -target.radius * 0.55);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(-target.radius * 0.3, -target.radius * 0.15, target.radius * 0.18, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(target.radius * 0.3, -target.radius * 0.15, target.radius * 0.18, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(-target.radius * 0.3, -target.radius * 0.22, target.radius * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(target.radius * 0.3, -target.radius * 0.22, target.radius * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#BA68C8';
                ctx.beginPath();
                ctx.moveTo(0, target.radius * 0.55);
                ctx.lineTo(-target.radius * 0.3, target.radius * 0.8);
                ctx.lineTo(target.radius * 0.3, target.radius * 0.8);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    private endGame(): void {
        this.moorhuhnGameOver = true;
        if (this.moorhuhnStatusElement) {
            this.moorhuhnStatusElement.textContent = `Zeit um! Punkte: ${this.moorhuhnScore} | Treffer: ${this.moorhuhnHits}/${this.moorhuhnShots}`;
        }
    }
}

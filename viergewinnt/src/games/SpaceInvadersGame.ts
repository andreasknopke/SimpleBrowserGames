import { Game, GameId, Alien, Bullet } from '../types/common';

export class SpaceInvadersGame implements Game {
    public readonly id: GameId = 'spaceInvaders';

    private readonly SI_ALIEN_ROWS: number = 4;
    private readonly SI_ALIEN_COLS: number = 8;
    private readonly SI_ALIEN_WIDTH: number = 30;
    private readonly SI_ALIEN_HEIGHT: number = 20;
    private readonly SI_ALIEN_GAP: number = 10;
    private readonly SI_ALIEN_OFFSET_TOP: number = 40;
    private readonly SI_ALIEN_OFFSET_LEFT: number = 20;
    private readonly SI_PLAYER_WIDTH: number = 40;
    private readonly SI_PLAYER_HEIGHT: number = 20;
    private readonly SI_BULLET_WIDTH: number = 3;
    private readonly SI_BULLET_HEIGHT: number = 10;
    private readonly SI_ALIEN_BULLET_WIDTH: number = 3;
    private readonly SI_ALIEN_BULLET_HEIGHT: number = 8;

    private spaceInvadersInterval: ReturnType<typeof setInterval> | undefined;
    private siPlayerX: number = 220;
    private siBullets: Bullet[] = [];
    private siAliens: Alien[] = [];
    private siAlienBullets: Bullet[] = [];
    private siAlienDir: number = 1;
    private siAlienSpeed: number = 1;
    private siAlienDropAmount: number = 10;
    private siScore: number = 0;
    private siGameOver: boolean = false;
    private siAlienMoveTimer: number = 0;
    private siAlienMoveInterval: number = 30;

    private resetSpaceInvadersBtn: HTMLElement | null = null;
    private spaceInvadersCanvas: HTMLCanvasElement | null = null;
    private spaceInvadersStatusElement: HTMLElement | null = null;
    private spaceInvadersBtnLeft: HTMLElement | null = null;
    private spaceInvadersBtnRight: HTMLElement | null = null;
    private spaceInvadersBtnShoot: HTMLElement | null = null;

    private spaceInvadersCtx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.resetSpaceInvadersBtn = document.getElementById('resetSpaceInvadersBtn');
        this.spaceInvadersCanvas = document.getElementById('spaceInvadersCanvas') as HTMLCanvasElement | null;
        this.spaceInvadersStatusElement = document.getElementById('spaceInvadersStatus');
        this.spaceInvadersBtnLeft = document.getElementById('spaceInvadersBtnLeft');
        this.spaceInvadersBtnRight = document.getElementById('spaceInvadersBtnRight');
        this.spaceInvadersBtnShoot = document.getElementById('spaceInvadersBtnShoot');

        this.spaceInvadersCtx = this.spaceInvadersCanvas ? this.spaceInvadersCanvas.getContext('2d') : null;

        this.setupEventListeners();
        this.setupMobileControls();
    }

    private setupEventListeners(): void {
        if (this.resetSpaceInvadersBtn) {
            this.resetSpaceInvadersBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        if (this.spaceInvadersInterval) clearInterval(this.spaceInvadersInterval);
        if (!this.spaceInvadersCanvas) return;
        this.siPlayerX = (this.spaceInvadersCanvas.width - this.SI_PLAYER_WIDTH) / 2;
        this.siBullets = [];
        this.siAlienBullets = [];
        this.siScore = 0;
        this.siGameOver = false;
        this.siAlienDir = 1;
        this.siAlienSpeed = 1;
        this.siAlienMoveTimer = 0;
        this.siAlienMoveInterval = 30;
        if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = 'Punkte: 0';

        this.siAliens = [];
        for (let r = 0; r < this.SI_ALIEN_ROWS; r++) {
            for (let c = 0; c < this.SI_ALIEN_COLS; c++) {
                this.siAliens.push({
                    x: this.SI_ALIEN_OFFSET_LEFT + c * (this.SI_ALIEN_WIDTH + this.SI_ALIEN_GAP),
                    y: this.SI_ALIEN_OFFSET_TOP + r * (this.SI_ALIEN_HEIGHT + this.SI_ALIEN_GAP),
                    alive: true,
                    row: r
                });
            }
        }

        this.spaceInvadersInterval = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }

    public cleanup(): void {
        if (this.spaceInvadersInterval) {
            clearInterval(this.spaceInvadersInterval);
            this.spaceInvadersInterval = undefined;
        }
    }

    public handleKeyDown(e: KeyboardEvent): void {
        if (!this.spaceInvadersCanvas) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.siPlayerX = Math.max(0, this.siPlayerX - 15);
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.siPlayerX = Math.min(this.spaceInvadersCanvas.width - this.SI_PLAYER_WIDTH, this.siPlayerX + 15);
        }
        if (e.key === ' ' || e.key === 'Space') {
            if (this.siBullets.length < 3) {
                this.siBullets.push({
                    x: this.siPlayerX + this.SI_PLAYER_WIDTH / 2 - this.SI_BULLET_WIDTH / 2,
                    y: this.spaceInvadersCanvas.height - 38
                });
            }
        }
        e.preventDefault();
    }

    public handleKeyUp(_e: KeyboardEvent): void {
        // No-op for space invaders
    }

    private update(): void {
        if (this.siGameOver) return;

        this.siAlienMoveTimer++;
        if (this.siAlienMoveTimer >= this.siAlienMoveInterval) {
            this.siAlienMoveTimer = 0;
            let shouldDrop: boolean = false;
            const aliveAliens: Alien[] = this.siAliens.filter(a => a.alive);

            for (const alien of aliveAliens) {
                if (!this.spaceInvadersCanvas) return;
                if ((this.siAlienDir === 1 && alien.x + this.SI_ALIEN_WIDTH >= this.spaceInvadersCanvas.width - 10) ||
                    (this.siAlienDir === -1 && alien.x <= 10)) {
                    shouldDrop = true;
                    break;
                }
            }

            if (shouldDrop) {
                this.siAlienDir *= -1;
                for (const alien of aliveAliens) {
                    alien.y += this.siAlienDropAmount;
                }
                if (aliveAliens.length > 0) {
                    const minRow: number = Math.min(...aliveAliens.map(a => a.row));
                    this.siAlienMoveInterval = Math.max(5, 30 - minRow * 5);
                }
            } else {
                for (const alien of aliveAliens) {
                    alien.x += this.siAlienDir * this.siAlienSpeed;
                }
            }

            if (aliveAliens.length > 0 && Math.random() < 0.3) {
                const shooter: Alien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
                this.siAlienBullets.push({
                    x: shooter.x + this.SI_ALIEN_WIDTH / 2,
                    y: shooter.y + this.SI_ALIEN_HEIGHT,
                    speed: 3
                });
            }

            for (const alien of aliveAliens) {
                if (!this.spaceInvadersCanvas) return;
                if (alien.y + this.SI_ALIEN_HEIGHT >= this.spaceInvadersCanvas.height - this.SI_PLAYER_HEIGHT - 20) {
                    this.siGameOver = true;
                    if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${this.siScore}`;
                    if (this.spaceInvadersInterval) clearInterval(this.spaceInvadersInterval);
                    return;
                }
            }

            if (aliveAliens.length === 0) {
                this.siAlienSpeed += 0.5;
                this.siAlienMoveInterval = Math.max(5, 30 - this.siAlienSpeed * 3);
                for (let r = 0; r < this.SI_ALIEN_ROWS; r++) {
                    for (let c = 0; c < this.SI_ALIEN_COLS; c++) {
                        this.siAliens.push({
                            x: this.SI_ALIEN_OFFSET_LEFT + c * (this.SI_ALIEN_WIDTH + this.SI_ALIEN_GAP),
                            y: this.SI_ALIEN_OFFSET_TOP + r * (this.SI_ALIEN_HEIGHT + this.SI_ALIEN_GAP),
                            alive: true,
                            row: r
                        });
                    }
                }
            }
        }

        for (let i = this.siBullets.length - 1; i >= 0; i--) {
            this.siBullets[i].y -= 5;
            if (this.siBullets[i].y < 0) {
                this.siBullets.splice(i, 1);
            }
        }

        for (let i = this.siAlienBullets.length - 1; i >= 0; i--) {
            this.siAlienBullets[i].y! += this.siAlienBullets[i].speed!;
            if (this.siAlienBullets[i].y! > (this.spaceInvadersCanvas ? this.spaceInvadersCanvas.height : 0)) {
                this.siAlienBullets.splice(i, 1);
            }
        }

        for (let i = this.siBullets.length - 1; i >= 0; i--) {
            const bullet: Bullet = this.siBullets[i];
            for (const alien of this.siAliens) {
                if (alien.alive &&
                    bullet.x < alien.x + this.SI_ALIEN_WIDTH &&
                    bullet.x + this.SI_BULLET_WIDTH > alien.x &&
                    bullet.y < alien.y + this.SI_ALIEN_HEIGHT &&
                    bullet.y + this.SI_BULLET_HEIGHT > alien.y) {
                    alien.alive = false;
                    this.siBullets.splice(i, 1);
                    this.siScore += (this.SI_ALIEN_ROWS - alien.row) * 10;
                    if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = `Punkte: ${this.siScore}`;
                    break;
                }
            }
        }

        for (const bullet of this.siAlienBullets) {
            if (!this.spaceInvadersCanvas) return;
            if (bullet.x < this.siPlayerX + this.SI_PLAYER_WIDTH &&
                bullet.x + this.SI_ALIEN_BULLET_WIDTH > this.siPlayerX &&
                bullet.y < this.spaceInvadersCanvas.height - 30 &&
                bullet.y! + this.SI_ALIEN_BULLET_HEIGHT > this.spaceInvadersCanvas.height - 30) {
                this.siGameOver = true;
                if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${this.siScore}`;
                if (this.spaceInvadersInterval) clearInterval(this.spaceInvadersInterval);
                return;
            }
        }
    }

    private draw(): void {
        if (!this.spaceInvadersCtx || !this.spaceInvadersCanvas) return;
        this.spaceInvadersCtx.clearRect(0, 0, this.spaceInvadersCanvas.width, this.spaceInvadersCanvas.height);

        const colors: string[] = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
        for (const alien of this.siAliens) {
            if (!alien.alive) continue;
            this.spaceInvadersCtx.fillStyle = colors[alien.row % colors.length];
            this.spaceInvadersCtx.fillRect(alien.x, alien.y, this.SI_ALIEN_WIDTH, this.SI_ALIEN_HEIGHT);
            this.spaceInvadersCtx.fillStyle = '#000';
            this.spaceInvadersCtx.fillRect(alien.x + 7, alien.y + 6, 5, 5);
            this.spaceInvadersCtx.fillRect(alien.x + 18, alien.y + 6, 5, 5);
        }

        this.spaceInvadersCtx.fillStyle = '#00ff00';
        this.spaceInvadersCtx.fillRect(this.siPlayerX, this.spaceInvadersCanvas.height - 30, this.SI_PLAYER_WIDTH, this.SI_PLAYER_HEIGHT);
        this.spaceInvadersCtx.fillRect(this.siPlayerX + this.SI_PLAYER_WIDTH / 2 - 3, this.spaceInvadersCanvas.height - 38, 6, 8);

        this.spaceInvadersCtx.fillStyle = '#ffff00';
        for (const bullet of this.siBullets) {
            this.spaceInvadersCtx.fillRect(bullet.x, bullet.y, this.SI_BULLET_WIDTH, this.SI_BULLET_HEIGHT);
        }

        this.spaceInvadersCtx.fillStyle = '#ff4444';
        for (const bullet of this.siAlienBullets) {
            this.spaceInvadersCtx.fillRect(bullet.x, bullet.y, this.SI_ALIEN_BULLET_WIDTH, this.SI_ALIEN_BULLET_HEIGHT);
        }
    }

    private setupMobileControls(): void {
        const addControl = (btn: HTMLElement | null, action: () => void): void => {
            if (!btn) return;
            btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); action(); });
            btn.addEventListener('click', (e: Event) => { e.preventDefault(); action(); });
        };
        addControl(this.spaceInvadersBtnLeft, () => {
            if (!this.siGameOver) this.siPlayerX = Math.max(0, this.siPlayerX - 15);
        });
        addControl(this.spaceInvadersBtnRight, () => {
            if (!this.siGameOver) this.siPlayerX = Math.min(this.spaceInvadersCanvas ? this.spaceInvadersCanvas.width - this.SI_PLAYER_WIDTH : 0, this.siPlayerX + 15);
        });
        addControl(this.spaceInvadersBtnShoot, () => {
            if (!this.siGameOver && this.siBullets.length < 3 && this.spaceInvadersCanvas) {
                this.siBullets.push({
                    x: this.siPlayerX + this.SI_PLAYER_WIDTH / 2 - this.SI_BULLET_WIDTH / 2,
                    y: this.spaceInvadersCanvas.height - 38
                });
            }
        });
    }
}

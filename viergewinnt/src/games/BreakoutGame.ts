import { Game, GameId, Brick } from '../types/common';

export class BreakoutGame implements Game {
    public readonly id: GameId = 'breakout';

    private readonly BREAKOUT_PADDLE_WIDTH: number = 80;
    private readonly BREAKOUT_PADDLE_HEIGHT: number = 12;
    private readonly BREAKOUT_BRICK_ROWS: number = 5;
    private readonly BREAKOUT_BRICK_COLS: number = 8;
    private readonly BREAKOUT_BRICK_WIDTH: number = 52;
    private readonly BREAKOUT_BRICK_HEIGHT: number = 18;
    private readonly BREAKOUT_BRICK_GAP: number = 6;
    private readonly BREAKOUT_BRICK_OFFSET_TOP: number = 40;
    private readonly BREAKOUT_BRICK_OFFSET_LEFT: number = 10;
    private readonly BREAKOUT_BALL_RADIUS: number = 6;
    private readonly BREAKOUT_PADDLE_SPEED: number = 6;

    private breakoutInterval: ReturnType<typeof setInterval> | undefined;
    private breakoutPaddleX: number = 200;
    private breakoutBallX: number = 240;
    private breakoutBallY: number = 350;
    private breakoutBallDX: number = 3;
    private breakoutBallDY: number = -3;
    private breakoutBricks: Brick[] = [];
    private breakoutScore: number = 0;
    private breakoutLives: number = 3;
    private breakoutGameOver: boolean = false;
    private breakoutPaddleMoving: number = 0;

    private resetBreakoutBtn: HTMLElement | null = null;
    private breakoutCanvas: HTMLCanvasElement | null = null;
    private breakoutStatusElement: HTMLElement | null = null;
    private breakoutBtnLeft: HTMLElement | null = null;
    private breakoutBtnRight: HTMLElement | null = null;

    private breakoutCtx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.resetBreakoutBtn = document.getElementById('resetBreakoutBtn');
        this.breakoutCanvas = document.getElementById('breakoutCanvas') as HTMLCanvasElement | null;
        this.breakoutStatusElement = document.getElementById('breakoutStatus');
        this.breakoutBtnLeft = document.getElementById('breakoutBtnLeft');
        this.breakoutBtnRight = document.getElementById('breakoutBtnRight');

        this.breakoutCtx = this.breakoutCanvas ? this.breakoutCanvas.getContext('2d') : null;

        this.setupEventListeners();
        this.setupMobileControls();
    }

    private setupEventListeners(): void {
        if (this.resetBreakoutBtn) {
            this.resetBreakoutBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        if (this.breakoutInterval) clearInterval(this.breakoutInterval);
        if (!this.breakoutCanvas) return;
        this.breakoutPaddleX = (this.breakoutCanvas.width - this.BREAKOUT_PADDLE_WIDTH) / 2;
        this.breakoutBallX = this.breakoutCanvas.width / 2;
        this.breakoutBallY = this.breakoutCanvas.height - 40;
        this.breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
        this.breakoutBallDY = -3;
        this.breakoutScore = 0;
        this.breakoutLives = 3;
        this.breakoutGameOver = false;
        this.breakoutPaddleMoving = 0;

        this.breakoutBricks = [];
        const brickColors: string[] = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff'];
        for (let r = 0; r < this.BREAKOUT_BRICK_ROWS; r++) {
            for (let c = 0; c < this.BREAKOUT_BRICK_COLS; c++) {
                this.breakoutBricks.push({
                    x: this.BREAKOUT_BRICK_OFFSET_LEFT + c * (this.BREAKOUT_BRICK_WIDTH + this.BREAKOUT_BRICK_GAP),
                    y: this.BREAKOUT_BRICK_OFFSET_TOP + r * (this.BREAKOUT_BRICK_HEIGHT + this.BREAKOUT_BRICK_GAP),
                    color: brickColors[r],
                    alive: true
                });
            }
        }

        if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Punkte: 0 | Leben: ${this.breakoutLives}`;

        this.breakoutInterval = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }

    public cleanup(): void {
        if (this.breakoutInterval) {
            clearInterval(this.breakoutInterval);
            this.breakoutInterval = undefined;
        }
    }

    public handleKeyDown(e: KeyboardEvent): void {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.breakoutPaddleMoving = -1;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.breakoutPaddleMoving = 1;
        }
        e.preventDefault();
    }

    public handleKeyUp(e: KeyboardEvent): void {
        if ((e.key === 'ArrowLeft' || e.key === 'a') && this.breakoutPaddleMoving === -1) {
            this.breakoutPaddleMoving = 0;
        }
        if ((e.key === 'ArrowRight' || e.key === 'd') && this.breakoutPaddleMoving === 1) {
            this.breakoutPaddleMoving = 0;
        }
        e.preventDefault();
    }

    private update(): void {
        if (this.breakoutGameOver) return;

        this.breakoutPaddleX += this.breakoutPaddleMoving * this.BREAKOUT_PADDLE_SPEED;
        if (this.breakoutCanvas) this.breakoutPaddleX = Math.max(0, Math.min(this.breakoutCanvas.width - this.BREAKOUT_PADDLE_WIDTH, this.breakoutPaddleX));

        this.breakoutBallX += this.breakoutBallDX;
        this.breakoutBallY += this.breakoutBallDY;

        if (!this.breakoutCanvas) return;
        if (this.breakoutBallX - this.BREAKOUT_BALL_RADIUS <= 0 || this.breakoutBallX + this.BREAKOUT_BALL_RADIUS >= this.breakoutCanvas.width) {
            this.breakoutBallDX = -this.breakoutBallDX;
        }
        if (this.breakoutBallY - this.BREAKOUT_BALL_RADIUS <= 0) {
            this.breakoutBallDY = -this.breakoutBallDY;
        }

        if (this.breakoutBallY + this.BREAKOUT_BALL_RADIUS >= this.breakoutCanvas.height - 30 &&
            this.breakoutBallY + this.BREAKOUT_BALL_RADIUS <= this.breakoutCanvas.height - 15 &&
            this.breakoutBallX >= this.breakoutPaddleX &&
            this.breakoutBallX <= this.breakoutPaddleX + this.BREAKOUT_PADDLE_WIDTH) {
            this.breakoutBallDY = -Math.abs(this.breakoutBallDY);
            const hitPos: number = (this.breakoutBallX - this.breakoutPaddleX) / this.BREAKOUT_PADDLE_WIDTH;
            this.breakoutBallDX = 6 * (hitPos - 0.5);
        }

        if (this.breakoutBallY + this.BREAKOUT_BALL_RADIUS > this.breakoutCanvas.height) {
            this.breakoutLives--;
            if (this.breakoutLives <= 0) {
                this.breakoutGameOver = true;
                if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Game Over! Punkte: ${this.breakoutScore}`;
                if (this.breakoutInterval) clearInterval(this.breakoutInterval);
                return;
            }
            this.breakoutBallX = this.breakoutCanvas.width / 2;
            this.breakoutBallY = this.breakoutCanvas.height - 40;
            this.breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
            this.breakoutBallDY = -3;
            if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Punkte: ${this.breakoutScore} | Leben: ${this.breakoutLives}`;
        }

        for (const brick of this.breakoutBricks) {
            if (!brick.alive) continue;
            if (this.breakoutBallX + this.BREAKOUT_BALL_RADIUS > brick.x &&
                this.breakoutBallX - this.BREAKOUT_BALL_RADIUS < brick.x + this.BREAKOUT_BRICK_WIDTH &&
                this.breakoutBallY + this.BREAKOUT_BALL_RADIUS > brick.y &&
                this.breakoutBallY - this.BREAKOUT_BALL_RADIUS < brick.y + this.BREAKOUT_BRICK_HEIGHT) {
                brick.alive = false;
                this.breakoutBallDY = -this.breakoutBallDY;
                this.breakoutScore += 10;
                if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Punkte: ${this.breakoutScore} | Leben: ${this.breakoutLives}`;
                break;
            }
        }

        if (this.breakoutBricks.every(b => !b.alive)) {
            this.breakoutGameOver = true;
            if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Gewonnen! Punkte: ${this.breakoutScore}`;
            if (this.breakoutInterval) clearInterval(this.breakoutInterval);
        }
    }

    private draw(): void {
        if (!this.breakoutCtx) return;
        this.breakoutCtx.clearRect(0, 0, this.breakoutCtx.canvas.width, this.breakoutCtx.canvas.height);

        for (const brick of this.breakoutBricks) {
            if (!brick.alive) continue;
            this.breakoutCtx.fillStyle = brick.color;
            this.breakoutCtx.fillRect(brick.x, brick.y, this.BREAKOUT_BRICK_WIDTH, this.BREAKOUT_BRICK_HEIGHT);
            this.breakoutCtx.strokeStyle = '#333';
            this.breakoutCtx.strokeRect(brick.x, brick.y, this.BREAKOUT_BRICK_WIDTH, this.BREAKOUT_BRICK_HEIGHT);
        }

        this.breakoutCtx.fillStyle = '#007bff';
        this.breakoutCtx.fillRect(this.breakoutPaddleX, this.breakoutCtx.canvas.height - 30, this.BREAKOUT_PADDLE_WIDTH, this.BREAKOUT_PADDLE_HEIGHT);

        this.breakoutCtx.beginPath();
        this.breakoutCtx.arc(this.breakoutBallX, this.breakoutBallY, this.BREAKOUT_BALL_RADIUS, 0, Math.PI * 2);
        this.breakoutCtx.fillStyle = '#fff';
        this.breakoutCtx.fill();
        this.breakoutCtx.closePath();
    }

    private setupMobileControls(): void {
        const addControl = (btn: HTMLElement | null, direction: number): void => {
            if (!btn) return;
            const start = (): void => { this.breakoutPaddleMoving = direction; };
            const stop = (): void => { this.breakoutPaddleMoving = 0; };
            btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); start(); });
            btn.addEventListener('touchend', (e: Event) => { e.preventDefault(); stop(); });
            btn.addEventListener('mousedown', (e: Event) => { e.preventDefault(); start(); });
            btn.addEventListener('mouseup', (e: Event) => { e.preventDefault(); stop(); });
        };
        addControl(this.breakoutBtnLeft, -1);
        addControl(this.breakoutBtnRight, 1);
    }
}

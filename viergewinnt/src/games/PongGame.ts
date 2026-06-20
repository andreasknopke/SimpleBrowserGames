import { Game, GameId, GameMode } from '../types/common';

export class PongGame implements Game {
    public readonly id: GameId = 'pong';

    private readonly PONG_WIDTH: number = 600;
    private readonly PONG_HEIGHT: number = 400;
    private readonly PADDLE_WIDTH: number = 10;
    private readonly PADDLE_HEIGHT: number = 60;
    private readonly BALL_SIZE: number = 8;
    private readonly PADDLE_SPEED: number = 5;
    private readonly AI_SPEED: number = 4;

    private pongInterval: ReturnType<typeof setInterval> | undefined;
    private pongMode: GameMode = '2p';
    private pongLeftY: number = 160;
    private pongRightY: number = 160;
    private pongBallX: number = 300;
    private pongBallY: number = 200;
    private pongBallDX: number = 4;
    private pongBallDY: number = 4;
    private pongLeftScore: number = 0;
    private pongRightScore: number = 0;
    private pongGameOver: boolean = false;
    private pongLeftMoving: number = 0;
    private pongRightMoving: number = 0;

    private resetPongBtn: HTMLElement | null = null;
    private pongCanvas: HTMLCanvasElement | null = null;
    private pongStatusElement: HTMLElement | null = null;
    private pongModeSelect: HTMLSelectElement | null = null;
    private pongBtnLeftUp: HTMLElement | null = null;
    private pongBtnLeftDown: HTMLElement | null = null;
    private pongBtnRightUp: HTMLElement | null = null;
    private pongBtnRightDown: HTMLElement | null = null;

    private pongCtx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.resetPongBtn = document.getElementById('resetPongBtn');
        this.pongCanvas = document.getElementById('pongCanvas') as HTMLCanvasElement | null;
        this.pongStatusElement = document.getElementById('pongStatus');
        this.pongModeSelect = document.getElementById('pongMode') as HTMLSelectElement | null;
        this.pongBtnLeftUp = document.getElementById('pongBtnLeftUp');
        this.pongBtnLeftDown = document.getElementById('pongBtnLeftDown');
        this.pongBtnRightUp = document.getElementById('pongBtnRightUp');
        this.pongBtnRightDown = document.getElementById('pongBtnRightDown');

        this.pongCtx = this.pongCanvas ? this.pongCanvas.getContext('2d') : null;

        this.setupEventListeners();
        this.setupMobileControls();
    }

    private setupEventListeners(): void {
        if (this.resetPongBtn) this.resetPongBtn.addEventListener('click', () => this.init());
        if (this.pongModeSelect) this.pongModeSelect.addEventListener('change', () => this.init());
    }

    public init(): void {
        if (this.pongInterval) clearInterval(this.pongInterval);
        this.pongMode = this.pongModeSelect ? (this.pongModeSelect.value as GameMode) : '2p';
        this.pongLeftY = 160;
        this.pongRightY = 160;
        this.pongBallX = 300;
        this.pongBallY = 200;
        this.pongBallDX = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.pongBallDY = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.pongLeftScore = 0;
        this.pongRightScore = 0;
        this.pongGameOver = false;
        this.pongLeftMoving = 0;
        this.pongRightMoving = 0;
        if (this.pongStatusElement) this.pongStatusElement.textContent = 'Player 1: 0 | Player 2: 0';
        this.draw();

        this.pongInterval = setInterval(() => {
            this.update();
            this.draw();
        }, 20);
    }

    public cleanup(): void {
        if (this.pongInterval) {
            clearInterval(this.pongInterval);
            this.pongInterval = undefined;
        }
    }

    public handleKeyDown(e: KeyboardEvent): void {
        if (this.pongGameOver) return;
        if (e.key === 'w' || e.key === 'W') this.pongLeftMoving = -1;
        if (e.key === 's' || e.key === 'S') this.pongLeftMoving = 1;
        if (e.key === 'ArrowUp') this.pongRightMoving = -1;
        if (e.key === 'ArrowDown') this.pongRightMoving = 1;
        e.preventDefault();
    }

    public handleKeyUp(e: KeyboardEvent): void {
        if (e.key === 'w' || e.key === 'W') this.pongLeftMoving = 0;
        if (e.key === 's' || e.key === 'S') this.pongLeftMoving = 0;
        if (e.key === 'ArrowUp') this.pongRightMoving = 0;
        if (e.key === 'ArrowDown') this.pongRightMoving = 0;
        e.preventDefault();
    }

    private update(): void {
        if (this.pongGameOver) return;

        this.pongLeftY += this.pongLeftMoving * this.PADDLE_SPEED;
        if (this.pongMode === '1p') {
            const target: number = this.pongBallY - this.PADDLE_HEIGHT / 2;
            const diff: number = target - this.pongRightY;
            if (Math.abs(diff) > this.AI_SPEED) {
                this.pongRightY += Math.sign(diff) * this.AI_SPEED;
            }
        } else {
            this.pongRightY += this.pongRightMoving * this.PADDLE_SPEED;
        }

        this.pongLeftY = Math.max(0, Math.min(this.PONG_HEIGHT - this.PADDLE_HEIGHT, this.pongLeftY));
        this.pongRightY = Math.max(0, Math.min(this.PONG_HEIGHT - this.PADDLE_HEIGHT, this.pongRightY));

        this.pongBallX += this.pongBallDX;
        this.pongBallY += this.pongBallDY;

        if (this.pongBallY <= 0 || this.pongBallY >= this.PONG_HEIGHT - this.BALL_SIZE) {
            this.pongBallDY = -this.pongBallDY;
        }

        if (this.pongBallX <= 10 + this.BALL_SIZE && this.pongBallX >= 10 &&
            this.pongBallY + this.BALL_SIZE >= this.pongLeftY && this.pongBallY <= this.pongLeftY + this.PADDLE_HEIGHT) {
            this.pongBallDX = -this.pongBallDX;
            this.pongBallX = 10 + this.BALL_SIZE + 1;
        }

        if (this.pongBallX >= this.PONG_WIDTH - 10 - this.BALL_SIZE && this.pongBallX <= this.PONG_WIDTH - 10 &&
            this.pongBallY + this.BALL_SIZE >= this.pongRightY && this.pongBallY <= this.pongRightY + this.PADDLE_HEIGHT) {
            this.pongBallDX = -this.pongBallDX;
            this.pongBallX = this.PONG_WIDTH - 10 - this.BALL_SIZE - 1;
        }

        if (this.pongBallX < 0) {
            this.pongRightScore++;
            this.resetBall();
        }
        if (this.pongBallX > this.PONG_WIDTH) {
            this.pongLeftScore++;
            this.resetBall();
        }

        if (this.pongStatusElement) this.pongStatusElement.textContent = `Player 1: ${this.pongLeftScore} | Player 2: ${this.pongRightScore}`;

        if (this.pongLeftScore >= 10 || this.pongRightScore >= 10) {
            this.pongGameOver = true;
            if (this.pongInterval) clearInterval(this.pongInterval);
            const winner: string = this.pongLeftScore >= 10 ? 'Player 1' : 'Player 2';
            if (this.pongStatusElement) this.pongStatusElement.textContent = `${winner} hat gewonnen! (${this.pongLeftScore}:${this.pongRightScore})`;
        }
    }

    private resetBall(): void {
        this.pongBallX = this.PONG_WIDTH / 2;
        this.pongBallY = this.PONG_HEIGHT / 2;
        this.pongBallDX = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.pongBallDY = 4 * (Math.random() > 0.5 ? 1 : -1);
    }

    private draw(): void {
        if (!this.pongCtx) return;
        this.pongCtx.clearRect(0, 0, this.PONG_WIDTH, this.PONG_HEIGHT);

        this.pongCtx.strokeStyle = '#fff';
        this.pongCtx.setLineDash([10, 10]);
        this.pongCtx.beginPath();
        this.pongCtx.moveTo(this.PONG_WIDTH / 2, 0);
        this.pongCtx.lineTo(this.PONG_WIDTH / 2, this.PONG_HEIGHT);
        this.pongCtx.stroke();
        this.pongCtx.setLineDash([]);

        this.pongCtx.fillStyle = '#fff';
        this.pongCtx.fillRect(10, this.pongLeftY, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
        this.pongCtx.fillRect(this.PONG_WIDTH - 10 - this.PADDLE_WIDTH, this.pongRightY, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
        this.pongCtx.fillRect(this.pongBallX, this.pongBallY, this.BALL_SIZE, this.BALL_SIZE);
    }

    private setupMobileControls(): void {
        const addPongControl = (btn: HTMLElement | null, side: 'left' | 'right', dir: number): void => {
            if (!btn) return;
            const start = (): void => {
                if (side === 'left') this.pongLeftMoving = dir;
                else this.pongRightMoving = dir;
            };
            const stop = (): void => {
                if (side === 'left') this.pongLeftMoving = 0;
                else this.pongRightMoving = 0;
            };
            btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); start(); });
            btn.addEventListener('touchend', (e: Event) => { e.preventDefault(); stop(); });
            btn.addEventListener('mousedown', (e: Event) => { e.preventDefault(); start(); });
            btn.addEventListener('mouseup', (e: Event) => { e.preventDefault(); stop(); });
        };
        addPongControl(this.pongBtnLeftUp, 'left', -1);
        addPongControl(this.pongBtnLeftDown, 'left', 1);
        addPongControl(this.pongBtnRightUp, 'right', -1);
        addPongControl(this.pongBtnRightDown, 'right', 1);
    }
}

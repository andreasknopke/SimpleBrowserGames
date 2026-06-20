import { Game, GameId, Position, SnakeSegment } from '../types/common';

export class SnakeGame implements Game {
    public readonly id: GameId = 'snake';

    private readonly SNAKE_SIZE: number = 20;
    private readonly SNAKE_COLS: number = 20;
    private readonly SNAKE_ROWS: number = 20;
    private readonly SNAKE_CANVAS_SIZE: number = 400;

    private snakeInterval: ReturnType<typeof setInterval> | undefined;
    private snake: SnakeSegment[] = [];
    private snakeDir: Position = { x: 1, y: 0 };
    private snakeNextDir: Position = { x: 1, y: 0 };
    private snakeFood: Position = { x: 5, y: 5 };
    private snakeScore: number = 0;
    private snakeGameOver: boolean = false;

    private resetSnakeBtn: HTMLElement | null = null;
    private snakeCanvas: HTMLCanvasElement | null = null;
    private snakeStatusElement: HTMLElement | null = null;
    private snakeBtnUp: HTMLElement | null = null;
    private snakeBtnLeft: HTMLElement | null = null;
    private snakeBtnDown: HTMLElement | null = null;
    private snakeBtnRight: HTMLElement | null = null;

    private snakeCtx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.resetSnakeBtn = document.getElementById('resetSnakeBtn');
        this.snakeCanvas = document.getElementById('snakeCanvas') as HTMLCanvasElement | null;
        this.snakeStatusElement = document.getElementById('snakeStatus');
        this.snakeBtnUp = document.getElementById('snakeBtnUp');
        this.snakeBtnLeft = document.getElementById('snakeBtnLeft');
        this.snakeBtnDown = document.getElementById('snakeBtnDown');
        this.snakeBtnRight = document.getElementById('snakeBtnRight');

        this.snakeCtx = this.snakeCanvas ? this.snakeCanvas.getContext('2d') : null;

        this.setupEventListeners();
        this.setupMobileControls();
    }

    private setupEventListeners(): void {
        if (this.resetSnakeBtn) {
            this.resetSnakeBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        if (this.snakeInterval) clearInterval(this.snakeInterval);
        this.snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
        this.snakeDir = { x: 1, y: 0 };
        this.snakeNextDir = { x: 1, y: 0 };
        this.snakeScore = 0;
        this.snakeGameOver = false;
        if (this.snakeStatusElement) this.snakeStatusElement.textContent = `Punkte: ${this.snakeScore}`;
        this.placeFood();
        this.draw();

        this.snakeInterval = setInterval(() => {
            this.snakeDir = { ...this.snakeNextDir };
            this.move();
            this.draw();
        }, 150);
    }

    public cleanup(): void {
        if (this.snakeInterval) {
            clearInterval(this.snakeInterval);
            this.snakeInterval = undefined;
        }
    }

    public handleKey(e: KeyboardEvent): void {
        if (this.snakeGameOver) return;
        switch (e.key) {
            case 'ArrowUp':
                if (this.snakeDir.y !== 1) this.snakeNextDir = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (this.snakeDir.y !== -1) this.snakeNextDir = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (this.snakeDir.x !== 1) this.snakeNextDir = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (this.snakeDir.x !== -1) this.snakeNextDir = { x: 1, y: 0 };
                break;
        }
        e.preventDefault();
    }

    private placeFood(): void {
        let free: boolean = false;
        while (!free) {
            const fx: number = Math.floor(Math.random() * this.SNAKE_COLS);
            const fy: number = Math.floor(Math.random() * this.SNAKE_ROWS);
            free = true;
            for (const seg of this.snake) {
                if (seg.x === fx && seg.y === fy) { free = false; break; }
            }
            if (free) {
                this.snakeFood = { x: fx, y: fy };
            }
        }
    }

    private move(): void {
        if (this.snakeGameOver) return;

        const head: SnakeSegment = { x: this.snake[0].x + this.snakeDir.x, y: this.snake[0].y + this.snakeDir.y };

        if (head.x < 0 || head.x >= this.SNAKE_COLS || head.y < 0 || head.y >= this.SNAKE_ROWS) {
            this.end();
            return;
        }

        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                this.end();
                return;
            }
        }

        this.snake.unshift(head);

        if (head.x === this.snakeFood.x && head.y === this.snakeFood.y) {
            this.snakeScore += 10;
            if (this.snakeStatusElement) this.snakeStatusElement.textContent = `Punkte: ${this.snakeScore}`;
            this.placeFood();
        } else {
            this.snake.pop();
        }
    }

    private end(): void {
        this.snakeGameOver = true;
        if (this.snakeInterval) clearInterval(this.snakeInterval);
        if (this.snakeStatusElement) this.snakeStatusElement.textContent = `Game Over! Punkte: ${this.snakeScore}`;
    }

    private draw(): void {
        if (!this.snakeCtx) return;
        this.snakeCtx.clearRect(0, 0, this.SNAKE_CANVAS_SIZE, this.SNAKE_CANVAS_SIZE);

        this.snakeCtx.fillStyle = '#ff0000';
        this.snakeCtx.fillRect(this.snakeFood.x * this.SNAKE_SIZE, this.snakeFood.y * this.SNAKE_SIZE, this.SNAKE_SIZE, this.SNAKE_SIZE);

        for (let i = 0; i < this.snake.length; i++) {
            const g: number = 255 - Math.floor((i / this.snake.length) * 200);
            this.snakeCtx.fillStyle = `rgb(0, ${g}, 0)`;
            this.snakeCtx.fillRect(this.snake[i].x * this.SNAKE_SIZE, this.snake[i].y * this.SNAKE_SIZE, this.SNAKE_SIZE - 1, this.SNAKE_SIZE - 1);
        }
    }

    private setupMobileControls(): void {
        const addSnakeControl = (btn: HTMLElement | null, dx: number, dy: number): void => {
            if (!btn) return;
            const handler = (): void => {
                if (this.snakeGameOver) return;
                if (dx === 0 && dy === -1 && this.snakeDir.y !== 1) this.snakeNextDir = { x: 0, y: -1 };
                else if (dx === 0 && dy === 1 && this.snakeDir.y !== -1) this.snakeNextDir = { x: 0, y: 1 };
                else if (dx === -1 && dy === 0 && this.snakeDir.x !== 1) this.snakeNextDir = { x: -1, y: 0 };
                else if (dx === 1 && dy === 0 && this.snakeDir.x !== -1) this.snakeNextDir = { x: 1, y: 0 };
            };
            btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); handler(); });
            btn.addEventListener('click', (e: Event) => { e.preventDefault(); handler(); });
        };
        addSnakeControl(this.snakeBtnUp, 0, -1);
        addSnakeControl(this.snakeBtnDown, 0, 1);
        addSnakeControl(this.snakeBtnLeft, -1, 0);
        addSnakeControl(this.snakeBtnRight, 1, 0);
    }
}

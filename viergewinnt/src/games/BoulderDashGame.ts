import { Game, GameId } from '../types/common';

// Boulder Dash cell types
const BD_EMPTY_CHAR: number = 0;
const BD_PLAYER_CHAR: number = 1;
const BD_WALL_CHAR: number = 2;
const BD_DIRT_CHAR: number = 3;
const BD_BOULDER_CHAR: number = 4;
const BD_DIAMOND_CHAR: number = 5;
const BD_MAGIC_WALL_CHAR: number = 6;

type BdCell = number;
type BdBoard = BdCell[][];

export class BoulderDashGame implements Game {
    public readonly id: GameId = 'boulderDash';

    private readonly BD_SIZE: number = 20;
    private readonly BD_CELL_SIZE: number = 20;
    private readonly BD_TARGET_COLLECT: number = 10;

    private board: BdBoard = [];
    private playerX: number = 0;
    private playerY: number = 0;
    private score: number = 0;
    private totalDiamonds: number = 0;
    private collectedDiamonds: number = 0;
    private gameOver: boolean = false;
    private won: boolean = false;
    private interval: ReturnType<typeof setInterval> | undefined;

    private resetBdBtn: HTMLElement | null = null;
    private bdCanvas: HTMLCanvasElement | null = null;
    private bdStatusElement: HTMLElement | null = null;
    private bdBtnUp: HTMLElement | null = null;
    private bdBtnDown: HTMLElement | null = null;
    private bdBtnLeft: HTMLElement | null = null;
    private bdBtnRight: HTMLElement | null = null;

    private ctx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.resetBdBtn = document.getElementById('resetBdBtn');
        this.bdCanvas = document.getElementById('bdCanvas') as HTMLCanvasElement | null;
        this.bdStatusElement = document.getElementById('bdStatus');
        this.bdBtnUp = document.getElementById('bdBtnUp');
        this.bdBtnDown = document.getElementById('bdBtnDown');
        this.bdBtnLeft = document.getElementById('bdBtnLeft');
        this.bdBtnRight = document.getElementById('bdBtnRight');

        this.ctx = this.bdCanvas ? this.bdCanvas.getContext('2d') : null;

        this.setupEventListeners();
        this.setupMobileControls();
    }

    private setupEventListeners(): void {
        if (this.resetBdBtn) {
            this.resetBdBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        if (this.interval) clearInterval(this.interval);
        this.score = 0;
        this.collectedDiamonds = 0;
        this.totalDiamonds = 0;
        this.gameOver = false;
        this.won = false;

        this.generateCave();

        for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
                if (this.board[y][x] === BD_PLAYER_CHAR) {
                    this.playerX = x;
                    this.playerY = y;
                }
            }
        }

        this.totalDiamonds = 0;
        for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
                if (this.board[y][x] === BD_DIAMOND_CHAR) {
                    this.totalDiamonds++;
                }
            }
        }
        if (this.totalDiamonds < this.BD_TARGET_COLLECT) {
            this.totalDiamonds = this.BD_TARGET_COLLECT;
        }

        this.updateStatus();
        this.draw();

        this.interval = setInterval(() => {
            this.updatePhysics();
            this.draw();
            this.checkWinCondition();
        }, 100);
    }

    public cleanup(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    public handleKey(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                e.preventDefault();
                this.movePlayer(0, -1);
                break;
            case 'ArrowDown': case 's': case 'S':
                e.preventDefault();
                this.movePlayer(0, 1);
                break;
            case 'ArrowLeft': case 'a': case 'A':
                e.preventDefault();
                this.movePlayer(-1, 0);
                break;
            case 'ArrowRight': case 'd': case 'D':
                e.preventDefault();
                this.movePlayer(1, 0);
                break;
        }
    }

    private generateCave(): void {
        this.board = [];
        for (let y = 0; y < this.BD_SIZE; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BD_SIZE; x++) {
                this.board[y][x] = BD_DIRT_CHAR;
            }
        }

        for (let x = 0; x < this.BD_SIZE; x++) {
            this.board[0][x] = BD_WALL_CHAR;
            this.board[this.BD_SIZE - 1][x] = BD_WALL_CHAR;
        }
        for (let y = 0; y < this.BD_SIZE; y++) {
            this.board[y][0] = BD_WALL_CHAR;
            this.board[y][this.BD_SIZE - 1] = BD_WALL_CHAR;
        }

        const numWalls: number = 8 + Math.floor(Math.random() * 8);
        for (let i = 0; i < numWalls; i++) {
            const x: number = 2 + Math.floor(Math.random() * (this.BD_SIZE - 4));
            const y: number = 2 + Math.floor(Math.random() * (this.BD_SIZE - 4));
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    if (y + dy < this.BD_SIZE - 1 && x + dx < this.BD_SIZE - 1) {
                        this.board[y + dy][x + dx] = BD_WALL_CHAR;
                    }
                }
            }
        }

        const numBoulders: number = 10 + Math.floor(Math.random() * 9);
        for (let i = 0; i < numBoulders; i++) {
            const x: number = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            const y: number = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            if (this.board[y][x] === BD_DIRT_CHAR) {
                this.board[y][x] = BD_BOULDER_CHAR;
            }
        }

        const numDiamonds: number = 15 + Math.floor(Math.random() * 11);
        for (let i = 0; i < numDiamonds; i++) {
            const x: number = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            const y: number = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            if (this.board[y][x] === BD_DIRT_CHAR) {
                this.board[y][x] = BD_DIAMOND_CHAR;
            }
        }

        this.board[2][2] = BD_PLAYER_CHAR;
        this.playerX = 2;
        this.playerY = 2;

        const mwX: number = this.BD_SIZE - 3;
        const mwY: number = this.BD_SIZE - 3;
        if (this.board[mwY][mwX] === BD_DIRT_CHAR) {
            this.board[mwY][mwX] = BD_MAGIC_WALL_CHAR;
        }
    }

    private updateStatus(): void {
        if (this.bdStatusElement) {
            if (this.won) {
                this.bdStatusElement.textContent = `🎉 Gewonnen! 💎 ${this.collectedDiamonds}/${this.totalDiamonds}  Punkte: ${this.score}`;
            } else if (this.gameOver) {
                this.bdStatusElement.textContent = `💀 Game Over! 💎 ${this.collectedDiamonds}/${this.totalDiamonds}`;
            } else {
                this.bdStatusElement.textContent = `Sammle 💎 ${this.collectedDiamonds}/${this.totalDiamonds}  Punkte: ${this.score}`;
            }
        }
    }

    private draw(): void {
        if (!this.ctx || !this.bdCanvas) return;
        const cs: number = this.BD_CELL_SIZE;

        this.ctx.clearRect(0, 0, this.bdCanvas.width, this.bdCanvas.height);

        for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
                const cell: number = this.board[y][x];
                const px: number = x * cs;
                const py: number = y * cs;

                switch (cell) {
                    case BD_EMPTY_CHAR:
                        this.ctx.fillStyle = '#1a1a2e';
                        this.ctx.fillRect(px, py, cs, cs);
                        break;
                    case BD_WALL_CHAR:
                        this.ctx.fillStyle = '#555';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.strokeStyle = '#777';
                        this.ctx.strokeRect(px, py, cs, cs);
                        break;
                    case BD_DIRT_CHAR:
                        this.ctx.fillStyle = '#8B4513';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#A0522D';
                        this.ctx.fillRect(px + 4, py + 4, 3, 3);
                        this.ctx.fillRect(px + 12, py + 10, 3, 3);
                        this.ctx.fillRect(px + 7, py + 15, 3, 3);
                        break;
                    case BD_BOULDER_CHAR:
                        this.ctx.fillStyle = '#888';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#aaa';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 6, py + 6, 5, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillStyle = '#666';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 14, py + 14, 5, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case BD_DIAMOND_CHAR:
                        this.ctx.fillStyle = '#00ffff';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#00ced1';
                        this.ctx.beginPath();
                        this.ctx.moveTo(px + 10, py + 2);
                        this.ctx.lineTo(px + 18, py + 10);
                        this.ctx.lineTo(px + 10, py + 18);
                        this.ctx.lineTo(px + 2, py + 10);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.strokeStyle = '#fff';
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                        this.ctx.lineWidth = 1;
                        break;
                    case BD_PLAYER_CHAR:
                        this.ctx.fillStyle = '#1a1a2e';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#ffd700';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 10, py + 10, 7, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillStyle = '#000';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 8, py + 8, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.beginPath();
                        this.ctx.arc(px + 12, py + 8, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.strokeStyle = '#000';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 10, py + 12, 3, 0, Math.PI);
                        this.ctx.stroke();
                        break;
                    case BD_MAGIC_WALL_CHAR:
                        this.ctx.fillStyle = '#1a1a2e';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#ff00ff';
                        this.ctx.fillRect(px + 2, py + 2, cs - 4, cs - 4);
                        this.ctx.fillStyle = '#ff69b4';
                        this.ctx.fillRect(px + 5, py + 5, cs - 10, cs - 10);
                        this.ctx.fillStyle = '#ff00ff';
                        this.ctx.font = '10px monospace';
                        this.ctx.fillText('★', px + 5, py + 15);
                        break;
                }
            }
        }

        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.BD_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cs, 0);
            this.ctx.lineTo(i * cs, this.bdCanvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * cs);
            this.ctx.lineTo(this.bdCanvas.width, i * cs);
            this.ctx.stroke();
        }
    }

    private movePlayer(dx: number, dy: number): void {
        if (this.gameOver || this.won) return;

        const nx: number = this.playerX + dx;
        const ny: number = this.playerY + dy;

        if (nx < 1 || nx >= this.BD_SIZE - 1 || ny < 1 || ny >= this.BD_SIZE - 1) return;

        const target: number = this.board[ny][nx];

        if (target === BD_WALL_CHAR || target === BD_BOULDER_CHAR) return;

        if (target === BD_DIRT_CHAR || target === BD_EMPTY_CHAR) {
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            this.draw();
            return;
        }

        if (target === BD_DIAMOND_CHAR) {
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            this.collectedDiamonds++;
            this.score += 10;
            this.updateStatus();
            this.draw();
            this.checkWinCondition();
            return;
        }

        if (target === BD_MAGIC_WALL_CHAR) {
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            for (let dy2 = -1; dy2 <= 1; dy2++) {
                for (let dx2 = -1; dx2 <= 1; dx2++) {
                    const mx: number = nx + dx2;
                    const my: number = ny + dy2;
                    if (mx >= 1 && mx < this.BD_SIZE - 1 && my >= 1 && my < this.BD_SIZE - 1) {
                        if (this.board[my][mx] === BD_DIRT_CHAR) {
                            this.board[my][mx] = BD_EMPTY_CHAR;
                        }
                    }
                }
            }
            this.draw();
            return;
        }
    }

    private updatePhysics(): void {
        if (this.gameOver || this.won) return;

        for (let y = this.BD_SIZE - 2; y >= 1; y--) {
            for (let x = this.BD_SIZE - 2; x >= 1; x--) {
                if (this.board[y][x] === BD_BOULDER_CHAR) {
                    const below = this.board[y + 1][x];

                    if (below === BD_EMPTY_CHAR) {
                        if (y + 1 === this.playerY && x === this.playerX) {
                            this.board[y][x] = BD_EMPTY_CHAR;
                            this.board[y + 1][x] = BD_BOULDER_CHAR;
                            this.gameOver = true;
                            this.updateStatus();
                            if (this.interval) clearInterval(this.interval);
                            this.draw();
                            return;
                        }
                        this.board[y + 1][x] = BD_BOULDER_CHAR;
                        this.board[y][x] = BD_EMPTY_CHAR;
                    }
                    else if (below === BD_WALL_CHAR || below === BD_BOULDER_CHAR) {
                        const canRollLeft: boolean = (x > 1 && (this.board[y + 1][x - 1] === BD_WALL_CHAR || this.board[y + 1][x - 1] === BD_BOULDER_CHAR) && (this.board[y][x - 1] === BD_EMPTY_CHAR || this.board[y][x - 1] === BD_PLAYER_CHAR));
                        const canRollRight: boolean = (x < this.BD_SIZE - 2 && (this.board[y + 1][x + 1] === BD_WALL_CHAR || this.board[y + 1][x + 1] === BD_BOULDER_CHAR) && (this.board[y][x + 1] === BD_EMPTY_CHAR || this.board[y][x + 1] === BD_PLAYER_CHAR));

                        if (canRollLeft) {
                            if (y === this.playerY && x - 1 === this.playerX) {
                                this.board[y][x] = BD_EMPTY_CHAR;
                                this.board[y][x - 1] = BD_BOULDER_CHAR;
                                this.gameOver = true;
                                this.updateStatus();
                                if (this.interval) clearInterval(this.interval);
                                this.draw();
                                return;
                            }
                            this.board[y][x - 1] = BD_BOULDER_CHAR;
                            this.board[y][x] = BD_EMPTY_CHAR;
                        } else if (canRollRight) {
                            if (y === this.playerY && x + 1 === this.playerX) {
                                this.board[y][x] = BD_EMPTY_CHAR;
                                this.board[y][x + 1] = BD_BOULDER_CHAR;
                                this.gameOver = true;
                                this.updateStatus();
                                if (this.interval) clearInterval(this.interval);
                                this.draw();
                                return;
                            }
                            this.board[y][x + 1] = BD_BOULDER_CHAR;
                            this.board[y][x] = BD_EMPTY_CHAR;
                        }
                    }
                }
            }
        }
    }

    private checkWinCondition(): void {
        if (this.collectedDiamonds >= this.BD_TARGET_COLLECT && !this.won && !this.gameOver) {
            this.won = true;
            this.score += 50;
            this.updateStatus();
            if (this.interval) clearInterval(this.interval);
            this.draw();
        }
    }

    private setupMobileControls(): void {
        const addBdControl = (btn: HTMLElement | null, dx: number, dy: number): void => {
            if (!btn) return;
            const action = (): void => {
                this.movePlayer(dx, dy);
                this.draw();
                this.checkWinCondition();
            };
            btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); action(); });
            btn.addEventListener('mousedown', (e: Event) => { e.preventDefault(); action(); });
        };
        addBdControl(this.bdBtnUp, 0, -1);
        addBdControl(this.bdBtnDown, 0, 1);
        addBdControl(this.bdBtnLeft, -1, 0);
        addBdControl(this.bdBtnRight, 1, 0);
    }
}

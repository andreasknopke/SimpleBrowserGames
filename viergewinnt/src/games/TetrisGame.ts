import { Game, GameId, PieceData, Position } from '../types/common';

export class TetrisGame implements Game {
    public readonly id: GameId = 'tetris';

    private readonly TETRIS_ROWS: number = 20;
    private readonly TETRIS_COLS: number = 10;
    private readonly BLOCK_SIZE: number = 20;

    private readonly PIECES_DATA: PieceData[] = [
        { shape: [[1, 1, 1, 1]], color: '#00ffff' },
        { shape: [[1, 1], [1, 1]], color: '#ffff00' },
        { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' },
        { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' },
        { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' },
        { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' },
        { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffa500' }
    ];

    private tetrisInterval: ReturnType<typeof setInterval> | undefined;
    private tetrisScore: number = 0;
    private tetrisBoard: (string | null)[][] = [];
    private currentPiece: number[][] | null = null;
    private currentPiecePos: Position = { x: 0, y: 0 };
    private currentPieceColor: string = '';
    private nextPieceIndex: number = -1;

    private resetTetrisBtn: HTMLElement | null = null;
    private tetrisCanvas: HTMLCanvasElement | null = null;
    private tetrisStatusElement: HTMLElement | null = null;
    private nextPieceCanvas: HTMLCanvasElement | null = null;
    private tetrisBtnLeft: HTMLElement | null = null;
    private tetrisBtnRight: HTMLElement | null = null;
    private tetrisBtnDown: HTMLElement | null = null;
    private tetrisBtnRotate: HTMLElement | null = null;

    private ctx: CanvasRenderingContext2D | null = null;
    private nextCtx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.resetTetrisBtn = document.getElementById('resetTetrisBtn');
        this.tetrisCanvas = document.getElementById('tetrisCanvas') as HTMLCanvasElement | null;
        this.tetrisStatusElement = document.getElementById('tetrisStatus');
        this.nextPieceCanvas = document.getElementById('nextPieceCanvas') as HTMLCanvasElement | null;
        this.tetrisBtnLeft = document.getElementById('tetrisBtnLeft');
        this.tetrisBtnRight = document.getElementById('tetrisBtnRight');
        this.tetrisBtnDown = document.getElementById('tetrisBtnDown');
        this.tetrisBtnRotate = document.getElementById('tetrisBtnRotate');

        this.ctx = this.tetrisCanvas ? this.tetrisCanvas.getContext('2d') : null;
        this.nextCtx = this.nextPieceCanvas ? this.nextPieceCanvas.getContext('2d') : null;

        this.setupEventListeners();
        this.setupMobileControls();
    }

    private setupEventListeners(): void {
        if (this.resetTetrisBtn) {
            this.resetTetrisBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        if (this.tetrisInterval) clearInterval(this.tetrisInterval);
        this.tetrisBoard = Array.from({ length: this.TETRIS_ROWS }, () => Array(this.TETRIS_COLS).fill(null));
        this.tetrisScore = 0;
        this.nextPieceIndex = -1;
        if (this.tetrisStatusElement) this.tetrisStatusElement.textContent = `Punkte: ${this.tetrisScore}`;

        this.spawnPiece();

        this.tetrisInterval = setInterval(() => {
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
            }
            this.draw();
        }, 500);
    }

    public cleanup(): void {
        if (this.tetrisInterval) {
            clearInterval(this.tetrisInterval);
            this.tetrisInterval = undefined;
        }
    }

    public handleKey(e: KeyboardEvent): void {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (e.key === 'ArrowLeft') this.movePiece(-1, 0);
            if (e.key === 'ArrowRight') this.movePiece(1, 0);
            if (e.key === 'ArrowDown') this.movePiece(0, 1);
            if (e.key === 'ArrowUp') this.rotatePiece();
            this.draw();
        }
    }

    private clearLines(): void {
        let linesCleared: number = 0;
        for (let r = this.TETRIS_ROWS - 1; r >= 0; r--) {
            if (this.tetrisBoard[r].every(cell => cell !== null)) {
                this.tetrisBoard.splice(r, 1);
                this.tetrisBoard.unshift(Array(this.TETRIS_COLS).fill(null));
                linesCleared++;
                r++;
            }
        }
        if (linesCleared > 0) {
            this.tetrisScore += linesCleared * 100;
            if (this.tetrisStatusElement) this.tetrisStatusElement.textContent = `Punkte: ${this.tetrisScore}`;
        }
    }

    private spawnPiece(): void {
        if (this.nextPieceIndex === -1) {
            this.nextPieceIndex = Math.floor(Math.random() * this.PIECES_DATA.length);
        }
        const index: number = this.nextPieceIndex;
        this.nextPieceIndex = Math.floor(Math.random() * this.PIECES_DATA.length);
        this.currentPiece = this.PIECES_DATA[index].shape.map(row => [...row]);
        this.currentPieceColor = this.PIECES_DATA[index].color;
        this.currentPiecePos = { x: Math.floor(this.TETRIS_COLS / 2) - 1, y: 0 };

        this.drawNextPiece();

        if (this.checkCollision(this.currentPiece, this.currentPiecePos.x, this.currentPiecePos.y)) {
            if (this.tetrisInterval) clearInterval(this.tetrisInterval);
            if (this.tetrisStatusElement) this.tetrisStatusElement.textContent = `Game Over! Punkte: ${this.tetrisScore}`;
        }
    }

    private checkCollision(piece: number[][], x: number, y: number): boolean {
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
                if (piece[r][c]) {
                    const newX: number = x + c;
                    const newY: number = y + r;
                    if (newX < 0 || newX >= this.TETRIS_COLS || newY >= this.TETRIS_ROWS || (newY >= 0 && this.tetrisBoard[newY][newX] !== null)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private movePiece(dx: number, dy: number): boolean {
        if (this.currentPiece && !this.checkCollision(this.currentPiece, this.currentPiecePos.x + dx, this.currentPiecePos.y + dy)) {
            this.currentPiecePos.x += dx;
            this.currentPiecePos.y += dy;
            return true;
        }
        return false;
    }

    private rotatePiece(): void {
        if (!this.currentPiece) return;
        const rotated: number[][] = this.currentPiece[0].map((_, index: number) =>
            this.currentPiece!.map(row => row[index]).reverse()
        );
        if (!this.checkCollision(rotated, this.currentPiecePos.x, this.currentPiecePos.y)) {
            this.currentPiece = rotated;
        }
    }

    private lockPiece(): void {
        if (!this.currentPiece) return;
        for (let r = 0; r < this.currentPiece.length; r++) {
            for (let c = 0; c < this.currentPiece[r].length; c++) {
                if (this.currentPiece[r][c]) {
                    const newY: number = this.currentPiecePos.y + r;
                    const newX: number = this.currentPiecePos.x + c;
                    if (newY >= 0 && newY < this.TETRIS_ROWS) {
                        this.tetrisBoard[newY][newX] = this.currentPieceColor;
                    }
                }
            }
        }
        this.clearLines();
        this.spawnPiece();
    }

    private draw(): void {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.TETRIS_COLS * this.BLOCK_SIZE, this.TETRIS_ROWS * this.BLOCK_SIZE);
        for (let r = 0; r < this.TETRIS_ROWS; r++) {
            for (let c = 0; c < this.TETRIS_COLS; c++) {
                const cellColor: string | null = this.tetrisBoard[r][c];
                if (cellColor) {
                    this.ctx.fillStyle = cellColor;
                    this.ctx.fillRect(c * this.BLOCK_SIZE, r * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }

        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPieceColor;
            for (let r = 0; r < this.currentPiece.length; r++) {
                for (let c = 0; c < this.currentPiece[r].length; c++) {
                    if (this.currentPiece[r][c]) {
                        this.ctx.fillRect((this.currentPiecePos.x + c) * this.BLOCK_SIZE, (this.currentPiecePos.y + r) * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    }
                }
            }
        }
    }

    private drawNextPiece(): void {
        if (!this.nextCtx || !this.nextPieceCanvas) return;
        const canvasW: number = this.nextPieceCanvas.width;
        const canvasH: number = this.nextPieceCanvas.height;
        this.nextCtx.clearRect(0, 0, canvasW, canvasH);

        if (this.nextPieceIndex === -1) return;

        const piece: number[][] = this.PIECES_DATA[this.nextPieceIndex].shape;
        const color: string = this.PIECES_DATA[this.nextPieceIndex].color;
        const previewBlockSize: number = 20;

        const pieceW: number = piece[0].length * previewBlockSize;
        const pieceH: number = piece.length * previewBlockSize;
        const offsetX: number = (canvasW - pieceW) / 2;
        const offsetY: number = (canvasH - pieceH) / 2;

        this.nextCtx.fillStyle = color;
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
                if (piece[r][c]) {
                    this.nextCtx.fillRect(offsetX + c * previewBlockSize, offsetY + r * previewBlockSize, previewBlockSize, previewBlockSize);
                }
            }
        }
    }

    private setupMobileControls(): void {
        const addControl = (btn: HTMLElement | null, action: () => void): void => {
            if (!btn) return;
            btn.addEventListener('touchstart', (e: Event) => {
                e.preventDefault();
                action();
                this.draw();
            });
            btn.addEventListener('click', (e: Event) => {
                e.preventDefault();
                action();
                this.draw();
            });
        };

        addControl(this.tetrisBtnLeft, () => this.movePiece(-1, 0));
        addControl(this.tetrisBtnRight, () => this.movePiece(1, 0));
        addControl(this.tetrisBtnDown, () => this.movePiece(0, 1));
        addControl(this.tetrisBtnRotate, () => this.rotatePiece());
    }
}

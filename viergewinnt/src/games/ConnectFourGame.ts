import { Game, GameId, Player, CellValue, Board, GameMode } from '../types/common';

export class ConnectFourGame implements Game {
    public readonly id: GameId = 'fourWins';

    private readonly ROWS: number = 6;
    private readonly COLS: number = 7;
    private readonly PLAYER1: Player = 1;
    private readonly PLAYER2: Player = 2;

    private board: Board = [];
    private currentPlayer: Player = this.PLAYER1;
    private gameActive: boolean = true;
    private gameMode: GameMode = '2p';
    private difficulty: number = 1;

    private boardElement: HTMLElement | null = null;
    private statusElement: HTMLElement | null = null;
    private gameModeSelect: HTMLSelectElement | null = null;
    private difficultyContainer: HTMLElement | null = null;
    private difficultySelect: HTMLSelectElement | null = null;
    private resetBtn: HTMLElement | null = null;

    constructor() {
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('status');
        this.gameModeSelect = document.getElementById('gameMode') as HTMLSelectElement | null;
        this.difficultyContainer = document.getElementById('difficultyContainer');
        this.difficultySelect = document.getElementById('difficulty') as HTMLSelectElement | null;
        this.resetBtn = document.getElementById('resetBtn');
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (this.gameModeSelect) {
            this.gameModeSelect.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLSelectElement;
                this.gameMode = target.value as GameMode;
                if (this.difficultyContainer) {
                    this.difficultyContainer.style.display = this.gameMode === '1p' ? 'flex' : 'none';
                }
                this.init();
            });
        }

        if (this.difficultySelect) {
            this.difficultySelect.addEventListener('change', (e: Event) => {
                this.difficulty = parseInt((e.target as HTMLSelectElement).value);
                this.init();
            });
        }

        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0) as CellValue[]);
        this.currentPlayer = this.PLAYER1;
        this.gameActive = true;
        if (this.statusElement) this.statusElement.textContent = 'Spieler 1 (Rot) ist am Zug';
        this.renderBoard();
    }

    public cleanup(): void {
        // Nothing to clean up for Connect Four (no intervals)
    }

    private renderBoard(): void {
        if (!this.boardElement) return;
        this.boardElement.innerHTML = '';
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell: HTMLDivElement = document.createElement('div');
                cell.classList.add('cell');

                if (this.board[r][c] !== 0) {
                    const piece: HTMLDivElement = document.createElement('div');
                    piece.classList.add('piece');
                    piece.classList.add(this.board[r][c] === this.PLAYER1 ? 'red' : 'yellow');
                    cell.appendChild(piece);
                }

                cell.addEventListener('click', () => this.handleCellClick(c));
                this.boardElement.appendChild(cell);
            }
        }
    }

    private handleCellClick(col: number): void {
        if (!this.gameActive) return;
        if (this.board[0][col] !== 0) return;

        this.makeMoveInBoard(this.board, col, this.currentPlayer);

        if (this.checkWin(this.board, this.currentPlayer)) {
            this.endGame(this.currentPlayer);
        } else if (this.isBoardFull()) {
            this.endGame(0);
        } else {
            this.currentPlayer = this.currentPlayer === this.PLAYER1 ? this.PLAYER2 : this.PLAYER1;
            if (this.statusElement) {
                this.statusElement.textContent = this.currentPlayer === this.PLAYER1
                    ? 'Spieler 1 (Rot) ist am Zug'
                    : (this.gameMode === '1p' ? 'Computer (Gelb) ist am Zug' : 'Spieler 2 (Gelb) ist am Zug');
            }

            if (this.gameMode === '1p' && this.currentPlayer === this.PLAYER2) {
                setTimeout(() => {
                    const aiMove: number = this.getBestMove();
                    if (aiMove !== -1) {
                        this.handleCellClick(aiMove);
                    }
                }, 500);
            }
        }
        this.renderBoard();
    }

    private isBoardFull(): boolean {
        return this.board[0].every(cell => cell !== 0);
    }

    private endGame(winner: Player | 0): void {
        this.gameActive = false;
        if (!this.statusElement) return;
        if (winner === 0) {
            this.statusElement.textContent = 'Unentschieden!';
        } else {
            const winnerName: string = winner === this.PLAYER1
                ? 'Spieler 1 (Rot)'
                : (this.gameMode === '1p' ? 'Computer (Gelb)' : 'Spieler 2 (Gelb)');
            this.statusElement.textContent = `${winnerName} hat gewonnen!`;
        }
    }

    private checkWin(board: Board, player: Player): boolean {
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c <= this.COLS - 4; c++) {
                if (board[r][c] === player && board[r][c + 1] === player && board[r][c + 2] === player && board[r][c + 3] === player) return true;
            }
        }
        for (let r = 0; r <= this.ROWS - 4; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (board[r][c] === player && board[r + 1][c] === player && board[r + 2][c] === player && board[r + 3][c] === player) return true;
            }
        }
        for (let r = 0; r <= this.ROWS - 4; r++) {
            for (let c = 0; c <= this.COLS - 4; c++) {
                if (board[r][c] === player && board[r + 1][c + 1] === player && board[r + 2][c + 2] === player && board[r + 3][c + 3] === player) return true;
            }
        }
        for (let r = 3; r < this.ROWS; r++) {
            for (let c = 0; c <= this.COLS - 4; c++) {
                if (board[r][c] === player && board[r - 1][c + 1] === player && board[r - 2][c + 2] === player && board[r - 3][c + 3] === player) return true;
            }
        }
        return false;
    }

    // =============================================
    // AI Implementation (Minimax with Alpha-Beta Pruning)
    // =============================================

    private getBestMove(): number {
        let bestScore: number = -Infinity;
        let move: number = -1;
        const availableCols: number[] = this.getAvailableCols(this.board);

        for (const col of availableCols) {
            const tempBoard: Board = this.board.map(row => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
            const score: number = this.minimax(tempBoard, this.difficulty, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                move = col;
            }
        }
        return move;
    }

    private getAvailableCols(board: Board): number[] {
        const available: number[] = [];
        for (let c = 0; c < this.COLS; c++) {
            if (board[0][c] === 0) available.push(c);
        }
        return available;
    }

    private makeMoveInBoard(board: Board, col: number, player: Player): void {
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (board[r][col] === 0) {
                board[r][col] = player;
                break;
            }
        }
    }

    private minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
        if (this.checkWin(board, this.PLAYER2)) return 10000 + depth;
        if (this.checkWin(board, this.PLAYER1)) return -10000 - depth;
        if (this.isBoardFull() || depth === 0) return this.evaluateBoard(board);

        const availableCols: number[] = this.getAvailableCols(board);

        if (isMaximizing) {
            let maxEval: number = -Infinity;
            for (const col of availableCols) {
                const tempBoard: Board = board.map(row => [...row]);
                this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
                const evaluation: number = this.minimax(tempBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval: number = Infinity;
            for (const col of availableCols) {
                const tempBoard: Board = board.map(row => [...row]);
                this.makeMoveInBoard(tempBoard, col, this.PLAYER1);
                const evaluation: number = this.minimax(tempBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    private evaluateBoard(board: Board): number {
        let score: number = 0;
        for (let r = 0; r < this.ROWS; r++) {
            if (board[r][3] === this.PLAYER2) score += 3;
            else if (board[r][3] === this.PLAYER1) score -= 3;
        }
        return score;
    }
}

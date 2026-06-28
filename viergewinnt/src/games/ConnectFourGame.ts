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
    // AI Implementation (Minimax + Alpha-Beta + Heuristik)
    // =============================================

    /** Transpositionstabelle – wird pro getBestMove-Aufruf neu angelegt. */
    private transpositionTable: Map<string, number> = new Map();

    /**
     * Schwierigkeitsgrad → Suchtiefe.
     *  1 = Leicht (Tiefe 2, mit Zufall)
     *  2 = Mittel (Tiefe 4)
     *  3 = Schwer (Tiefe 6)
     *  4 = Extrem (Tiefe 8, mit Transpositionstabelle)
     */
    private getSearchDepth(): number {
        switch (this.difficulty) {
            case 1: return 2;
            case 2: return 4;
            case 3: return 6;
            case 4: return 8;
            default: return 4;
        }
    }

    /**
     * Gibt die beste Spalte zurück.
     * Reihenfolge: Sofortgewinn → Block → Minimax.
     */
    private getBestMove(): number {
        this.transpositionTable.clear();
        const availableCols: number[] = this.getAvailableCols(this.board);
        if (availableCols.length === 0) return -1;

        // --- Sofortgewinn ---
        for (const col of availableCols) {
            const tempBoard: Board = this.board.map(row => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
            if (this.checkWin(tempBoard, this.PLAYER2)) return col;
        }

        // --- Blockiere gegnerischen Sofortgewinn ---
        for (const col of availableCols) {
            const tempBoard: Board = this.board.map(row => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER1);
            if (this.checkWin(tempBoard, this.PLAYER1)) return col;
        }

        // --- Minimax mit Alpha-Beta ---
        const depth: number = this.getSearchDepth();
        let bestScore: number = -Infinity;
        let bestMoves: number[] = [];
        const orderedCols: number[] = this.orderColumns(availableCols);

        for (const col of orderedCols) {
            const tempBoard: Board = this.board.map(row => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
            const score: number = this.minimax(tempBoard, depth, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [col];
            } else if (score === bestScore) {
                bestMoves.push(col);
            }
        }

        // Bei „Leicht" (difficulty=1) mit 40 % Wahrscheinlichkeit einen
        // zufälligen Zug statt des besten wählen.
        if (this.difficulty === 1 && Math.random() < 0.4) {
            return availableCols[Math.floor(Math.random() * availableCols.length)];
        }

        // Aus gleichwertigen Zügen einen zufällig wählen (Variabilität).
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    /**
     * Spalten in der Reihenfolge „Mitte zuerst" sortieren –
     * verbessert Alpha-Beta-Pruning drastisch.
     */
    private orderColumns(cols: number[]): number[] {
        const centerDistances: number[] = [3, 2, 4, 1, 5, 0, 6];
        return cols.sort((a, b) => centerDistances.indexOf(a) - centerDistances.indexOf(b));
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

    /**
     * Minimax mit Alpha-Beta-Pruning und Transpositionstabelle.
     */
    private minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
        if (this.checkWin(board, this.PLAYER2)) return 100000 + depth;
        if (this.checkWin(board, this.PLAYER1)) return -100000 - depth;

        const availableCols: number[] = this.getAvailableCols(board);
        if (this.isBoardFull() || availableCols.length === 0 || depth === 0) {
            return this.evaluateBoard(board);
        }

        // Transpositionstabelle-Abfrage
        if (this.transpositionTable.size > 0) {
            const key: string = this.boardToKey(board);
            const cached = this.transpositionTable.get(key);
            if (cached !== undefined) return cached;
        }

        const orderedCols: number[] = this.orderColumns(availableCols);

        if (isMaximizing) {
            let maxEval: number = -Infinity;
            for (const col of orderedCols) {
                const tempBoard: Board = board.map(row => [...row]);
                this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
                const evaluation: number = this.minimax(tempBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            this.cacheBoard(board, maxEval);
            return maxEval;
        } else {
            let minEval: number = Infinity;
            for (const col of orderedCols) {
                const tempBoard: Board = board.map(row => [...row]);
                this.makeMoveInBoard(tempBoard, col, this.PLAYER1);
                const evaluation: number = this.minimax(tempBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            this.cacheBoard(board, minEval);
            return minEval;
        }
    }

    /** Board als String-Key für die Transpositionstabelle. */
    private boardToKey(board: Board): string {
        return board.map(row => row.join(',')).join('|');
    }

    /** Ergebnis im Cache speichern (nur bei Extrem-Schwer). */
    private cacheBoard(board: Board, value: number): void {
        if (this.difficulty >= 4) {
            const key: string = this.boardToKey(board);
            if (!this.transpositionTable.has(key)) {
                this.transpositionTable.set(key, value);
            }
        }
    }

    /**
     * Window-basierte Heuristik.
     * Bewertert alle 4er-Fenster (horizontal, vertikal, beide Diagonalen).
     */
    private evaluateBoard(board: Board): number {
        let score: number = 0;

        // Mittelspalten-Bonus
        for (let r = 0; r < this.ROWS; r++) {
            if (board[r][3] === this.PLAYER2) score += 4;
            else if (board[r][3] === this.PLAYER1) score -= 4;
        }

        // Horizontale Fenster
        score += this.evaluateDirection(board, 0, 1);
        // Vertikale Fenster
        score += this.evaluateDirection(board, 1, 0);
        // Diagonal ↘
        score += this.evaluateDirection(board, 1, 1);
        // Diagonal ↙
        score += this.evaluateDirection(board, -1, 1);

        return score;
    }

    /**
     * Bewertere alle 4er-Fenster in einer Richtung.
     * @param dr  Zeilen-Inkrement
     * @param dc  Spalten-Inkrement
     */
    private evaluateDirection(board: Board, dr: number, dc: number): number {
        let score: number = 0;
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const window: CellValue[] = [];
                let valid: boolean = true;
                for (let i = 0; i < 4; i++) {
                    const nr: number = r + dr * i;
                    const nc: number = c + dc * i;
                    if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) {
                        valid = false;
                        break;
                    }
                    window.push(board[nr][nc]);
                }
                if (!valid) continue;
                score += this.evaluateWindow(window);
            }
        }
        return score;
    }

    /**
     * Bewerte ein einzelnes 4er-Fenster.
     * 4 eigene → +1 000 000
     * 3 eigene + 1 leer → +50
     * 2 eigene + 2 leer → +5
     * 3 gegner + 1 leer → −80  (Defensivbias: Blocken priorisieren)
     */
    private evaluateWindow(window: CellValue[]): number {
        const aiCount: number = window.filter(v => v === this.PLAYER2).length;
        const oppCount: number = window.filter(v => v === this.PLAYER1).length;
        const emptyCount: number = window.filter(v => v === 0).length;

        if (aiCount === 4) return 1000000;
        if (aiCount === 3 && emptyCount === 1) return 50;
        if (aiCount === 2 && emptyCount === 2) return 5;
        if (oppCount === 3 && emptyCount === 1) return -80;
        return 0;
    }
}

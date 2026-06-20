import { Game, GameId, MsCellValue, MsBoard } from '../types/common';

export class MinesweeperGame implements Game {
    public readonly id: GameId = 'minesweeper';

    private msBoard: MsBoard = [];
    private msMines: [number, number][] = [];
    private msGameOver: boolean = false;
    private msFlags: number = 0;
    private msMinesCount: number = 0;

    private resetMsBtn: HTMLElement | null = null;
    private msDifficultySelect: HTMLSelectElement | null = null;
    private msBoardElement: HTMLElement | null = null;
    private msStatusElement: HTMLElement | null = null;

    constructor() {
        this.resetMsBtn = document.getElementById('resetMsBtn');
        this.msDifficultySelect = document.getElementById('msDifficulty') as HTMLSelectElement | null;
        this.msBoardElement = document.getElementById('msBoard');
        this.msStatusElement = document.getElementById('msStatus');
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (this.msDifficultySelect) {
            this.msDifficultySelect.addEventListener('change', () => this.init());
        }
        if (this.resetMsBtn) {
            this.resetMsBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        const difficulty: string = this.msDifficultySelect ? this.msDifficultySelect.value : 'easy';
        let rows: number, cols: number, mines: number;

        if (difficulty === 'easy') {
            rows = 10; cols = 10; mines = 10;
        } else if (difficulty === 'medium') {
            rows = 15; cols = 15; mines = 40;
        } else {
            rows = 20; cols = 20; mines = 80;
        }

        this.msMinesCount = mines;
        this.msFlags = 0;
        this.msGameOver = false;
        this.msBoard = Array.from({ length: rows }, () => Array(cols).fill(0) as MsCellValue[]);
        this.msMines = [];

        // Place mines
        let minesPlaced: number = 0;
        while (minesPlaced < mines) {
            const r: number = Math.floor(Math.random() * rows);
            const c: number = Math.floor(Math.random() * cols);
            if (this.msBoard[r][c] !== 'M') {
                this.msBoard[r][c] = 'M';
                this.msMines.push([r, c]);
                minesPlaced++;
            }
        }

        // Calculate numbers
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (this.msBoard[r][c] === 'M') continue;
                let count: number = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr: number = r + dr;
                        const nc: number = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && this.msBoard[nr][nc] === 'M') {
                            count++;
                        }
                    }
                }
                this.msBoard[r][c] = count;
            }
        }

        this.renderBoard(rows, cols);
        this.updateStatus();
    }

    public cleanup(): void {
        // Nothing to clean up for Minesweeper (no intervals)
    }

    private renderBoard(rows: number, cols: number): void {
        if (!this.msBoardElement) return;
        this.msBoardElement.innerHTML = '';
        this.msBoardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell: HTMLDivElement = document.createElement('div');
                cell.classList.add('ms-cell');
                cell.dataset.row = String(r);
                cell.dataset.col = String(c);
                cell.addEventListener('click', () => this.revealCell(r, c));
                cell.addEventListener('contextmenu', (e: MouseEvent) => {
                    e.preventDefault();
                    this.flagCell(r, c);
                });
                this.msBoardElement!.appendChild(cell);
            }
        }
    }

    private revealCell(r: number, c: number): void {
        if (this.msGameOver) return;
        const cell: HTMLElement | null = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
        if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

        if (this.msBoard[r][c] === 'M') {
            this.gameOver(false);
            return;
        }

        this.revealRecursive(r, c);
        this.checkWin();
    }

    private revealRecursive(r: number, c: number): void {
        const rows: number = this.msBoard.length;
        const cols: number = this.msBoard[0].length;
        const cell: HTMLElement | null = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
        if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

        cell.classList.add('revealed');
        if (typeof this.msBoard[r][c] === 'number' && this.msBoard[r][c] > 0) {
            cell.textContent = String(this.msBoard[r][c]);
            cell.classList.add(`number-${this.msBoard[r][c]}`);
        } else {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr: number = r + dr;
                    const nc: number = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        this.revealRecursive(nr, nc);
                    }
                }
            }
        }
    }

    private flagCell(r: number, c: number): void {
        if (this.msGameOver) return;
        const cell: HTMLElement | null = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
        if (!cell || cell.classList.contains('revealed')) return;

        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            this.msFlags--;
        } else {
            cell.classList.add('flagged');
            this.msFlags++;
        }
        this.updateStatus();
    }

    private updateStatus(): void {
        if (this.msStatusElement) this.msStatusElement.textContent = `Minen: ${this.msMinesCount - this.msFlags}`;
    }

    private gameOver(won: boolean): void {
        this.msGameOver = true;
        if (!this.msStatusElement || !this.msBoardElement) return;
        if (won) {
            this.msStatusElement.textContent = 'Gewonnen!';
        } else {
            this.msStatusElement.textContent = 'Verloren!';
            for (const [r, c] of this.msMines) {
                const cell: HTMLElement | null = this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                }
            }
        }
    }

    private checkWin(): void {
        const rows: number = this.msBoard.length;
        const cols: number = this.msBoard[0].length;
        const revealedCells: NodeListOf<Element> = document.querySelectorAll('.ms-cell.revealed');
        const target: number = (rows * cols) - this.msMinesCount;

        if (revealedCells.length === target) {
            this.gameOver(true);
        }
    }
}

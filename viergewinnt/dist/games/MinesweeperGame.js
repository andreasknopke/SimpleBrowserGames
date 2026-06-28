export class MinesweeperGame {
    constructor() {
        this.id = 'minesweeper';
        this.msBoard = [];
        this.msMines = [];
        this.msGameOver = false;
        this.msFlags = 0;
        this.msMinesCount = 0;
        this.resetMsBtn = null;
        this.msDifficultySelect = null;
        this.msBoardElement = null;
        this.msStatusElement = null;
        this.resetMsBtn = document.getElementById('resetMsBtn');
        this.msDifficultySelect = document.getElementById('msDifficulty');
        this.msBoardElement = document.getElementById('msBoard');
        this.msStatusElement = document.getElementById('msStatus');
        this.setupEventListeners();
    }
    setupEventListeners() {
        if (this.msDifficultySelect) {
            this.msDifficultySelect.addEventListener('change', () => this.init());
        }
        if (this.resetMsBtn) {
            this.resetMsBtn.addEventListener('click', () => this.init());
        }
    }
    init() {
        const difficulty = this.msDifficultySelect ? this.msDifficultySelect.value : 'easy';
        let rows, cols, mines;
        if (difficulty === 'easy') {
            rows = 10;
            cols = 10;
            mines = 10;
        }
        else if (difficulty === 'medium') {
            rows = 15;
            cols = 15;
            mines = 40;
        }
        else {
            rows = 20;
            cols = 20;
            mines = 80;
        }
        this.msMinesCount = mines;
        this.msFlags = 0;
        this.msGameOver = false;
        this.msBoard = Array.from({ length: rows }, () => Array(cols).fill(0));
        this.msMines = [];
        // Place mines
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (this.msBoard[r][c] !== 'M') {
                this.msBoard[r][c] = 'M';
                this.msMines.push([r, c]);
                minesPlaced++;
            }
        }
        // Calculate numbers
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (this.msBoard[r][c] === 'M')
                    continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
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
    cleanup() {
        // Nothing to clean up for Minesweeper (no intervals)
    }
    renderBoard(rows, cols) {
        if (!this.msBoardElement)
            return;
        this.msBoardElement.innerHTML = '';
        this.msBoardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('ms-cell');
                cell.dataset.row = String(r);
                cell.dataset.col = String(c);
                cell.addEventListener('click', () => this.revealCell(r, c));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.flagCell(r, c);
                });
                this.msBoardElement.appendChild(cell);
            }
        }
    }
    revealCell(r, c) {
        if (this.msGameOver)
            return;
        const cell = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
        if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged'))
            return;
        if (this.msBoard[r][c] === 'M') {
            this.gameOver(false);
            return;
        }
        this.revealRecursive(r, c);
        this.checkWin();
    }
    revealRecursive(r, c) {
        const rows = this.msBoard.length;
        const cols = this.msBoard[0].length;
        const cell = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
        if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged'))
            return;
        cell.classList.add('revealed');
        if (typeof this.msBoard[r][c] === 'number' && this.msBoard[r][c] > 0) {
            cell.textContent = String(this.msBoard[r][c]);
            cell.classList.add(`number-${this.msBoard[r][c]}`);
        }
        else {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        this.revealRecursive(nr, nc);
                    }
                }
            }
        }
    }
    flagCell(r, c) {
        if (this.msGameOver)
            return;
        const cell = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
        if (!cell || cell.classList.contains('revealed'))
            return;
        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            this.msFlags--;
        }
        else {
            cell.classList.add('flagged');
            this.msFlags++;
        }
        this.updateStatus();
    }
    updateStatus() {
        if (this.msStatusElement)
            this.msStatusElement.textContent = `Minen: ${this.msMinesCount - this.msFlags}`;
    }
    gameOver(won) {
        this.msGameOver = true;
        if (!this.msStatusElement || !this.msBoardElement)
            return;
        if (won) {
            this.msStatusElement.textContent = 'Gewonnen!';
        }
        else {
            this.msStatusElement.textContent = 'Verloren!';
            for (const [r, c] of this.msMines) {
                const cell = this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                }
            }
        }
    }
    checkWin() {
        const rows = this.msBoard.length;
        const cols = this.msBoard[0].length;
        const revealedCells = document.querySelectorAll('.ms-cell.revealed');
        const target = (rows * cols) - this.msMinesCount;
        if (revealedCells.length === target) {
            this.gameOver(true);
        }
    }
}
//# sourceMappingURL=MinesweeperGame.js.map
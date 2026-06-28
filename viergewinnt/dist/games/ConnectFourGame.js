export class ConnectFourGame {
    constructor() {
        this.id = 'fourWins';
        this.ROWS = 6;
        this.COLS = 7;
        this.PLAYER1 = 1;
        this.PLAYER2 = 2;
        this.board = [];
        this.currentPlayer = this.PLAYER1;
        this.gameActive = true;
        this.gameMode = '2p';
        this.difficulty = 1;
        this.boardElement = null;
        this.statusElement = null;
        this.gameModeSelect = null;
        this.difficultyContainer = null;
        this.difficultySelect = null;
        this.resetBtn = null;
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('status');
        this.gameModeSelect = document.getElementById('gameMode');
        this.difficultyContainer = document.getElementById('difficultyContainer');
        this.difficultySelect = document.getElementById('difficulty');
        this.resetBtn = document.getElementById('resetBtn');
        this.setupEventListeners();
    }
    setupEventListeners() {
        if (this.gameModeSelect) {
            this.gameModeSelect.addEventListener('change', (e) => {
                const target = e.target;
                this.gameMode = target.value;
                if (this.difficultyContainer) {
                    this.difficultyContainer.style.display = this.gameMode === '1p' ? 'flex' : 'none';
                }
                this.init();
            });
        }
        if (this.difficultySelect) {
            this.difficultySelect.addEventListener('change', (e) => {
                this.difficulty = parseInt(e.target.value);
                this.init();
            });
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.init());
        }
    }
    init() {
        this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.currentPlayer = this.PLAYER1;
        this.gameActive = true;
        if (this.statusElement)
            this.statusElement.textContent = 'Spieler 1 (Rot) ist am Zug';
        this.renderBoard();
    }
    cleanup() {
        // Nothing to clean up for Connect Four (no intervals)
    }
    renderBoard() {
        if (!this.boardElement)
            return;
        this.boardElement.innerHTML = '';
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if (this.board[r][c] !== 0) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece');
                    piece.classList.add(this.board[r][c] === this.PLAYER1 ? 'red' : 'yellow');
                    cell.appendChild(piece);
                }
                cell.addEventListener('click', () => this.handleCellClick(c));
                this.boardElement.appendChild(cell);
            }
        }
    }
    handleCellClick(col) {
        if (!this.gameActive)
            return;
        if (this.board[0][col] !== 0)
            return;
        this.makeMoveInBoard(this.board, col, this.currentPlayer);
        if (this.checkWin(this.board, this.currentPlayer)) {
            this.endGame(this.currentPlayer);
        }
        else if (this.isBoardFull()) {
            this.endGame(0);
        }
        else {
            this.currentPlayer = this.currentPlayer === this.PLAYER1 ? this.PLAYER2 : this.PLAYER1;
            if (this.statusElement) {
                this.statusElement.textContent = this.currentPlayer === this.PLAYER1
                    ? 'Spieler 1 (Rot) ist am Zug'
                    : (this.gameMode === '1p' ? 'Computer (Gelb) ist am Zug' : 'Spieler 2 (Gelb) ist am Zug');
            }
            if (this.gameMode === '1p' && this.currentPlayer === this.PLAYER2) {
                setTimeout(() => {
                    const aiMove = this.getBestMove();
                    if (aiMove !== -1) {
                        this.handleCellClick(aiMove);
                    }
                }, 500);
            }
        }
        this.renderBoard();
    }
    isBoardFull() {
        return this.board[0].every(cell => cell !== 0);
    }
    endGame(winner) {
        this.gameActive = false;
        if (!this.statusElement)
            return;
        if (winner === 0) {
            this.statusElement.textContent = 'Unentschieden!';
        }
        else {
            const winnerName = winner === this.PLAYER1
                ? 'Spieler 1 (Rot)'
                : (this.gameMode === '1p' ? 'Computer (Gelb)' : 'Spieler 2 (Gelb)');
            this.statusElement.textContent = `${winnerName} hat gewonnen!`;
        }
    }
    checkWin(board, player) {
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c <= this.COLS - 4; c++) {
                if (board[r][c] === player && board[r][c + 1] === player && board[r][c + 2] === player && board[r][c + 3] === player)
                    return true;
            }
        }
        for (let r = 0; r <= this.ROWS - 4; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (board[r][c] === player && board[r + 1][c] === player && board[r + 2][c] === player && board[r + 3][c] === player)
                    return true;
            }
        }
        for (let r = 0; r <= this.ROWS - 4; r++) {
            for (let c = 0; c <= this.COLS - 4; c++) {
                if (board[r][c] === player && board[r + 1][c + 1] === player && board[r + 2][c + 2] === player && board[r + 3][c + 3] === player)
                    return true;
            }
        }
        for (let r = 3; r < this.ROWS; r++) {
            for (let c = 0; c <= this.COLS - 4; c++) {
                if (board[r][c] === player && board[r - 1][c + 1] === player && board[r - 2][c + 2] === player && board[r - 3][c + 3] === player)
                    return true;
            }
        }
        return false;
    }
    // =============================================
    // AI Implementation (Minimax with Alpha-Beta Pruning)
    // =============================================
    getBestMove() {
        let bestScore = -Infinity;
        let move = -1;
        const availableCols = this.getAvailableCols(this.board);
        for (const col of availableCols) {
            const tempBoard = this.board.map(row => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
            const score = this.minimax(tempBoard, this.difficulty, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                move = col;
            }
        }
        return move;
    }
    getAvailableCols(board) {
        const available = [];
        for (let c = 0; c < this.COLS; c++) {
            if (board[0][c] === 0)
                available.push(c);
        }
        return available;
    }
    makeMoveInBoard(board, col, player) {
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (board[r][col] === 0) {
                board[r][col] = player;
                break;
            }
        }
    }
    minimax(board, depth, alpha, beta, isMaximizing) {
        if (this.checkWin(board, this.PLAYER2))
            return 10000 + depth;
        if (this.checkWin(board, this.PLAYER1))
            return -10000 - depth;
        if (this.isBoardFull() || depth === 0)
            return this.evaluateBoard(board);
        const availableCols = this.getAvailableCols(board);
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const col of availableCols) {
                const tempBoard = board.map(row => [...row]);
                this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
                const evaluation = this.minimax(tempBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha)
                    break;
            }
            return maxEval;
        }
        else {
            let minEval = Infinity;
            for (const col of availableCols) {
                const tempBoard = board.map(row => [...row]);
                this.makeMoveInBoard(tempBoard, col, this.PLAYER1);
                const evaluation = this.minimax(tempBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha)
                    break;
            }
            return minEval;
        }
    }
    evaluateBoard(board) {
        let score = 0;
        for (let r = 0; r < this.ROWS; r++) {
            if (board[r][3] === this.PLAYER2)
                score += 3;
            else if (board[r][3] === this.PLAYER1)
                score -= 3;
        }
        return score;
    }
}
//# sourceMappingURL=ConnectFourGame.js.map
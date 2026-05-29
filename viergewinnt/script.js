const ROWS = 6;
const COLS = 7;
const PLAYER1 = 1; // Red
const PLAYER2 = 2; // Yellow

let board = [];
let currentPlayer = PLAYER1;
let gameActive = true;
let gameMode = '2p'; // '1p' or '2p'
let difficulty = 1;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const gameModeSelect = document.getElementById('gameMode');
const difficultyContainer = document.getElementById('difficultyContainer');
const difficultySelect = document.getElementById('difficulty');
const resetBtn = document.getElementById('resetBtn');

// Minesweeper elements
const btnFourWins = document.getElementById('btnFourWins');
const btnMinesweeper = document.getElementById('btnMinesweeper');
const btnTetris = document.getElementById('btnTetris');
const fourWinsContainer = document.getElementById('fourWinsContainer');
const minesweeperContainer = document.getElementById('minesweeperContainer');
const resetMsBtn = document.getElementById('resetMsBtn');
const msDifficultySelect = document.getElementById('msDifficulty');
const msBoardElement = document.getElementById('msBoard');
const msStatusElement = document.getElementById('msStatus');

let msBoard = [];
let msMines = [];
let msGameOver = false;
let msFlags = 0;
let msMinesCount = 0;

// Tetris elements
const tetrisContainer = document.getElementById('tetrisContainer');
const resetTetrisBtn = document.getElementById('resetTetrisBtn');
const tetrisCanvas = document.getElementById('tetrisCanvas');
const tetrisStatusElement = document.getElementById('tetrisStatus');
const ctx = tetrisCanvas.getContext('2d');
let tetrisInterval;
let tetrisScore = 0;

// Tetris event listeners
resetTetrisBtn.addEventListener('click', initTetris);
document.addEventListener('keydown', handleTetrisKey);

// Tetris Constants & State
const TETRIS_ROWS = 20;
const TETRIS_COLS = 10;
const BLOCK_SIZE = 20;
const PIECES_DATA = [
    { shape: [[1, 1, 1, 1]], color: '#00ffff' }, // I
    { shape: [[1, 1], [1, 1]], color: '#ffff00' }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' }, // T
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' }, // Z
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' }, // J
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffa500' }  // L
];

let tetrisBoard = [];
let currentPiece = null;
let currentPiecePos = { x: 0, y: 0 };
let currentPieceColor = '';

// Game switching logic
btnFourWins.addEventListener('click', () => {
    switchGame('fourWins');
});

btnMinesweeper.addEventListener('click', () => {
    switchGame('minesweeper');
});

btnTetris.addEventListener('click', () => {
    switchGame('tetris');
});

function switchGame(game) {
    // Clear all intervals to prevent multiple games running
    clearInterval(tetrisInterval);

    if (game === 'fourWins') {
        btnFourWins.classList.add('active');
        btnMinesweeper.classList.remove('active');
        btnTetris.classList.remove('active');
        fourWinsContainer.style.display = 'block';
        minesweeperContainer.style.display = 'none';
        tetrisContainer.style.display = 'none';
        initGame();
    } else if (game === 'minesweeper') {
        btnMinesweeper.classList.add('active');
        btnFourWins.classList.remove('active');
        btnTetris.classList.remove('active');
        fourWinsContainer.style.display = 'none';
        minesweeperContainer.style.display = 'block';
        tetrisContainer.style.display = 'none';
        initMinesweeper();
    } else if (game === 'tetris') {
        btnTetris.classList.add('active');
        btnFourWins.classList.remove('active');
        btnMinesweeper.classList.remove('active');
        fourWinsContainer.style.display = 'none';
        minesweeperContainer.style.display = 'none';
        tetrisContainer.style.display = 'block';
        initTetris();
    }
}

function initMinesweeper() {
    const difficulty = msDifficultySelect.value;
    let rows, cols, mines;

    if (difficulty === 'easy') {
        rows = 10;
        cols = 10;
        mines = 10;
    } else if (difficulty === 'medium') {
        rows = 15;
        cols = 15;
        mines = 40;
    } else {
        rows = 20;
        cols = 20;
        mines = 80;
    }

    msMinesCount = mines;
    msFlags = 0;
    msGameOver = false;
    msBoard = Array.from({ length: rows }, () => Array(cols).fill(0));
    msMines = [];

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (msBoard[r][c] !== 'M') {
            msBoard[r][c] = 'M';
            msMines.push([r, c]);
            minesPlaced++;
        }
    }

    // Calculate numbers
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (msBoard[r][c] === 'M') continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && msBoard[nr][nc] === 'M') {
                        count++;
                    }
                }
            }
            msBoard[r][c] = count;
        }
    }

    renderMinesweeperBoard(rows, cols);
    updateMsStatus();
}

function renderMinesweeperBoard(rows, cols) {
    msBoardElement.innerHTML = '';
    msBoardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('ms-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => revealCell(r, c));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(r, c);
            });
            msBoardElement.appendChild(cell);
        }
    }
}

function revealCell(r, c) {
    if (msGameOver) return;
    const cell = msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

    if (msBoard[r][c] === 'M') {
        gameOver(false);
        return;
    }

    revealRecursive(r, c);
    checkWinMinesweeper();
}

function revealRecursive(r, c) {
    const rows = msBoard.length;
    const cols = msBoard[0].length;
    const cell = msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

    cell.classList.add('revealed');
    if (msBoard[r][c] > 0) {
        cell.textContent = msBoard[r][c];
        cell.classList.add(`number-${msBoard[r][c]}`);
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    revealRecursive(nr, nc);
                }
            }
        }
    }
}

function flagCell(r, c) {
    if (msGameOver) return;
    const cell = msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (!cell || cell.classList.contains('revealed')) return;

    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        msFlags--;
    } else {
        cell.classList.add('flagged');
        msFlags++;
    }
    updateMsStatus();
}

function updateMsStatus() {
    msStatusElement.textContent = `Minen: ${msMinesCount - msFlags}`;
}

function gameOver(won) {
    msGameOver = true;
    if (won) {
        msStatusElement.textContent = "Gewonnen!";
    } else {
        msStatusElement.textContent = "Verloren!";
        // Reveal all mines
        for (const [r, c] of msMines) {
            const cell = msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            }
        }
    }
}

function checkWinMinesweeper() {
    const rows = msBoard.length;
    const cols = msBoard[0].length;
    const revealedCells = document.querySelectorAll('.ms-cell.revealed');
    
    // Total cells minus mines
    const target = (rows * cols) - msMinesCount;
    
    if (revealedCells.length === target) {
        gameOver(true);
    }
}

function endGame(winner) {
    gameActive = false;
    if (winner === 0) {
        statusElement.textContent = "Unentschieden!";
    } else {
        const winnerName = winner === PLAYER1 ? 'Spieler 1 (Rot)' : (gameMode === '1p' ? 'Computer (Gelb)' : 'Spieler 2 (Gelb)');
        statusElement.textContent = `${winnerName} hat gewonnen!`;
    }
}

function checkWin(board, player) {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
        }
    }
    // Check vertical
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
        }
    }
    // Check diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] ===
                player) return true;
        }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] ===
                player) return true;
        }
    }
    return false;
}

// AI Implementation (Minimax with Alpha-Beta Pruning)

function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;
    const availableCols = getAvailableCols(board);

    for (const col of availableCols) {
        const tempBoard = board.map(row => [...row]);
        makeMoveInBoard(tempBoard, col, PLAYER2);
        const score = minimax(tempBoard, difficulty, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            move = col;
        }
    }
    return move;
}

function getAvailableCols(board) {
    const available = [];
    for (let c = 0; c < COLS; c++) {
        if (board[0][c] === 0) available.push(c);
    }
    return available;
}

function makeMoveInBoard(board, col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = player;
            break;
        }
    }
}

function minimax(board, depth, alpha, beta, isMaximizing) {
    if (checkWin(board, PLAYER2)) return 10000 + depth;
    if (checkWin(board, PLAYER1)) return -10000 - depth;
    if (isBoardFull() || depth === 0) return evaluateBoard(board);

    const availableCols = getAvailableCols(board);

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const col of availableCols) {
            const tempBoard = board.map(row => [...row]);
            makeMoveInBoard(tempBoard, col, PLAYER2);
            const evaluation = minimax(tempBoard, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const col of availableCols) {
            const tempBoard = board.map(row => [...row]);
            makeMoveInBoard(tempBoard, col, PLAYER1);
            const evaluation = minimax(tempBoard, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluateBoard(board) {
    // Simple heuristic: count center pieces and potential 4-in-a-row
    let score = 0;
    // This is a very basic heuristic. For a real game, it should be more complex.
    // For now, let's just count pieces in the center column.
    for (let r = 0; r < ROWS; r++) {
        if (board[r][3] === PLAYER2) score += 3;
        else if (board[r][3] === PLAYER1) score -= 3;
    }
    return score;
}

function initGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPlayer = PLAYER1;
    gameActive = true;
    statusElement.textContent = `Spieler 1 (Rot) ist am Zug`;
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (board[r][c] !== 0) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.classList.add(board[r][c] === PLAYER1 ? 'red' : 'yellow');
                cell.appendChild(piece);
            }

            cell.addEventListener('click', () => handleCellClick(c));
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(col) {
    if (!gameActive) return;
    if (board[0][col] !== 0) return;

    makeMoveInBoard(board, col, currentPlayer);

    if (checkWin(board, currentPlayer)) {
        endGame(currentPlayer);
    } else if (isBoardFull()) {
        endGame(0);
    } else {
        currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
        statusElement.textContent = currentPlayer === PLAYER1 ? 'Spieler 1 (Rot) ist am Zug' : (gameMode === '1p' ? 'Computer (Gelb) ist am Zug' : 'Spieler 2 (Gelb) ist am Zug');

        if (gameMode === '1p' && currentPlayer === PLAYER2) {
            setTimeout(() => {
                const aiMove = getBestMove();
                if (aiMove !== -1) {
                    handleCellClick(aiMove);
                }
            }, 500);
        }
    }
    renderBoard();
}

function isBoardFull() {
    return board[0].every(cell => cell !== 0);
}

// Event Listeners
gameModeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    difficultyContainer.style.display = gameMode === '1p' ? 'flex' : 'none';
    initGame();
});

difficultySelect.addEventListener('change', (e) => {
    difficulty = parseInt(e.target.value);
    initGame();
});

msDifficultySelect.addEventListener('change', () => {
    initMinesweeper();
});

resetMsBtn.addEventListener('click', () => {
    initMinesweeper();
});

resetBtn.addEventListener('click', initGame);

// Start the game
initGame();

// Tetris logic

function clearLines() {
    let linesCleared = 0;
    for (let r = TETRIS_ROWS - 1; r >= 0; r--) {
        if (tetrisBoard[r].every(cell => cell)) {
            tetrisBoard.splice(r, 1);
            tetrisBoard.unshift(Array(TETRIS_COLS).fill(null));
            linesCleared++;
            r++; // Check this row again after shifting
        }
    }
    if (linesCleared > 0) {
        tetrisScore += linesCleared * 100;
        tetrisStatusElement.textContent = `Punkte: ${tetrisScore}`;
    }
}
function initTetris() {
    clearInterval(tetrisInterval);
    tetrisBoard = Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null));
    tetrisScore = 0;
    tetrisStatusElement.textContent = `Punkte: ${tetrisScore}`;
    
    spawnPiece();
    
    tetrisInterval = setInterval(() => {
        if (!movePiece(0, 1)) {
            lockPiece();
        }
        drawTetris();
    }, 500);

    // Tetris event listeners
    resetTetrisBtn.addEventListener('click', initTetris);
}

function spawnPiece() {
    const index = Math.floor(Math.random() * PIECES_DATA.length);
    currentPiece = PIECES_DATA[index].shape;
    currentPieceColor = PIECES_DATA[index].color;
    currentPiecePos = { x: Math.floor(TETRIS_COLS / 2) - 1, y: 0 };

    if (checkCollision(currentPiece, currentPiecePos.x, currentPiecePos.y)) {
        // Game Over
        clearInterval(tetrisInterval);
        tetrisStatusElement.textContent = `Game Over! Punkte: ${tetrisScore}`;
    }
}

function checkCollision(piece, x, y) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c]) {
                const newX = x + c;
                const newY = y + r;
                if (newX < 0 || newX >= TETRIS_COLS || newY >= TETRIS_ROWS || (newY >= 0 && tetrisBoard[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function movePiece(dx, dy) {
    if (!checkCollision(currentPiece, currentPiecePos.x + dx, currentPiecePos.y + dy)) {
        currentPiecePos.x += dx;
        currentPiecePos.y += dy;
        return true;
    }
    return false;
}

function rotatePiece() {
    const rotated = currentPiece[0].map((_, index) =>
        currentPiece.map(row => row[index]).reverse()
    );
    if (!checkCollision(rotated, currentPiecePos.x, currentPiecePos.y)) {
        currentPiece = rotated;
    }
}

function lockPiece() {
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                const newY = currentPiecePos.y + r;
                const newX = currentPiecePos.x + c;
                if (newY >= 0 && newY < TETRIS_ROWS) {
                    tetrisBoard[newY][newX] = currentPieceColor;
                }
            }
        }
    }
    clearLines();
    spawnPiece();
}

function drawTetris() {
    ctx.clearRect(0, 0, TETRIS_COLS * BLOCK_SIZE, TETRIS_ROWS * BLOCK_SIZE);
    for (let r = 0; r < TETRIS_ROWS; r++) {
        for (let c = 0; c < TETRIS_COLS; c++) {
            if (tetrisBoard[r][c]) {
                ctx.fillStyle = tetrisBoard[r][c];
                ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    if (currentPiece) {
        ctx.fillStyle = currentPieceColor;
        for (let r = 0; r < currentPiece.length; r++) {
            for (let c = 0; c < currentPiece[r].length; c++) {
                if (currentPiece[r][c]) {
                    ctx.fillRect((currentPiecePos.x + c) * BLOCK_SIZE, (currentPiecePos.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }
}

function handleTetrisKey(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.key === 'ArrowLeft') movePiece(-1, 0);
        if (e.key === 'ArrowRight') movePiece(1, 0);
        if (e.key === 'ArrowDown') movePiece(0, 1);
        if (e.key === 'ArrowUp') rotatePiece();
        drawTetris();
    }
}

// Start the game
initGame();

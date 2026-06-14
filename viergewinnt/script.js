"use strict";
// =============================================
// Type Definitions
// =============================================
// =============================================
// Boulder Dash
// =============================================
const BD_SIZE = 20; // 20x20 grid
const BD_CELL_SIZE = 20; // pixels per cell (400/20)
const BD_PLAYER_CHAR = 1;
const BD_WALL_CHAR = 2;
const BD_DIRT_CHAR = 3;
const BD_BOULDER_CHAR = 4;
const BD_DIAMOND_CHAR = 5;
const BD_EMPTY_CHAR = 0;
const BD_MAGIC_WALL_CHAR = 6;
const BD_TARGET_COLLECT = 10;
let bd = {
    board: [],
    playerX: 0,
    playerY: 0,
    score: 0,
    totalDiamonds: 0,
    collectedDiamonds: 0,
    gameOver: false,
    won: false,
    interval: undefined,
    canvas: null,
    ctx: null
};
// =============================================
// Connect Four / Vier Gewinnt
// =============================================
const ROWS = 6;
const COLS = 7;
const PLAYER1 = 1; // Red
const PLAYER2 = 2; // Yellow
let board = [];
let currentPlayer = PLAYER1;
let gameActive = true;
let gameMode = '2p';
let difficulty = 1;
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const gameModeSelect = document.getElementById('gameMode');
const difficultyContainer = document.getElementById('difficultyContainer');
const difficultySelect = document.getElementById('difficulty');
const resetBtn = document.getElementById('resetBtn');
// =============================================
// Minesweeper
// =============================================
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
// =============================================
// Tetris
// =============================================
const tetrisContainer = document.getElementById('tetrisContainer');
const resetTetrisBtn = document.getElementById('resetTetrisBtn');
const tetrisCanvas = document.getElementById('tetrisCanvas');
const tetrisStatusElement = document.getElementById('tetrisStatus');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const tetrisBtnLeft = document.getElementById('tetrisBtnLeft');
const tetrisBtnRight = document.getElementById('tetrisBtnRight');
const tetrisBtnDown = document.getElementById('tetrisBtnDown');
const tetrisBtnRotate = document.getElementById('tetrisBtnRotate');
let tetrisInterval;
let tetrisScore = 0;
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
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffa500' } // L
];
let tetrisBoard = [];
let currentPiece = null;
let currentPiecePos = { x: 0, y: 0 };
let currentPieceColor = '';
let nextPieceIndex = -1;
let ctx = tetrisCanvas ? tetrisCanvas.getContext('2d') : null;
let nextCtx = nextPieceCanvas ? nextPieceCanvas.getContext('2d') : null;
// =============================================
// Snake
// =============================================
const btnSnake = document.getElementById('btnSnake');
const snakeContainer = document.getElementById('snakeContainer');
const resetSnakeBtn = document.getElementById('resetSnakeBtn');
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeStatusElement = document.getElementById('snakeStatus');
const snakeBtnUp = document.getElementById('snakeBtnUp');
const snakeBtnLeft = document.getElementById('snakeBtnLeft');
const snakeBtnDown = document.getElementById('snakeBtnDown');
const snakeBtnRight = document.getElementById('snakeBtnRight');
let snakeInterval;
const SNAKE_SIZE = 20;
const SNAKE_COLS = 20;
const SNAKE_ROWS = 20;
const SNAKE_CANVAS_SIZE = 400;
let snake = [];
let snakeDir = { x: 1, y: 0 };
let snakeNextDir = { x: 1, y: 0 };
let snakeFood = { x: 5, y: 5 };
let snakeScore = 0;
let snakeGameOver = false;
let snakeCtx = snakeCanvas ? snakeCanvas.getContext('2d') : null;
// =============================================
// Pong
// =============================================
const btnPong = document.getElementById('btnPong');
const pongContainer = document.getElementById('pongContainer');
const resetPongBtn = document.getElementById('resetPongBtn');
const pongCanvas = document.getElementById('pongCanvas');
const pongStatusElement = document.getElementById('pongStatus');
const pongModeSelect = document.getElementById('pongMode');
const pongBtnLeftUp = document.getElementById('pongBtnLeftUp');
const pongBtnLeftDown = document.getElementById('pongBtnLeftDown');
const pongBtnRightUp = document.getElementById('pongBtnRightUp');
const pongBtnRightDown = document.getElementById('pongBtnRightDown');
let pongInterval;
const PONG_WIDTH = 600;
const PONG_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 8;
const PADDLE_SPEED = 5;
const AI_SPEED = 4;
let pongMode = '2p';
let pongLeftY = 160;
let pongRightY = 160;
let pongBallX = 300;
let pongBallY = 200;
let pongBallDX = 4;
let pongBallDY = 4;
let pongLeftScore = 0;
let pongRightScore = 0;
let pongGameOver = false;
let pongLeftMoving = 0;
let pongRightMoving = 0;
let pongCtx = pongCanvas ? pongCanvas.getContext('2d') : null;
// =============================================
// Space Invaders
// =============================================
const btnSpaceInvaders = document.getElementById('btnSpaceInvaders');
const spaceInvadersContainer = document.getElementById('spaceInvadersContainer');
const resetSpaceInvadersBtn = document.getElementById('resetSpaceInvadersBtn');
const spaceInvadersCanvas = document.getElementById('spaceInvadersCanvas');
const spaceInvadersStatusElement = document.getElementById('spaceInvadersStatus');
const spaceInvadersBtnLeft = document.getElementById('spaceInvadersBtnLeft');
const spaceInvadersBtnRight = document.getElementById('spaceInvadersBtnRight');
const spaceInvadersBtnShoot = document.getElementById('spaceInvadersBtnShoot');
let spaceInvadersInterval;
let siPlayerX = 220;
let siBullets = [];
let siAliens = [];
let siAlienBullets = [];
let siAlienDir = 1;
let siAlienSpeed = 1;
let siAlienDropAmount = 10;
let siScore = 0;
let siGameOver = false;
let siAlienMoveTimer = 0;
let siAlienMoveInterval = 30;
const SI_ALIEN_ROWS = 4;
const SI_ALIEN_COLS = 8;
const SI_ALIEN_WIDTH = 30;
const SI_ALIEN_HEIGHT = 20;
const SI_ALIEN_GAP = 10;
const SI_ALIEN_OFFSET_TOP = 40;
const SI_ALIEN_OFFSET_LEFT = 20;
const SI_PLAYER_WIDTH = 40;
const SI_PLAYER_HEIGHT = 20;
const SI_BULLET_WIDTH = 3;
const SI_BULLET_HEIGHT = 10;
const SI_ALIEN_BULLET_WIDTH = 3;
const SI_ALIEN_BULLET_HEIGHT = 8;
let spaceInvadersCtx = spaceInvadersCanvas ? spaceInvadersCanvas.getContext('2d') : null;
// =============================================
// Breakout
// =============================================
const btnBreakout = document.getElementById('btnBreakout');
const breakoutContainer = document.getElementById('breakoutContainer');
const resetBreakoutBtn = document.getElementById('resetBreakoutBtn');
const breakoutCanvas = document.getElementById('breakoutCanvas');
const breakoutStatusElement = document.getElementById('breakoutStatus');
const breakoutBtnLeft = document.getElementById('breakoutBtnLeft');
const breakoutBtnRight = document.getElementById('breakoutBtnRight');
let breakoutInterval;
let breakoutPaddleX = 200;
let breakoutBallX = 240;
let breakoutBallY = 350;
let breakoutBallDX = 3;
let breakoutBallDY = -3;
let breakoutBricks = [];
let breakoutScore = 0;
let breakoutLives = 3;
let breakoutGameOver = false;
let breakoutPaddleMoving = 0;
const BREAKOUT_PADDLE_WIDTH = 80;
const BREAKOUT_PADDLE_HEIGHT = 12;
const BREAKOUT_BRICK_ROWS = 5;
const BREAKOUT_BRICK_COLS = 8;
const BREAKOUT_BRICK_WIDTH = 52;
const BREAKOUT_BRICK_HEIGHT = 18;
const BREAKOUT_BRICK_GAP = 6;
const BREAKOUT_BRICK_OFFSET_TOP = 40;
const BREAKOUT_BRICK_OFFSET_LEFT = 10;
const BREAKOUT_BALL_RADIUS = 6;
const BREAKOUT_PADDLE_SPEED = 6;
let breakoutCtx = breakoutCanvas ? breakoutCanvas.getContext('2d') : null;
// =============================================
// Boulder Dash
// =============================================
const btnBoulderDash = document.getElementById('btnBoulderDash');
const boulderDashContainer = document.getElementById('boulderDashContainer');
const resetBdBtn = document.getElementById('resetBdBtn');
const bdCanvas = document.getElementById('bdCanvas');
const bdStatusElement = document.getElementById('bdStatus');
const bdBtnUp = document.getElementById('bdBtnUp');
const bdBtnDown = document.getElementById('bdBtnDown');
const bdBtnLeft = document.getElementById('bdBtnLeft');
const bdBtnRight = document.getElementById('bdBtnRight');
// =============================================
// Game Switching Logic
// =============================================
if (btnFourWins)
    btnFourWins.addEventListener('click', () => switchGame('fourWins'));
if (btnMinesweeper)
    btnMinesweeper.addEventListener('click', () => switchGame('minesweeper'));
if (btnTetris)
    btnTetris.addEventListener('click', () => switchGame('tetris'));
if (btnSnake)
    btnSnake.addEventListener('click', () => switchGame('snake'));
if (btnPong)
    btnPong.addEventListener('click', () => switchGame('pong'));
if (btnSpaceInvaders)
    btnSpaceInvaders.addEventListener('click', () => switchGame('spaceInvaders'));
if (btnBreakout)
    btnBreakout.addEventListener('click', () => switchGame('breakout'));
if (btnBoulderDash)
    btnBoulderDash.addEventListener('click', () => switchGame('boulderDash'));
function switchGame(game) {
    // Clear all intervals to prevent multiple games running
    if (tetrisInterval)
        clearInterval(tetrisInterval);
    if (snakeInterval)
        clearInterval(snakeInterval);
    if (pongInterval)
        clearInterval(pongInterval);
    if (spaceInvadersInterval)
        clearInterval(spaceInvadersInterval);
    if (breakoutInterval)
        clearInterval(breakoutInterval);
    if (bd.interval)
        clearInterval(bd.interval);
    // Hide all containers
    if (fourWinsContainer)
        fourWinsContainer.style.display = 'none';
    if (minesweeperContainer)
        minesweeperContainer.style.display = 'none';
    if (tetrisContainer)
        tetrisContainer.style.display = 'none';
    if (snakeContainer)
        snakeContainer.style.display = 'none';
    if (pongContainer)
        pongContainer.style.display = 'none';
    if (spaceInvadersContainer)
        spaceInvadersContainer.style.display = 'none';
    if (breakoutContainer)
        breakoutContainer.style.display = 'none';
    if (boulderDashContainer)
        boulderDashContainer.style.display = 'none';
    // Remove active class from all buttons
    if (btnFourWins)
        btnFourWins.classList.remove('active');
    if (btnMinesweeper)
        btnMinesweeper.classList.remove('active');
    if (btnTetris)
        btnTetris.classList.remove('active');
    if (btnSnake)
        btnSnake.classList.remove('active');
    if (btnPong)
        btnPong.classList.remove('active');
    if (btnSpaceInvaders)
        btnSpaceInvaders.classList.remove('active');
    if (btnBreakout)
        btnBreakout.classList.remove('active');
    if (btnBoulderDash)
        btnBoulderDash.classList.remove('active');
    if (game === 'fourWins') {
        if (btnFourWins)
            btnFourWins.classList.add('active');
        if (fourWinsContainer)
            fourWinsContainer.style.display = 'block';
        initGame();
    }
    else if (game === 'minesweeper') {
        if (btnMinesweeper)
            btnMinesweeper.classList.add('active');
        if (minesweeperContainer)
            minesweeperContainer.style.display = 'block';
        initMinesweeper();
    }
    else if (game === 'tetris') {
        if (btnTetris)
            btnTetris.classList.add('active');
        if (tetrisContainer)
            tetrisContainer.style.display = 'block';
        initTetris();
    }
    else if (game === 'snake') {
        if (btnSnake)
            btnSnake.classList.add('active');
        if (snakeContainer)
            snakeContainer.style.display = 'block';
        initSnake();
    }
    else if (game === 'pong') {
        if (btnPong)
            btnPong.classList.add('active');
        if (pongContainer)
            pongContainer.style.display = 'block';
        initPong();
    }
    else if (game === 'spaceInvaders') {
        if (btnSpaceInvaders)
            btnSpaceInvaders.classList.add('active');
        if (spaceInvadersContainer)
            spaceInvadersContainer.style.display = 'block';
        initSpaceInvaders();
    }
    else if (game === 'breakout') {
        if (btnBreakout)
            btnBreakout.classList.add('active');
        if (breakoutContainer)
            breakoutContainer.style.display = 'block';
        initBreakout();
    }
    else if (game === 'boulderDash') {
        if (btnBoulderDash)
            btnBoulderDash.classList.add('active');
        if (boulderDashContainer)
            boulderDashContainer.style.display = 'block';
        initBoulderDash();
    }
}
// =============================================
// Connect Four / Vier Gewinnt Logic
// =============================================
function initGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPlayer = PLAYER1;
    gameActive = true;
    if (statusElement)
        statusElement.textContent = 'Spieler 1 (Rot) ist am Zug';
    renderBoard();
}
function renderBoard() {
    if (!boardElement)
        return;
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
    if (!gameActive)
        return;
    if (board[0][col] !== 0)
        return;
    makeMoveInBoard(board, col, currentPlayer);
    if (checkWin(board, currentPlayer)) {
        endGame(currentPlayer);
    }
    else if (isBoardFull()) {
        endGame(0);
    }
    else {
        currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
        if (statusElement) {
            statusElement.textContent = currentPlayer === PLAYER1
                ? 'Spieler 1 (Rot) ist am Zug'
                : (gameMode === '1p' ? 'Computer (Gelb) ist am Zug' : 'Spieler 2 (Gelb) ist am Zug');
        }
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
function endGame(winner) {
    gameActive = false;
    if (!statusElement)
        return;
    if (winner === 0) {
        statusElement.textContent = 'Unentschieden!';
    }
    else {
        const winnerName = winner === PLAYER1
            ? 'Spieler 1 (Rot)'
            : (gameMode === '1p' ? 'Computer (Gelb)' : 'Spieler 2 (Gelb)');
        statusElement.textContent = `${winnerName} hat gewonnen!`;
    }
}
function checkWin(board, player) {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r][c + 1] === player && board[r][c + 2] === player && board[r][c + 3] === player)
                return true;
        }
    }
    // Check vertical
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === player && board[r + 1][c] === player && board[r + 2][c] === player && board[r + 3][c] === player)
                return true;
        }
    }
    // Check diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r + 1][c + 1] === player && board[r + 2][c + 2] === player && board[r + 3][c + 3] === player)
                return true;
        }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r - 1][c + 1] === player && board[r - 2][c + 2] === player && board[r - 3][c + 3] === player)
                return true;
        }
    }
    return false;
}
// =============================================
// AI Implementation (Minimax with Alpha-Beta Pruning)
// =============================================
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
        if (board[0][c] === 0)
            available.push(c);
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
    if (checkWin(board, PLAYER2))
        return 10000 + depth;
    if (checkWin(board, PLAYER1))
        return -10000 - depth;
    if (isBoardFull() || depth === 0)
        return evaluateBoard(board);
    const availableCols = getAvailableCols(board);
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const col of availableCols) {
            const tempBoard = board.map(row => [...row]);
            makeMoveInBoard(tempBoard, col, PLAYER2);
            const evaluation = minimax(tempBoard, depth - 1, alpha, beta, false);
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
            makeMoveInBoard(tempBoard, col, PLAYER1);
            const evaluation = minimax(tempBoard, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha)
                break;
        }
        return minEval;
    }
}
function evaluateBoard(board) {
    let score = 0;
    for (let r = 0; r < ROWS; r++) {
        if (board[r][3] === PLAYER2)
            score += 3;
        else if (board[r][3] === PLAYER1)
            score -= 3;
    }
    return score;
}
// Event Listeners for Connect Four
if (gameModeSelect) {
    gameModeSelect.addEventListener('change', (e) => {
        const target = e.target;
        gameMode = target.value;
        if (difficultyContainer)
            difficultyContainer.style.display = gameMode === '1p' ? 'flex' : 'none';
        initGame();
    });
}
if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
        difficulty = parseInt(e.target.value);
        initGame();
    });
}
if (resetBtn)
    resetBtn.addEventListener('click', initGame);
// =============================================
// Minesweeper Logic
// =============================================
function initMinesweeper() {
    const difficulty = msDifficultySelect ? msDifficultySelect.value : 'easy';
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
            if (msBoard[r][c] === 'M')
                continue;
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
    if (!msBoardElement)
        return;
    msBoardElement.innerHTML = '';
    msBoardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('ms-cell');
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);
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
    if (msGameOver)
        return;
    const cell = msBoardElement ? msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
    if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged'))
        return;
    if (msBoard[r][c] === 'M') {
        gameOverMinesweeper(false);
        return;
    }
    revealRecursive(r, c);
    checkWinMinesweeper();
}
function revealRecursive(r, c) {
    const rows = msBoard.length;
    const cols = msBoard[0].length;
    const cell = msBoardElement ? msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
    if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged'))
        return;
    cell.classList.add('revealed');
    if (typeof msBoard[r][c] === 'number' && msBoard[r][c] > 0) {
        cell.textContent = String(msBoard[r][c]);
        cell.classList.add(`number-${msBoard[r][c]}`);
    }
    else {
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
    if (msGameOver)
        return;
    const cell = msBoardElement ? msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
    if (!cell || cell.classList.contains('revealed'))
        return;
    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        msFlags--;
    }
    else {
        cell.classList.add('flagged');
        msFlags++;
    }
    updateMsStatus();
}
function updateMsStatus() {
    if (msStatusElement)
        msStatusElement.textContent = `Minen: ${msMinesCount - msFlags}`;
}
function gameOverMinesweeper(won) {
    msGameOver = true;
    if (!msStatusElement || !msBoardElement)
        return;
    if (won) {
        msStatusElement.textContent = 'Gewonnen!';
    }
    else {
        msStatusElement.textContent = 'Verloren!';
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
        gameOverMinesweeper(true);
    }
}
if (msDifficultySelect)
    msDifficultySelect.addEventListener('change', () => initMinesweeper());
if (resetMsBtn)
    resetMsBtn.addEventListener('click', () => initMinesweeper());
// =============================================
// Tetris Logic
// =============================================
if (resetTetrisBtn)
    resetTetrisBtn.addEventListener('click', initTetris);
function clearLines() {
    let linesCleared = 0;
    for (let r = TETRIS_ROWS - 1; r >= 0; r--) {
        if (tetrisBoard[r].every(cell => cell !== null)) {
            tetrisBoard.splice(r, 1);
            tetrisBoard.unshift(Array(TETRIS_COLS).fill(null));
            linesCleared++;
            r++; // Check this row again after shifting
        }
    }
    if (linesCleared > 0) {
        tetrisScore += linesCleared * 100;
        if (tetrisStatusElement)
            tetrisStatusElement.textContent = `Punkte: ${tetrisScore}`;
    }
}
function initTetris() {
    if (tetrisInterval)
        clearInterval(tetrisInterval);
    tetrisBoard = Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null));
    tetrisScore = 0;
    nextPieceIndex = -1;
    if (tetrisStatusElement)
        tetrisStatusElement.textContent = `Punkte: ${tetrisScore}`;
    spawnPiece();
    tetrisInterval = setInterval(() => {
        if (!movePiece(0, 1)) {
            lockPiece();
        }
        drawTetris();
    }, 500);
}
function spawnPiece() {
    if (nextPieceIndex === -1) {
        nextPieceIndex = Math.floor(Math.random() * PIECES_DATA.length);
    }
    const index = nextPieceIndex;
    nextPieceIndex = Math.floor(Math.random() * PIECES_DATA.length);
    currentPiece = PIECES_DATA[index].shape.map(row => [...row]);
    currentPieceColor = PIECES_DATA[index].color;
    currentPiecePos = { x: Math.floor(TETRIS_COLS / 2) - 1, y: 0 };
    drawNextPiece();
    if (checkCollision(currentPiece, currentPiecePos.x, currentPiecePos.y)) {
        // Game Over
        if (tetrisInterval)
            clearInterval(tetrisInterval);
        if (tetrisStatusElement)
            tetrisStatusElement.textContent = `Game Over! Punkte: ${tetrisScore}`;
    }
}
function checkCollision(piece, x, y) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c]) {
                const newX = x + c;
                const newY = y + r;
                if (newX < 0 || newX >= TETRIS_COLS || newY >= TETRIS_ROWS || (newY >= 0 && tetrisBoard[newY][newX] !== null)) {
                    return true;
                }
            }
        }
    }
    return false;
}
function movePiece(dx, dy) {
    if (currentPiece && !checkCollision(currentPiece, currentPiecePos.x + dx, currentPiecePos.y + dy)) {
        currentPiecePos.x += dx;
        currentPiecePos.y += dy;
        return true;
    }
    return false;
}
function rotatePiece() {
    if (!currentPiece)
        return;
    const rotated = currentPiece[0].map((_, index) => currentPiece.map(row => row[index]).reverse());
    if (!checkCollision(rotated, currentPiecePos.x, currentPiecePos.y)) {
        currentPiece = rotated;
    }
}
function lockPiece() {
    if (!currentPiece)
        return;
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
    if (!ctx)
        return;
    ctx.clearRect(0, 0, TETRIS_COLS * BLOCK_SIZE, TETRIS_ROWS * BLOCK_SIZE);
    for (let r = 0; r < TETRIS_ROWS; r++) {
        for (let c = 0; c < TETRIS_COLS; c++) {
            const cellColor = tetrisBoard[r][c];
            if (cellColor) {
                ctx.fillStyle = cellColor;
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
        if (e.key === 'ArrowLeft')
            movePiece(-1, 0);
        if (e.key === 'ArrowRight')
            movePiece(1, 0);
        if (e.key === 'ArrowDown')
            movePiece(0, 1);
        if (e.key === 'ArrowUp')
            rotatePiece();
        drawTetris();
    }
}
function drawNextPiece() {
    if (!nextCtx || !nextPieceCanvas)
        return;
    const canvasW = nextPieceCanvas.width;
    const canvasH = nextPieceCanvas.height;
    nextCtx.clearRect(0, 0, canvasW, canvasH);
    if (nextPieceIndex === -1)
        return;
    const piece = PIECES_DATA[nextPieceIndex].shape;
    const color = PIECES_DATA[nextPieceIndex].color;
    const previewBlockSize = 20;
    // Center the piece in the preview canvas
    const pieceW = piece[0].length * previewBlockSize;
    const pieceH = piece.length * previewBlockSize;
    const offsetX = (canvasW - pieceW) / 2;
    const offsetY = (canvasH - pieceH) / 2;
    nextCtx.fillStyle = color;
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c]) {
                nextCtx.fillRect(offsetX + c * previewBlockSize, offsetY + r * previewBlockSize, previewBlockSize, previewBlockSize);
            }
        }
    }
}
// Mobile controls for Tetris
function setupMobileControls() {
    const addControl = (btn, action) => {
        if (!btn)
            return;
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            action();
            drawTetris();
        });
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            action();
            drawTetris();
        });
    };
    addControl(tetrisBtnLeft, () => movePiece(-1, 0));
    addControl(tetrisBtnRight, () => movePiece(1, 0));
    addControl(tetrisBtnDown, () => movePiece(0, 1));
    addControl(tetrisBtnRotate, () => rotatePiece());
}
setupMobileControls();
// =============================================
// Snake Game
// =============================================
function initSnake() {
    if (snakeInterval)
        clearInterval(snakeInterval);
    snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    snakeDir = { x: 1, y: 0 };
    snakeNextDir = { x: 1, y: 0 };
    snakeScore = 0;
    snakeGameOver = false;
    if (snakeStatusElement)
        snakeStatusElement.textContent = `Punkte: ${snakeScore}`;
    placeFood();
    drawSnake();
    snakeInterval = setInterval(() => {
        snakeDir = Object.assign({}, snakeNextDir);
        moveSnake();
        drawSnake();
    }, 150);
}
function placeFood() {
    let free = false;
    while (!free) {
        const fx = Math.floor(Math.random() * SNAKE_COLS);
        const fy = Math.floor(Math.random() * SNAKE_ROWS);
        free = true;
        for (const seg of snake) {
            if (seg.x === fx && seg.y === fy) {
                free = false;
                break;
            }
        }
        if (free) {
            snakeFood = { x: fx, y: fy };
        }
    }
}
function moveSnake() {
    if (snakeGameOver)
        return;
    const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };
    // Wall collision
    if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS) {
        endSnake();
        return;
    }
    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            endSnake();
            return;
        }
    }
    snake.unshift(head);
    // Check food
    if (head.x === snakeFood.x && head.y === snakeFood.y) {
        snakeScore += 10;
        if (snakeStatusElement)
            snakeStatusElement.textContent = `Punkte: ${snakeScore}`;
        placeFood();
    }
    else {
        snake.pop();
    }
}
function endSnake() {
    snakeGameOver = true;
    if (snakeInterval)
        clearInterval(snakeInterval);
    if (snakeStatusElement)
        snakeStatusElement.textContent = `Game Over! Punkte: ${snakeScore}`;
}
function drawSnake() {
    if (!snakeCtx)
        return;
    snakeCtx.clearRect(0, 0, SNAKE_CANVAS_SIZE, SNAKE_CANVAS_SIZE);
    // Draw food
    snakeCtx.fillStyle = '#ff0000';
    snakeCtx.fillRect(snakeFood.x * SNAKE_SIZE, snakeFood.y * SNAKE_SIZE, SNAKE_SIZE, SNAKE_SIZE);
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const g = 255 - Math.floor((i / snake.length) * 200);
        snakeCtx.fillStyle = `rgb(0, ${g}, 0)`;
        snakeCtx.fillRect(snake[i].x * SNAKE_SIZE, snake[i].y * SNAKE_SIZE, SNAKE_SIZE - 1, SNAKE_SIZE - 1);
    }
}
function handleSnakeKey(e) {
    if (snakeGameOver)
        return;
    switch (e.key) {
        case 'ArrowUp':
            if (snakeDir.y !== 1)
                snakeNextDir = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (snakeDir.y !== -1)
                snakeNextDir = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (snakeDir.x !== 1)
                snakeNextDir = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (snakeDir.x !== -1)
                snakeNextDir = { x: 1, y: 0 };
            break;
    }
    e.preventDefault();
}
if (resetSnakeBtn)
    resetSnakeBtn.addEventListener('click', initSnake);
// Snake mobile controls
function setupSnakeControls() {
    const addSnakeControl = (btn, dx, dy) => {
        if (!btn)
            return;
        const handler = () => {
            if (snakeGameOver)
                return;
            if (dx === 0 && dy === -1 && snakeDir.y !== 1)
                snakeNextDir = { x: 0, y: -1 };
            else if (dx === 0 && dy === 1 && snakeDir.y !== -1)
                snakeNextDir = { x: 0, y: 1 };
            else if (dx === -1 && dy === 0 && snakeDir.x !== 1)
                snakeNextDir = { x: -1, y: 0 };
            else if (dx === 1 && dy === 0 && snakeDir.x !== -1)
                snakeNextDir = { x: 1, y: 0 };
        };
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); handler(); });
        btn.addEventListener('click', (e) => { e.preventDefault(); handler(); });
    };
    addSnakeControl(snakeBtnUp, 0, -1);
    addSnakeControl(snakeBtnDown, 0, 1);
    addSnakeControl(snakeBtnLeft, -1, 0);
    addSnakeControl(snakeBtnRight, 1, 0);
}
setupSnakeControls();
// =============================================
// Pong Game
// =============================================
function initPong() {
    if (pongInterval)
        clearInterval(pongInterval);
    pongMode = pongModeSelect ? pongModeSelect.value : '2p';
    pongLeftY = 160;
    pongRightY = 160;
    pongBallX = 300;
    pongBallY = 200;
    pongBallDX = 4 * (Math.random() > 0.5 ? 1 : -1);
    pongBallDY = 4 * (Math.random() > 0.5 ? 1 : -1);
    pongLeftScore = 0;
    pongRightScore = 0;
    pongGameOver = false;
    pongLeftMoving = 0;
    pongRightMoving = 0;
    if (pongStatusElement)
        pongStatusElement.textContent = 'Player 1: 0 | Player 2: 0';
    drawPong();
    pongInterval = setInterval(() => {
        updatePong();
        drawPong();
    }, 20);
}
function updatePong() {
    if (pongGameOver)
        return;
    // Move paddles
    pongLeftY += pongLeftMoving * PADDLE_SPEED;
    if (pongMode === '1p') {
        // Simple AI: follow the ball
        const target = pongBallY - PADDLE_HEIGHT / 2;
        const diff = target - pongRightY;
        if (Math.abs(diff) > AI_SPEED) {
            pongRightY += Math.sign(diff) * AI_SPEED;
        }
    }
    else {
        pongRightY += pongRightMoving * PADDLE_SPEED;
    }
    // Clamp paddles
    pongLeftY = Math.max(0, Math.min(PONG_HEIGHT - PADDLE_HEIGHT, pongLeftY));
    pongRightY = Math.max(0, Math.min(PONG_HEIGHT - PADDLE_HEIGHT, pongRightY));
    // Move ball
    pongBallX += pongBallDX;
    pongBallY += pongBallDY;
    // Top / bottom wall
    if (pongBallY <= 0 || pongBallY >= PONG_HEIGHT - BALL_SIZE) {
        pongBallDY = -pongBallDY;
    }
    // Left paddle
    if (pongBallX <= 10 + BALL_SIZE && pongBallX >= 10 &&
        pongBallY + BALL_SIZE >= pongLeftY && pongBallY <= pongLeftY + PADDLE_HEIGHT) {
        pongBallDX = -pongBallDX;
        pongBallX = 10 + BALL_SIZE + 1;
    }
    // Right paddle
    if (pongBallX >= PONG_WIDTH - 10 - BALL_SIZE && pongBallX <= PONG_WIDTH - 10 &&
        pongBallY + BALL_SIZE >= pongRightY && pongBallY <= pongRightY + PADDLE_HEIGHT) {
        pongBallDX = -pongBallDX;
        pongBallX = PONG_WIDTH - 10 - BALL_SIZE - 1;
    }
    // Scoring
    if (pongBallX < 0) {
        pongRightScore++;
        resetPongBall();
    }
    if (pongBallX > PONG_WIDTH) {
        pongLeftScore++;
        resetPongBall();
    }
    if (pongStatusElement)
        pongStatusElement.textContent = `Player 1: ${pongLeftScore} | Player 2: ${pongRightScore}`;
    // Win at 10
    if (pongLeftScore >= 10 || pongRightScore >= 10) {
        pongGameOver = true;
        if (pongInterval)
            clearInterval(pongInterval);
        const winner = pongLeftScore >= 10 ? 'Player 1' : 'Player 2';
        if (pongStatusElement)
            pongStatusElement.textContent = `${winner} hat gewonnen! (${pongLeftScore}:${pongRightScore})`;
    }
}
function resetPongBall() {
    pongBallX = PONG_WIDTH / 2;
    pongBallY = PONG_HEIGHT / 2;
    pongBallDX = 4 * (Math.random() > 0.5 ? 1 : -1);
    pongBallDY = 4 * (Math.random() > 0.5 ? 1 : -1);
}
function drawPong() {
    if (!pongCtx)
        return;
    pongCtx.clearRect(0, 0, PONG_WIDTH, PONG_HEIGHT);
    // Center line
    pongCtx.strokeStyle = '#fff';
    pongCtx.setLineDash([10, 10]);
    pongCtx.beginPath();
    pongCtx.moveTo(PONG_WIDTH / 2, 0);
    pongCtx.lineTo(PONG_WIDTH / 2, PONG_HEIGHT);
    pongCtx.stroke();
    pongCtx.setLineDash([]);
    // Left paddle
    pongCtx.fillStyle = '#fff';
    pongCtx.fillRect(10, pongLeftY, PADDLE_WIDTH, PADDLE_HEIGHT);
    // Right paddle
    pongCtx.fillRect(PONG_WIDTH - 10 - PADDLE_WIDTH, pongRightY, PADDLE_WIDTH, PADDLE_HEIGHT);
    // Ball
    pongCtx.fillRect(pongBallX, pongBallY, BALL_SIZE, BALL_SIZE);
}
function handlePongKey(e, isDown) {
    if (pongGameOver)
        return;
    // Left paddle controls: W / S
    if (e.key === 'w' || e.key === 'W')
        pongLeftMoving = isDown ? -1 : 0;
    if (e.key === 's' || e.key === 'S')
        pongLeftMoving = isDown ? 1 : 0;
    // Right paddle controls: ArrowUp / ArrowDown
    if (e.key === 'ArrowUp')
        pongRightMoving = isDown ? -1 : 0;
    if (e.key === 'ArrowDown')
        pongRightMoving = isDown ? 1 : 0;
    e.preventDefault();
}
if (resetPongBtn)
    resetPongBtn.addEventListener('click', initPong);
if (pongModeSelect)
    pongModeSelect.addEventListener('change', () => initPong());
// Pong mobile controls
function setupPongControls() {
    const addPongControl = (btn, side, dir) => {
        if (!btn)
            return;
        const start = () => {
            if (side === 'left')
                pongLeftMoving = dir;
            else
                pongRightMoving = dir;
        };
        const stop = () => {
            if (side === 'left')
                pongLeftMoving = 0;
            else
                pongRightMoving = 0;
        };
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); start(); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); stop(); });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); start(); });
        btn.addEventListener('mouseup', (e) => { e.preventDefault(); stop(); });
    };
    addPongControl(pongBtnLeftUp, 'left', -1);
    addPongControl(pongBtnLeftDown, 'left', 1);
    addPongControl(pongBtnRightUp, 'right', -1);
    addPongControl(pongBtnRightDown, 'right', 1);
}
setupPongControls();
// =============================================
// Space Invaders Game
// =============================================
function initSpaceInvaders() {
    if (spaceInvadersInterval)
        clearInterval(spaceInvadersInterval);
    if (!spaceInvadersCanvas)
        return;
    siPlayerX = (spaceInvadersCanvas.width - SI_PLAYER_WIDTH) / 2;
    siBullets = [];
    siAlienBullets = [];
    siScore = 0;
    siGameOver = false;
    siAlienDir = 1;
    siAlienSpeed = 1;
    siAlienMoveTimer = 0;
    siAlienMoveInterval = 30;
    if (spaceInvadersStatusElement)
        spaceInvadersStatusElement.textContent = 'Punkte: 0';
    // Create aliens
    siAliens = [];
    for (let r = 0; r < SI_ALIEN_ROWS; r++) {
        for (let c = 0; c < SI_ALIEN_COLS; c++) {
            siAliens.push({
                x: SI_ALIEN_OFFSET_LEFT + c * (SI_ALIEN_WIDTH + SI_ALIEN_GAP),
                y: SI_ALIEN_OFFSET_TOP + r * (SI_ALIEN_HEIGHT + SI_ALIEN_GAP),
                alive: true,
                row: r
            });
        }
    }
    spaceInvadersInterval = setInterval(() => {
        updateSpaceInvaders();
        drawSpaceInvaders();
    }, 16);
}
function updateSpaceInvaders() {
    if (siGameOver)
        return;
    // Move aliens
    siAlienMoveTimer++;
    if (siAlienMoveTimer >= siAlienMoveInterval) {
        siAlienMoveTimer = 0;
        let shouldDrop = false;
        const aliveAliens = siAliens.filter(a => a.alive);
        // Check if any alien needs to drop
        for (const alien of aliveAliens) {
            if (!spaceInvadersCanvas)
                return;
            if ((siAlienDir === 1 && alien.x + SI_ALIEN_WIDTH >= spaceInvadersCanvas.width - 10) ||
                (siAlienDir === -1 && alien.x <= 10)) {
                shouldDrop = true;
                break;
            }
        }
        if (shouldDrop) {
            siAlienDir *= -1;
            for (const alien of aliveAliens) {
                alien.y += siAlienDropAmount;
            }
            // Increase speed when aliens are lower
            if (aliveAliens.length > 0) {
                const minRow = Math.min(...aliveAliens.map(a => a.row));
                siAlienMoveInterval = Math.max(5, 30 - minRow * 5);
            }
        }
        else {
            for (const alien of aliveAliens) {
                alien.x += siAlienDir * siAlienSpeed;
            }
        }
        // Random alien shooting
        if (aliveAliens.length > 0 && Math.random() < 0.3) {
            const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            siAlienBullets.push({
                x: shooter.x + SI_ALIEN_WIDTH / 2,
                y: shooter.y + SI_ALIEN_HEIGHT,
                speed: 3
            });
        }
        // Check if aliens reached bottom
        for (const alien of aliveAliens) {
            if (!spaceInvadersCanvas)
                return;
            if (alien.y + SI_ALIEN_HEIGHT >= spaceInvadersCanvas.height - SI_PLAYER_HEIGHT - 20) {
                siGameOver = true;
                if (spaceInvadersStatusElement)
                    spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${siScore}`;
                if (spaceInvadersInterval)
                    clearInterval(spaceInvadersInterval);
                return;
            }
        }
        // Check win
        if (aliveAliens.length === 0) {
            // Respawn aliens with faster speed
            siAlienSpeed += 0.5;
            siAlienMoveInterval = Math.max(5, 30 - siAlienSpeed * 3);
            for (let r = 0; r < SI_ALIEN_ROWS; r++) {
                for (let c = 0; c < SI_ALIEN_COLS; c++) {
                    siAliens.push({
                        x: SI_ALIEN_OFFSET_LEFT + c * (SI_ALIEN_WIDTH + SI_ALIEN_GAP),
                        y: SI_ALIEN_OFFSET_TOP + r * (SI_ALIEN_HEIGHT + SI_ALIEN_GAP),
                        alive: true,
                        row: r
                    });
                }
            }
        }
    }
    // Move player bullets
    for (let i = siBullets.length - 1; i >= 0; i--) {
        siBullets[i].y -= 5;
        if (siBullets[i].y < 0) {
            siBullets.splice(i, 1);
        }
    }
    // Move alien bullets
    for (let i = siAlienBullets.length - 1; i >= 0; i--) {
        siAlienBullets[i].y += siAlienBullets[i].speed;
        if (siAlienBullets[i].y > (spaceInvadersCanvas ? spaceInvadersCanvas.height : 0)) {
            siAlienBullets.splice(i, 1);
        }
    }
    // Check bullet-alien collisions
    for (let i = siBullets.length - 1; i >= 0; i--) {
        const bullet = siBullets[i];
        for (const alien of siAliens) {
            if (alien.alive &&
                bullet.x < alien.x + SI_ALIEN_WIDTH &&
                bullet.x + SI_BULLET_WIDTH > alien.x &&
                bullet.y < alien.y + SI_ALIEN_HEIGHT &&
                bullet.y + SI_BULLET_HEIGHT > alien.y) {
                alien.alive = false;
                siBullets.splice(i, 1);
                siScore += (SI_ALIEN_ROWS - alien.row) * 10;
                if (spaceInvadersStatusElement)
                    spaceInvadersStatusElement.textContent = `Punkte: ${siScore}`;
                break;
            }
        }
    }
    // Check alien bullet-player collisions
    for (const bullet of siAlienBullets) {
        if (!spaceInvadersCanvas)
            return;
        if (bullet.x < siPlayerX + SI_PLAYER_WIDTH &&
            bullet.x + SI_ALIEN_BULLET_WIDTH > siPlayerX &&
            bullet.y < spaceInvadersCanvas.height - 30 &&
            bullet.y + SI_ALIEN_BULLET_HEIGHT > spaceInvadersCanvas.height - 30) {
            siGameOver = true;
            if (spaceInvadersStatusElement)
                spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${siScore}`;
            if (spaceInvadersInterval)
                clearInterval(spaceInvadersInterval);
            return;
        }
    }
}
function drawSpaceInvaders() {
    if (!spaceInvadersCtx || !spaceInvadersCanvas)
        return;
    spaceInvadersCtx.clearRect(0, 0, spaceInvadersCanvas.width, spaceInvadersCanvas.height);
    // Draw aliens
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    for (const alien of siAliens) {
        if (!alien.alive)
            continue;
        spaceInvadersCtx.fillStyle = colors[alien.row % colors.length];
        spaceInvadersCtx.fillRect(alien.x, alien.y, SI_ALIEN_WIDTH, SI_ALIEN_HEIGHT);
        // Eyes
        spaceInvadersCtx.fillStyle = '#000';
        spaceInvadersCtx.fillRect(alien.x + 7, alien.y + 6, 5, 5);
        spaceInvadersCtx.fillRect(alien.x + 18, alien.y + 6, 5, 5);
    }
    // Draw player
    spaceInvadersCtx.fillStyle = '#00ff00';
    spaceInvadersCtx.fillRect(siPlayerX, spaceInvadersCanvas.height - 30, SI_PLAYER_WIDTH, SI_PLAYER_HEIGHT);
    // Player cannon
    spaceInvadersCtx.fillRect(siPlayerX + SI_PLAYER_WIDTH / 2 - 3, spaceInvadersCanvas.height - 38, 6, 8);
    // Draw player bullets
    spaceInvadersCtx.fillStyle = '#ffff00';
    for (const bullet of siBullets) {
        spaceInvadersCtx.fillRect(bullet.x, bullet.y, SI_BULLET_WIDTH, SI_BULLET_HEIGHT);
    }
    // Draw alien bullets
    spaceInvadersCtx.fillStyle = '#ff4444';
    for (const bullet of siAlienBullets) {
        spaceInvadersCtx.fillRect(bullet.x, bullet.y, SI_ALIEN_BULLET_WIDTH, SI_ALIEN_BULLET_HEIGHT);
    }
}
function handleSpaceInvadersKey(e, isDown) {
    if (!spaceInvadersCanvas)
        return;
    if (isDown) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            siPlayerX = Math.max(0, siPlayerX - 15);
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            siPlayerX = Math.min(spaceInvadersCanvas.width - SI_PLAYER_WIDTH, siPlayerX + 15);
        }
        if (e.key === ' ' || e.key === 'Space') {
            if (siBullets.length < 3) {
                siBullets.push({
                    x: siPlayerX + SI_PLAYER_WIDTH / 2 - SI_BULLET_WIDTH / 2,
                    y: spaceInvadersCanvas.height - 38
                });
            }
        }
    }
    e.preventDefault();
}
if (resetSpaceInvadersBtn)
    resetSpaceInvadersBtn.addEventListener('click', initSpaceInvaders);
// Space Invaders mobile controls
function setupSpaceInvadersControls() {
    const addControl = (btn, action) => {
        if (!btn)
            return;
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); });
        btn.addEventListener('click', (e) => { e.preventDefault(); action(); });
    };
    addControl(spaceInvadersBtnLeft, () => {
        if (!siGameOver)
            siPlayerX = Math.max(0, siPlayerX - 15);
    });
    addControl(spaceInvadersBtnRight, () => {
        if (!siGameOver)
            siPlayerX = Math.min(spaceInvadersCanvas ? spaceInvadersCanvas.width - SI_PLAYER_WIDTH : 0, siPlayerX + 15);
    });
    addControl(spaceInvadersBtnShoot, () => {
        if (!siGameOver && siBullets.length < 3 && spaceInvadersCanvas) {
            siBullets.push({
                x: siPlayerX + SI_PLAYER_WIDTH / 2 - SI_BULLET_WIDTH / 2,
                y: spaceInvadersCanvas.height - 38
            });
        }
    });
}
setupSpaceInvadersControls();
// =============================================
// Breakout Game
// =============================================
function initBreakout() {
    if (breakoutInterval)
        clearInterval(breakoutInterval);
    if (!breakoutCanvas)
        return;
    breakoutPaddleX = (breakoutCanvas.width - BREAKOUT_PADDLE_WIDTH) / 2;
    breakoutBallX = breakoutCanvas.width / 2;
    breakoutBallY = breakoutCanvas.height - 40;
    breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
    breakoutBallDY = -3;
    breakoutScore = 0;
    breakoutLives = 3;
    breakoutGameOver = false;
    breakoutPaddleMoving = 0;
    // Create bricks
    breakoutBricks = [];
    const brickColors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff'];
    for (let r = 0; r < BREAKOUT_BRICK_ROWS; r++) {
        for (let c = 0; c < BREAKOUT_BRICK_COLS; c++) {
            breakoutBricks.push({
                x: BREAKOUT_BRICK_OFFSET_LEFT + c * (BREAKOUT_BRICK_WIDTH + BREAKOUT_BRICK_GAP),
                y: BREAKOUT_BRICK_OFFSET_TOP + r * (BREAKOUT_BRICK_HEIGHT + BREAKOUT_BRICK_GAP),
                color: brickColors[r],
                alive: true
            });
        }
    }
    if (breakoutStatusElement)
        breakoutStatusElement.textContent = `Punkte: 0 | Leben: ${breakoutLives}`;
    breakoutInterval = setInterval(() => {
        updateBreakout();
        drawBreakout();
    }, 16);
}
function updateBreakout() {
    if (breakoutGameOver)
        return;
    // Move paddle
    breakoutPaddleX += breakoutPaddleMoving * BREAKOUT_PADDLE_SPEED;
    if (breakoutCanvas)
        breakoutPaddleX = Math.max(0, Math.min(breakoutCanvas.width - BREAKOUT_PADDLE_WIDTH, breakoutPaddleX));
    // Move ball
    breakoutBallX += breakoutBallDX;
    breakoutBallY += breakoutBallDY;
    // Wall collisions
    if (!breakoutCanvas)
        return;
    if (breakoutBallX - BREAKOUT_BALL_RADIUS <= 0 || breakoutBallX + BREAKOUT_BALL_RADIUS >= breakoutCanvas.width) {
        breakoutBallDX = -breakoutBallDX;
    }
    if (breakoutBallY - BREAKOUT_BALL_RADIUS <= 0) {
        breakoutBallDY = -breakoutBallDY;
    }
    // Paddle collision
    if (breakoutBallY + BREAKOUT_BALL_RADIUS >= breakoutCanvas.height - 30 &&
        breakoutBallY + BREAKOUT_BALL_RADIUS <= breakoutCanvas.height - 15 &&
        breakoutBallX >= breakoutPaddleX &&
        breakoutBallX <= breakoutPaddleX + BREAKOUT_PADDLE_WIDTH) {
        breakoutBallDY = -Math.abs(breakoutBallDY);
        // Add angle based on where ball hits paddle
        const hitPos = (breakoutBallX - breakoutPaddleX) / BREAKOUT_PADDLE_WIDTH;
        breakoutBallDX = 6 * (hitPos - 0.5);
    }
    // Bottom collision (lose life)
    if (breakoutBallY + BREAKOUT_BALL_RADIUS > breakoutCanvas.height) {
        breakoutLives--;
        if (breakoutLives <= 0) {
            breakoutGameOver = true;
            if (breakoutStatusElement)
                breakoutStatusElement.textContent = `Game Over! Punkte: ${breakoutScore}`;
            if (breakoutInterval)
                clearInterval(breakoutInterval);
            return;
        }
        breakoutBallX = breakoutCanvas.width / 2;
        breakoutBallY = breakoutCanvas.height - 40;
        breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
        breakoutBallDY = -3;
        if (breakoutStatusElement)
            breakoutStatusElement.textContent = `Punkte: ${breakoutScore} | Leben: ${breakoutLives}`;
    }
    // Brick collisions
    for (const brick of breakoutBricks) {
        if (!brick.alive)
            continue;
        if (breakoutBallX + BREAKOUT_BALL_RADIUS > brick.x &&
            breakoutBallX - BREAKOUT_BALL_RADIUS < brick.x + BREAKOUT_BRICK_WIDTH &&
            breakoutBallY + BREAKOUT_BALL_RADIUS > brick.y &&
            breakoutBallY - BREAKOUT_BALL_RADIUS < brick.y + BREAKOUT_BRICK_HEIGHT) {
            brick.alive = false;
            breakoutBallDY = -breakoutBallDY;
            breakoutScore += 10;
            if (breakoutStatusElement)
                breakoutStatusElement.textContent = `Punkte: ${breakoutScore} | Leben: ${breakoutLives}`;
            break;
        }
    }
    // Check win
    if (breakoutBricks.every(b => !b.alive)) {
        breakoutGameOver = true;
        if (breakoutStatusElement)
            breakoutStatusElement.textContent = `Gewonnen! Punkte: ${breakoutScore}`;
        if (breakoutInterval)
            clearInterval(breakoutInterval);
    }
}
function drawBreakout() {
    if (!breakoutCtx)
        return;
    breakoutCtx.clearRect(0, 0, breakoutCtx.canvas.width, breakoutCtx.canvas.height);
    // Draw bricks
    for (const brick of breakoutBricks) {
        if (!brick.alive)
            continue;
        breakoutCtx.fillStyle = brick.color;
        breakoutCtx.fillRect(brick.x, brick.y, BREAKOUT_BRICK_WIDTH, BREAKOUT_BRICK_HEIGHT);
        breakoutCtx.strokeStyle = '#333';
        breakoutCtx.strokeRect(brick.x, brick.y, BREAKOUT_BRICK_WIDTH, BREAKOUT_BRICK_HEIGHT);
    }
    // Draw paddle
    breakoutCtx.fillStyle = '#007bff';
    breakoutCtx.fillRect(breakoutPaddleX, breakoutCtx.canvas.height - 30, BREAKOUT_PADDLE_WIDTH, BREAKOUT_PADDLE_HEIGHT);
    // Draw ball
    breakoutCtx.beginPath();
    breakoutCtx.arc(breakoutBallX, breakoutBallY, BREAKOUT_BALL_RADIUS, 0, Math.PI * 2);
    breakoutCtx.fillStyle = '#fff';
    breakoutCtx.fill();
    breakoutCtx.closePath();
}
function handleBreakoutKey(e, isDown) {
    if (isDown) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            breakoutPaddleMoving = -1;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            breakoutPaddleMoving = 1;
        }
    }
    else {
        if ((e.key === 'ArrowLeft' || e.key === 'a') && breakoutPaddleMoving === -1) {
            breakoutPaddleMoving = 0;
        }
        if ((e.key === 'ArrowRight' || e.key === 'd') && breakoutPaddleMoving === 1) {
            breakoutPaddleMoving = 0;
        }
    }
    e.preventDefault();
}
if (resetBreakoutBtn)
    resetBreakoutBtn.addEventListener('click', initBreakout);
// Breakout mobile controls
function setupBreakoutControls() {
    const addControl = (btn, direction) => {
        if (!btn)
            return;
        const start = () => { breakoutPaddleMoving = direction; };
        const stop = () => { breakoutPaddleMoving = 0; };
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); start(); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); stop(); });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); start(); });
        btn.addEventListener('mouseup', (e) => { e.preventDefault(); stop(); });
    };
    addControl(breakoutBtnLeft, -1);
    addControl(breakoutBtnRight, 1);
}
setupBreakoutControls();
// =============================================
// Boulder Dash Game
// =============================================
function initBoulderDash() {
    if (bd.interval)
        clearInterval(bd.interval);
    bd.canvas = bdCanvas;
    bd.ctx = bdCanvas ? bdCanvas.getContext('2d') : null;
    if (!bd.canvas || !bd.ctx)
        return;
    bd.score = 0;
    bd.collectedDiamonds = 0;
    bd.totalDiamonds = 0;
    bd.gameOver = false;
    bd.won = false;
    // Generate a random cave
    generateBdCave();
    // Find player start position
    for (let y = 0; y < BD_SIZE; y++) {
        for (let x = 0; x < BD_SIZE; x++) {
            if (bd.board[y][x] === BD_PLAYER_CHAR) {
                bd.playerX = x;
                bd.playerY = y;
            }
        }
    }
    // Count total diamonds
    bd.totalDiamonds = 0;
    for (let y = 0; y < BD_SIZE; y++) {
        for (let x = 0; x < BD_SIZE; x++) {
            if (bd.board[y][x] === BD_DIAMOND_CHAR) {
                bd.totalDiamonds++;
            }
        }
    }
    if (bd.totalDiamonds < BD_TARGET_COLLECT) {
        bd.totalDiamonds = BD_TARGET_COLLECT;
    }
    updateBdStatus();
    drawBdBoard();
    bd.interval = setInterval(() => {
        updateBdPhysics();
        drawBdBoard();
        checkBdWinCondition();
    }, 100);
}
function generateBdCave() {
    // Start with all dirt
    bd.board = [];
    for (let y = 0; y < BD_SIZE; y++) {
        bd.board[y] = [];
        for (let x = 0; x < BD_SIZE; x++) {
            bd.board[y][x] = BD_DIRT_CHAR;
        }
    }
    // Border walls
    for (let x = 0; x < BD_SIZE; x++) {
        bd.board[0][x] = BD_WALL_CHAR;
        bd.board[BD_SIZE - 1][x] = BD_WALL_CHAR;
    }
    for (let y = 0; y < BD_SIZE; y++) {
        bd.board[y][0] = BD_WALL_CHAR;
        bd.board[y][BD_SIZE - 1] = BD_WALL_CHAR;
    }
    // Random walls (pillars/obstacles)
    const numWalls = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numWalls; i++) {
        const x = 2 + Math.floor(Math.random() * (BD_SIZE - 4));
        const y = 2 + Math.floor(Math.random() * (BD_SIZE - 4));
        // Place a 2x2 wall cluster
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                if (y + dy < BD_SIZE - 1 && x + dx < BD_SIZE - 1) {
                    bd.board[y + dy][x + dx] = BD_WALL_CHAR;
                }
            }
        }
    }
    // Place boulders (10-18)
    const numBoulders = 10 + Math.floor(Math.random() * 9);
    for (let i = 0; i < numBoulders; i++) {
        const x = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        const y = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        if (bd.board[y][x] === BD_DIRT_CHAR) {
            bd.board[y][x] = BD_BOULDER_CHAR;
        }
    }
    // Place diamonds (15-25)
    const numDiamonds = 15 + Math.floor(Math.random() * 11);
    for (let i = 0; i < numDiamonds; i++) {
        const x = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        const y = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        if (bd.board[y][x] === BD_DIRT_CHAR) {
            bd.board[y][x] = BD_DIAMOND_CHAR;
        }
    }
    // Place player at a safe position (top-left area)
    bd.board[2][2] = BD_PLAYER_CHAR;
    bd.playerX = 2;
    bd.playerY = 2;
    // Place magic wall (optional)
    const mwX = BD_SIZE - 3;
    const mwY = BD_SIZE - 3;
    if (bd.board[mwY][mwX] === BD_DIRT_CHAR) {
        bd.board[mwY][mwX] = BD_MAGIC_WALL_CHAR;
    }
}
function updateBdStatus() {
    if (bdStatusElement) {
        if (bd.won) {
            bdStatusElement.textContent = `🎉 Gewonnen! 💎 ${bd.collectedDiamonds}/${bd.totalDiamonds}  Punkte: ${bd.score}`;
        }
        else if (bd.gameOver) {
            bdStatusElement.textContent = `💀 Game Over! 💎 ${bd.collectedDiamonds}/${bd.totalDiamonds}`;
        }
        else {
            bdStatusElement.textContent = `Sammle 💎 ${bd.collectedDiamonds}/${bd.totalDiamonds}  Punkte: ${bd.score}`;
        }
    }
}
function drawBdBoard() {
    if (!bd.ctx || !bd.canvas)
        return;
    const ctx = bd.ctx;
    const canvas = bd.canvas;
    const cs = BD_CELL_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < BD_SIZE; y++) {
        for (let x = 0; x < BD_SIZE; x++) {
            const cell = bd.board[y][x];
            const px = x * cs;
            const py = y * cs;
            switch (cell) {
                case BD_EMPTY_CHAR:
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(px, py, cs, cs);
                    break;
                case BD_WALL_CHAR:
                    ctx.fillStyle = '#555';
                    ctx.fillRect(px, py, cs, cs);
                    ctx.strokeStyle = '#777';
                    ctx.strokeRect(px, py, cs, cs);
                    break;
                case BD_DIRT_CHAR:
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(px, py, cs, cs);
                    // Dirt texture
                    ctx.fillStyle = '#A0522D';
                    ctx.fillRect(px + 4, py + 4, 3, 3);
                    ctx.fillRect(px + 12, py + 10, 3, 3);
                    ctx.fillRect(px + 7, py + 15, 3, 3);
                    break;
                case BD_BOULDER_CHAR:
                    ctx.fillStyle = '#888';
                    ctx.fillRect(px, py, cs, cs);
                    // Boulder shading
                    ctx.fillStyle = '#aaa';
                    ctx.beginPath();
                    ctx.arc(px + 6, py + 6, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#666';
                    ctx.beginPath();
                    ctx.arc(px + 14, py + 14, 5, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case BD_DIAMOND_CHAR:
                    ctx.fillStyle = '#00ffff';
                    ctx.fillRect(px, py, cs, cs);
                    // Diamond shape
                    ctx.fillStyle = '#00ced1';
                    ctx.beginPath();
                    ctx.moveTo(px + 10, py + 2);
                    ctx.lineTo(px + 18, py + 10);
                    ctx.lineTo(px + 10, py + 18);
                    ctx.lineTo(px + 2, py + 10);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.lineWidth = 1;
                    break;
                case BD_PLAYER_CHAR:
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(px, py, cs, cs);
                    // Player (Rockford)
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(px + 10, py + 10, 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(px + 8, py + 8, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(px + 12, py + 8, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(px + 10, py + 12, 3, 0, Math.PI);
                    ctx.stroke();
                    break;
                case BD_MAGIC_WALL_CHAR:
                    ctx.fillStyle = '#1a1a2e';
                    ctx.fillRect(px, py, cs, cs);
                    ctx.fillStyle = '#ff00ff';
                    ctx.fillRect(px + 2, py + 2, cs - 4, cs - 4);
                    ctx.fillStyle = '#ff69b4';
                    ctx.fillRect(px + 5, py + 5, cs - 10, cs - 10);
                    ctx.fillStyle = '#ff00ff';
                    ctx.font = '10px monospace';
                    ctx.fillText('★', px + 5, py + 15);
                    break;
            }
        }
    }
    // Draw a subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= BD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cs, 0);
        ctx.lineTo(i * cs, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cs);
        ctx.lineTo(canvas.width, i * cs);
        ctx.stroke();
    }
}
function moveBdPlayer(dx, dy) {
    if (bd.gameOver || bd.won)
        return;
    const nx = bd.playerX + dx;
    const ny = bd.playerY + dy;
    // Bounds check
    if (nx < 1 || nx >= BD_SIZE - 1 || ny < 1 || ny >= BD_SIZE - 1)
        return;
    const target = bd.board[ny][nx];
    // Can't walk through walls or boulders
    if (target === BD_WALL_CHAR || target === BD_BOULDER_CHAR)
        return;
    // Walk through dirt or empty
    if (target === BD_DIRT_CHAR || target === BD_EMPTY_CHAR) {
        // Move player
        bd.board[bd.playerY][bd.playerX] = BD_EMPTY_CHAR;
        bd.playerX = nx;
        bd.playerY = ny;
        bd.board[ny][nx] = BD_PLAYER_CHAR;
        drawBdBoard();
        return;
    }
    // Collect diamond
    if (target === BD_DIAMOND_CHAR) {
        bd.board[bd.playerY][bd.playerX] = BD_EMPTY_CHAR;
        bd.playerX = nx;
        bd.playerY = ny;
        bd.board[ny][nx] = BD_PLAYER_CHAR;
        bd.collectedDiamonds++;
        bd.score += 10;
        updateBdStatus();
        drawBdBoard();
        checkBdWinCondition();
        return;
    }
    // Magic wall: converts all dirt in a 3x3 area to empty
    if (target === BD_MAGIC_WALL_CHAR) {
        bd.board[bd.playerY][bd.playerX] = BD_EMPTY_CHAR;
        bd.playerX = nx;
        bd.playerY = ny;
        bd.board[ny][nx] = BD_PLAYER_CHAR;
        // Convert surrounding dirt to empty
        for (let dy2 = -1; dy2 <= 1; dy2++) {
            for (let dx2 = -1; dx2 <= 1; dx2++) {
                const mx = nx + dx2;
                const my = ny + dy2;
                if (mx >= 1 && mx < BD_SIZE - 1 && my >= 1 && my < BD_SIZE - 1) {
                    if (bd.board[my][mx] === BD_DIRT_CHAR) {
                        bd.board[my][mx] = BD_EMPTY_CHAR;
                    }
                }
            }
        }
        drawBdBoard();
        return;
    }
}
function updateBdPhysics() {
    if (bd.gameOver || bd.won)
        return;
    // Process boulders from bottom to top so they fall correctly
    for (let y = BD_SIZE - 2; y >= 1; y--) {
        for (let x = BD_SIZE - 2; x >= 1; x--) {
            if (bd.board[y][x] === BD_BOULDER_CHAR) {
                // Try to fall straight down
                if (bd.board[y + 1][x] === BD_EMPTY_CHAR) {
                    bd.board[y + 1][x] = BD_BOULDER_CHAR;
                    bd.board[y][x] = BD_EMPTY_CHAR;
                    // Check if boulder falls on player
                    if (y + 1 === bd.playerY && x === bd.playerX) {
                        bd.gameOver = true;
                        updateBdStatus();
                        if (bd.interval)
                            clearInterval(bd.interval);
                        drawBdBoard();
                        return;
                    }
                    // Check if boulder falls on diamond (crushes it)
                    // This is handled because we already checked empty
                }
                else if (bd.board[y + 1][x] === BD_BOULDER_CHAR || bd.board[y + 1][x] === BD_WALL_CHAR || bd.board[y + 1][x] === BD_DIRT_CHAR) {
                    // Try to roll left or right if supported on a diagonal
                    const canRollLeft = (x > 1 && bd.board[y + 1][x - 1] !== BD_EMPTY_CHAR && bd.board[y][x - 1] === BD_EMPTY_CHAR);
                    const canRollRight = (x < BD_SIZE - 2 && bd.board[y + 1][x + 1] !== BD_EMPTY_CHAR && bd.board[y][x + 1] === BD_EMPTY_CHAR);
                    if (canRollLeft) {
                        bd.board[y][x - 1] = BD_BOULDER_CHAR;
                        bd.board[y][x] = BD_EMPTY_CHAR;
                        // Check if boulder rolls onto player
                        if (y === bd.playerY && x - 1 === bd.playerX) {
                            bd.gameOver = true;
                            updateBdStatus();
                            if (bd.interval)
                                clearInterval(bd.interval);
                            drawBdBoard();
                            return;
                        }
                    }
                    else if (canRollRight) {
                        bd.board[y][x + 1] = BD_BOULDER_CHAR;
                        bd.board[y][x] = BD_EMPTY_CHAR;
                        if (y === bd.playerY && x + 1 === bd.playerX) {
                            bd.gameOver = true;
                            updateBdStatus();
                            if (bd.interval)
                                clearInterval(bd.interval);
                            drawBdBoard();
                            return;
                        }
                    }
                }
            }
        }
    }
}
function checkBdWinCondition() {
    if (bd.collectedDiamonds >= BD_TARGET_COLLECT && !bd.won && !bd.gameOver) {
        bd.won = true;
        bd.score += 50; // Bonus for winning
        updateBdStatus();
        if (bd.interval)
            clearInterval(bd.interval);
        drawBdBoard();
    }
}
function handleBdKey(e) {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            moveBdPlayer(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            moveBdPlayer(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            moveBdPlayer(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            moveBdPlayer(1, 0);
            break;
    }
}
function setupBdMobileControls() {
    const addBdControl = (btn, dx, dy) => {
        if (!btn)
            return;
        const action = () => {
            moveBdPlayer(dx, dy);
            drawBdBoard();
            checkBdWinCondition();
        };
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); action(); });
    };
    addBdControl(bdBtnUp, 0, -1);
    addBdControl(bdBtnDown, 0, 1);
    addBdControl(bdBtnLeft, -1, 0);
    addBdControl(bdBtnRight, 1, 0);
}
setupBdMobileControls();
if (resetBdBtn)
    resetBdBtn.addEventListener('click', () => initBoulderDash());
// =============================================
// Global Keyboard Handler
// =============================================
document.addEventListener('keydown', (e) => {
    if (boulderDashContainer && boulderDashContainer.style.display === 'block') {
        handleBdKey(e);
    }
    else if (snakeContainer && snakeContainer.style.display === 'block') {
        handleSnakeKey(e);
    }
    else if (pongContainer && pongContainer.style.display === 'block') {
        handlePongKey(e, true);
    }
    else if (spaceInvadersContainer && spaceInvadersContainer.style.display === 'block') {
        handleSpaceInvadersKey(e, true);
    }
    else if (breakoutContainer && breakoutContainer.style.display === 'block') {
        handleBreakoutKey(e, true);
    }
    else {
        handleTetrisKey(e);
    }
});
document.addEventListener('keyup', (e) => {
    if (pongContainer && pongContainer.style.display === 'block') {
        handlePongKey(e, false);
    }
    else if (spaceInvadersContainer && spaceInvadersContainer.style.display === 'block') {
        handleSpaceInvadersKey(e, false);
    }
    else if (breakoutContainer && breakoutContainer.style.display === 'block') {
        handleBreakoutKey(e, false);
    }
});
// =============================================
// Start the game
// =============================================
initGame();
//# sourceMappingURL=script.js.map
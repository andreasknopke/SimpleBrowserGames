// =============================================
// Type Definitions
// =============================================

type Player = 1 | 2;
type CellValue = 0 | Player;
type Board = CellValue[][];
type GameMode = '1p' | '2p';
type GameId = 'fourWins' | 'minesweeper' | 'tetris' | 'snake' | 'pong' | 'spaceInvaders' | 'breakout' | 'boulderDash' | 'towerDefense';

type MsCellValue = number | 'M';
type MsBoard = MsCellValue[][];

interface PieceData {
    shape: number[][];
    color: string;
}

interface Position {
    x: number;
    y: number;
}

interface SnakeSegment {
    x: number;
    y: number;
}

interface Alien {
    x: number;
    y: number;
    alive: boolean;
    row: number;
}

interface Bullet {
    x: number;
    y: number;
    speed?: number;
}

interface Brick {
    x: number;
    y: number;
    color: string;
    alive: boolean;
}

// =============================================
// Boulder Dash
// =============================================

const BD_SIZE: number = 20; // 20x20 grid
const BD_CELL_SIZE: number = 20; // pixels per cell (400/20)
const BD_PLAYER_CHAR: number = 1;
const BD_WALL_CHAR: number = 2;
const BD_DIRT_CHAR: number = 3;
const BD_BOULDER_CHAR: number = 4;
const BD_DIAMOND_CHAR: number = 5;
const BD_EMPTY_CHAR: number = 0;
const BD_MAGIC_WALL_CHAR: number = 6;
const BD_TARGET_COLLECT: number = 10;

type BdCell = number;
type BdBoard = BdCell[][];

interface BdState {
    board: BdBoard;
    playerX: number;
    playerY: number;
    score: number;
    totalDiamonds: number;
    collectedDiamonds: number;
    gameOver: boolean;
    won: boolean;
    interval: ReturnType<typeof setInterval> | undefined;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
}

let bd: BdState = {
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

const ROWS: number = 6;
const COLS: number = 7;
const PLAYER1: Player = 1; // Red
const PLAYER2: Player = 2; // Yellow

let board: Board = [];
let currentPlayer: Player = PLAYER1;
let gameActive: boolean = true;
let gameMode: GameMode = '2p';
let difficulty: number = 1;

const boardElement: HTMLElement | null = document.getElementById('board');
const statusElement: HTMLElement | null = document.getElementById('status');
const gameModeSelect: HTMLSelectElement | null = document.getElementById('gameMode') as HTMLSelectElement;
const difficultyContainer: HTMLElement | null = document.getElementById('difficultyContainer');
const difficultySelect: HTMLSelectElement | null = document.getElementById('difficulty') as HTMLSelectElement;
const resetBtn: HTMLElement | null = document.getElementById('resetBtn');

// =============================================
// Minesweeper
// =============================================

const btnFourWins: HTMLElement | null = document.getElementById('btnFourWins');
const btnMinesweeper: HTMLElement | null = document.getElementById('btnMinesweeper');
const btnTetris: HTMLElement | null = document.getElementById('btnTetris');
const fourWinsContainer: HTMLElement | null = document.getElementById('fourWinsContainer');
const minesweeperContainer: HTMLElement | null = document.getElementById('minesweeperContainer');
const resetMsBtn: HTMLElement | null = document.getElementById('resetMsBtn');
const msDifficultySelect: HTMLSelectElement | null = document.getElementById('msDifficulty') as HTMLSelectElement;
const msBoardElement: HTMLElement | null = document.getElementById('msBoard');
const msStatusElement: HTMLElement | null = document.getElementById('msStatus');

let msBoard: MsBoard = [];
let msMines: [number, number][] = [];
let msGameOver: boolean = false;
let msFlags: number = 0;
let msMinesCount: number = 0;

// =============================================
// Tetris
// =============================================

const tetrisContainer: HTMLElement | null = document.getElementById('tetrisContainer');
const resetTetrisBtn: HTMLElement | null = document.getElementById('resetTetrisBtn');
const tetrisCanvas: HTMLCanvasElement | null = document.getElementById('tetrisCanvas') as HTMLCanvasElement;
const tetrisStatusElement: HTMLElement | null = document.getElementById('tetrisStatus');
const nextPieceCanvas: HTMLCanvasElement | null = document.getElementById('nextPieceCanvas') as HTMLCanvasElement;
const tetrisBtnLeft: HTMLElement | null = document.getElementById('tetrisBtnLeft');
const tetrisBtnRight: HTMLElement | null = document.getElementById('tetrisBtnRight');
const tetrisBtnDown: HTMLElement | null = document.getElementById('tetrisBtnDown');
const tetrisBtnRotate: HTMLElement | null = document.getElementById('tetrisBtnRotate');

let tetrisInterval: ReturnType<typeof setInterval> | undefined;
let tetrisScore: number = 0;

const TETRIS_ROWS: number = 20;
const TETRIS_COLS: number = 10;
const BLOCK_SIZE: number = 20;
const PIECES_DATA: PieceData[] = [
    { shape: [[1, 1, 1, 1]], color: '#00ffff' }, // I
    { shape: [[1, 1], [1, 1]], color: '#ffff00' }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' }, // T
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' }, // Z
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' }, // J
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffa500' }  // L
];

let tetrisBoard: (string | null)[][] = [];
let currentPiece: number[][] | null = null;
let currentPiecePos: Position = { x: 0, y: 0 };
let currentPieceColor: string = '';
let nextPieceIndex: number = -1;

let ctx: CanvasRenderingContext2D | null = tetrisCanvas ? tetrisCanvas.getContext('2d') : null;
let nextCtx: CanvasRenderingContext2D | null = nextPieceCanvas ? nextPieceCanvas.getContext('2d') : null;

// =============================================
// Snake
// =============================================

const btnSnake: HTMLElement | null = document.getElementById('btnSnake');
const snakeContainer: HTMLElement | null = document.getElementById('snakeContainer');
const resetSnakeBtn: HTMLElement | null = document.getElementById('resetSnakeBtn');
const snakeCanvas: HTMLCanvasElement | null = document.getElementById('snakeCanvas') as HTMLCanvasElement;
const snakeStatusElement: HTMLElement | null = document.getElementById('snakeStatus');
const snakeBtnUp: HTMLElement | null = document.getElementById('snakeBtnUp');
const snakeBtnLeft: HTMLElement | null = document.getElementById('snakeBtnLeft');
const snakeBtnDown: HTMLElement | null = document.getElementById('snakeBtnDown');
const snakeBtnRight: HTMLElement | null = document.getElementById('snakeBtnRight');

let snakeInterval: ReturnType<typeof setInterval> | undefined;

const SNAKE_SIZE: number = 20;
const SNAKE_COLS: number = 20;
const SNAKE_ROWS: number = 20;
const SNAKE_CANVAS_SIZE: number = 400;

let snake: SnakeSegment[] = [];
let snakeDir: Position = { x: 1, y: 0 };
let snakeNextDir: Position = { x: 1, y: 0 };
let snakeFood: Position = { x: 5, y: 5 };
let snakeScore: number = 0;
let snakeGameOver: boolean = false;

let snakeCtx: CanvasRenderingContext2D | null = snakeCanvas ? snakeCanvas.getContext('2d') : null;

// =============================================
// Pong
// =============================================

const btnPong: HTMLElement | null = document.getElementById('btnPong');
const pongContainer: HTMLElement | null = document.getElementById('pongContainer');
const resetPongBtn: HTMLElement | null = document.getElementById('resetPongBtn');
const pongCanvas: HTMLCanvasElement | null = document.getElementById('pongCanvas') as HTMLCanvasElement;
const pongStatusElement: HTMLElement | null = document.getElementById('pongStatus');
const pongModeSelect: HTMLSelectElement | null = document.getElementById('pongMode') as HTMLSelectElement;
const pongBtnLeftUp: HTMLElement | null = document.getElementById('pongBtnLeftUp');
const pongBtnLeftDown: HTMLElement | null = document.getElementById('pongBtnLeftDown');
const pongBtnRightUp: HTMLElement | null = document.getElementById('pongBtnRightUp');
const pongBtnRightDown: HTMLElement | null = document.getElementById('pongBtnRightDown');

let pongInterval: ReturnType<typeof setInterval> | undefined;

const PONG_WIDTH: number = 600;
const PONG_HEIGHT: number = 400;
const PADDLE_WIDTH: number = 10;
const PADDLE_HEIGHT: number = 60;
const BALL_SIZE: number = 8;
const PADDLE_SPEED: number = 5;
const AI_SPEED: number = 4;

let pongMode: GameMode = '2p';
let pongLeftY: number = 160;
let pongRightY: number = 160;
let pongBallX: number = 300;
let pongBallY: number = 200;
let pongBallDX: number = 4;
let pongBallDY: number = 4;
let pongLeftScore: number = 0;
let pongRightScore: number = 0;
let pongGameOver: boolean = false;
let pongLeftMoving: number = 0;
let pongRightMoving: number = 0;

let pongCtx: CanvasRenderingContext2D | null = pongCanvas ? pongCanvas.getContext('2d') : null;

// =============================================
// Space Invaders
// =============================================

const btnSpaceInvaders: HTMLElement | null = document.getElementById('btnSpaceInvaders');
const spaceInvadersContainer: HTMLElement | null = document.getElementById('spaceInvadersContainer');
const resetSpaceInvadersBtn: HTMLElement | null = document.getElementById('resetSpaceInvadersBtn');
const spaceInvadersCanvas: HTMLCanvasElement | null = document.getElementById('spaceInvadersCanvas') as HTMLCanvasElement;
const spaceInvadersStatusElement: HTMLElement | null = document.getElementById('spaceInvadersStatus');
const spaceInvadersBtnLeft: HTMLElement | null = document.getElementById('spaceInvadersBtnLeft');
const spaceInvadersBtnRight: HTMLElement | null = document.getElementById('spaceInvadersBtnRight');
const spaceInvadersBtnShoot: HTMLElement | null = document.getElementById('spaceInvadersBtnShoot');

let spaceInvadersInterval: ReturnType<typeof setInterval> | undefined;
let siPlayerX: number = 220;
let siBullets: Bullet[] = [];
let siAliens: Alien[] = [];
let siAlienBullets: Bullet[] = [];
let siAlienDir: number = 1;
let siAlienSpeed: number = 1;
let siAlienDropAmount: number = 10;
let siScore: number = 0;
let siGameOver: boolean = false;
let siAlienMoveTimer: number = 0;
let siAlienMoveInterval: number = 30;

const SI_ALIEN_ROWS: number = 4;
const SI_ALIEN_COLS: number = 8;
const SI_ALIEN_WIDTH: number = 30;
const SI_ALIEN_HEIGHT: number = 20;
const SI_ALIEN_GAP: number = 10;
const SI_ALIEN_OFFSET_TOP: number = 40;
const SI_ALIEN_OFFSET_LEFT: number = 20;
const SI_PLAYER_WIDTH: number = 40;
const SI_PLAYER_HEIGHT: number = 20;
const SI_BULLET_WIDTH: number = 3;
const SI_BULLET_HEIGHT: number = 10;
const SI_ALIEN_BULLET_WIDTH: number = 3;
const SI_ALIEN_BULLET_HEIGHT: number = 8;

let spaceInvadersCtx: CanvasRenderingContext2D | null = spaceInvadersCanvas ? spaceInvadersCanvas.getContext('2d') : null;

// =============================================
// Breakout
// =============================================

const btnBreakout: HTMLElement | null = document.getElementById('btnBreakout');
const breakoutContainer: HTMLElement | null = document.getElementById('breakoutContainer');
const resetBreakoutBtn: HTMLElement | null = document.getElementById('resetBreakoutBtn');
const breakoutCanvas: HTMLCanvasElement | null = document.getElementById('breakoutCanvas') as HTMLCanvasElement;
const breakoutStatusElement: HTMLElement | null = document.getElementById('breakoutStatus');
const breakoutBtnLeft: HTMLElement | null = document.getElementById('breakoutBtnLeft');
const breakoutBtnRight: HTMLElement | null = document.getElementById('breakoutBtnRight');

let breakoutInterval: ReturnType<typeof setInterval> | undefined;
let breakoutPaddleX: number = 200;
let breakoutBallX: number = 240;
let breakoutBallY: number = 350;
let breakoutBallDX: number = 3;
let breakoutBallDY: number = -3;
let breakoutBricks: Brick[] = [];
let breakoutScore: number = 0;
let breakoutLives: number = 3;
let breakoutGameOver: boolean = false;
let breakoutPaddleMoving: number = 0;

const BREAKOUT_PADDLE_WIDTH: number = 80;
const BREAKOUT_PADDLE_HEIGHT: number = 12;
const BREAKOUT_BRICK_ROWS: number = 5;
const BREAKOUT_BRICK_COLS: number = 8;
const BREAKOUT_BRICK_WIDTH: number = 52;
const BREAKOUT_BRICK_HEIGHT: number = 18;
const BREAKOUT_BRICK_GAP: number = 6;
const BREAKOUT_BRICK_OFFSET_TOP: number = 40;
const BREAKOUT_BRICK_OFFSET_LEFT: number = 10;
const BREAKOUT_BALL_RADIUS: number = 6;
const BREAKOUT_PADDLE_SPEED: number = 6;

let breakoutCtx: CanvasRenderingContext2D | null = breakoutCanvas ? breakoutCanvas.getContext('2d') : null;

// =============================================
// Boulder Dash
// =============================================

const btnBoulderDash: HTMLElement | null = document.getElementById('btnBoulderDash');
const boulderDashContainer: HTMLElement | null = document.getElementById('boulderDashContainer');
const resetBdBtn: HTMLElement | null = document.getElementById('resetBdBtn');
const bdCanvas: HTMLCanvasElement | null = document.getElementById('bdCanvas') as HTMLCanvasElement;
const bdStatusElement: HTMLElement | null = document.getElementById('bdStatus');
const bdBtnUp: HTMLElement | null = document.getElementById('bdBtnUp');
const bdBtnDown: HTMLElement | null = document.getElementById('bdBtnDown');
const bdBtnLeft: HTMLElement | null = document.getElementById('bdBtnLeft');
const bdBtnRight: HTMLElement | null = document.getElementById('bdBtnRight');

// =============================================
// Tower Defense DOM References
// =============================================

const btnTowerDefense: HTMLElement | null = document.getElementById('btnTowerDefense');
const tdContainer: HTMLElement | null = document.getElementById('tdContainer');
const resetTdBtn: HTMLElement | null = document.getElementById('resetTdBtn');
const tdCanvas: HTMLCanvasElement | null = document.getElementById('tdCanvas') as HTMLCanvasElement;
const tdStatus: HTMLElement | null = document.getElementById('tdStatus');
const tdGoldDisplay: HTMLElement | null = document.getElementById('tdGold');
const tdLivesDisplay: HTMLElement | null = document.getElementById('tdLives');
const tdWaveDisplay: HTMLElement | null = document.getElementById('tdWave');
const tdScoreDisplay: HTMLElement | null = document.getElementById('tdScore');
const tdNextWaveBtn: HTMLButtonElement | null = document.getElementById('tdNextWaveBtn') as HTMLButtonElement;
let tdInterval: ReturnType<typeof setInterval> | undefined;

// =============================================
// Game Switching Logic
// =============================================

if (btnFourWins) btnFourWins.addEventListener('click', () => switchGame('fourWins'));
if (btnMinesweeper) btnMinesweeper.addEventListener('click', () => switchGame('minesweeper'));
if (btnTetris) btnTetris.addEventListener('click', () => switchGame('tetris'));
if (btnSnake) btnSnake.addEventListener('click', () => switchGame('snake'));
if (btnPong) btnPong.addEventListener('click', () => switchGame('pong'));
if (btnSpaceInvaders) btnSpaceInvaders.addEventListener('click', () => switchGame('spaceInvaders'));
if (btnBreakout) btnBreakout.addEventListener('click', () => switchGame('breakout'));
if (btnBoulderDash) btnBoulderDash.addEventListener('click', () => switchGame('boulderDash'));
if (btnTowerDefense) btnTowerDefense.addEventListener('click', () => switchGame('towerDefense'));

function switchGame(game: GameId): void {
    // Clear all intervals to prevent multiple games running
    if (tetrisInterval) clearInterval(tetrisInterval);
    if (snakeInterval) clearInterval(snakeInterval);
    if (pongInterval) clearInterval(pongInterval);
    if (spaceInvadersInterval) clearInterval(spaceInvadersInterval);
    if (breakoutInterval) clearInterval(breakoutInterval);
    if (bd.interval) clearInterval(bd.interval);
    if (tdInterval) clearInterval(tdInterval);

    // Hide all containers
    if (fourWinsContainer) fourWinsContainer.style.display = 'none';
    if (minesweeperContainer) minesweeperContainer.style.display = 'none';
    if (tetrisContainer) tetrisContainer.style.display = 'none';
    if (snakeContainer) snakeContainer.style.display = 'none';
    if (pongContainer) pongContainer.style.display = 'none';
    if (spaceInvadersContainer) spaceInvadersContainer.style.display = 'none';
    if (breakoutContainer) breakoutContainer.style.display = 'none';
    if (boulderDashContainer) boulderDashContainer.style.display = 'none';
    if (tdContainer) tdContainer.style.display = 'none';

    // Remove active class from all buttons
    if (btnFourWins) btnFourWins.classList.remove('active');
    if (btnMinesweeper) btnMinesweeper.classList.remove('active');
    if (btnTetris) btnTetris.classList.remove('active');
    if (btnSnake) btnSnake.classList.remove('active');
    if (btnPong) btnPong.classList.remove('active');
    if (btnSpaceInvaders) btnSpaceInvaders.classList.remove('active');
    if (btnBreakout) btnBreakout.classList.remove('active');
    if (btnBoulderDash) btnBoulderDash.classList.remove('active');
    if (btnTowerDefense) btnTowerDefense.classList.remove('active');

    if (game === 'fourWins') {
        if (btnFourWins) btnFourWins.classList.add('active');
        if (fourWinsContainer) fourWinsContainer.style.display = 'block';
        initGame();
    } else if (game === 'minesweeper') {
        if (btnMinesweeper) btnMinesweeper.classList.add('active');
        if (minesweeperContainer) minesweeperContainer.style.display = 'block';
        initMinesweeper();
    } else if (game === 'tetris') {
        if (btnTetris) btnTetris.classList.add('active');
        if (tetrisContainer) tetrisContainer.style.display = 'block';
        initTetris();
    } else if (game === 'snake') {
        if (btnSnake) btnSnake.classList.add('active');
        if (snakeContainer) snakeContainer.style.display = 'block';
        initSnake();
    } else if (game === 'pong') {
        if (btnPong) btnPong.classList.add('active');
        if (pongContainer) pongContainer.style.display = 'block';
        initPong();
    } else if (game === 'spaceInvaders') {
        if (btnSpaceInvaders) btnSpaceInvaders.classList.add('active');
        if (spaceInvadersContainer) spaceInvadersContainer.style.display = 'block';
        initSpaceInvaders();
    } else if (game === 'breakout') {
        if (btnBreakout) btnBreakout.classList.add('active');
        if (breakoutContainer) breakoutContainer.style.display = 'block';
        initBreakout();
    } else if (game === 'boulderDash') {
        if (btnBoulderDash) btnBoulderDash.classList.add('active');
        if (boulderDashContainer) boulderDashContainer.style.display = 'block';
        initBoulderDash();
    } else if (game === 'towerDefense') {
        if (btnTowerDefense) btnTowerDefense.classList.add('active');
        if (tdContainer) tdContainer.style.display = 'block';
        initTowerDefense();
    }
}

// =============================================
// Connect Four / Vier Gewinnt Logic
// =============================================

function initGame(): void {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0) as CellValue[]);
    currentPlayer = PLAYER1;
    gameActive = true;
    if (statusElement) statusElement.textContent = 'Spieler 1 (Rot) ist am Zug';
    renderBoard();
}

function renderBoard(): void {
    if (!boardElement) return;
    boardElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell: HTMLDivElement = document.createElement('div');
            cell.classList.add('cell');

            if (board[r][c] !== 0) {
                const piece: HTMLDivElement = document.createElement('div');
                piece.classList.add('piece');
                piece.classList.add(board[r][c] === PLAYER1 ? 'red' : 'yellow');
                cell.appendChild(piece);
            }

            cell.addEventListener('click', () => handleCellClick(c));
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(col: number): void {
    if (!gameActive) return;
    if (board[0][col] !== 0) return;

    makeMoveInBoard(board, col, currentPlayer);

    if (checkWin(board, currentPlayer)) {
        endGame(currentPlayer);
    } else if (isBoardFull()) {
        endGame(0);
    } else {
        currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
        if (statusElement) {
            statusElement.textContent = currentPlayer === PLAYER1
                ? 'Spieler 1 (Rot) ist am Zug'
                : (gameMode === '1p' ? 'Computer (Gelb) ist am Zug' : 'Spieler 2 (Gelb) ist am Zug');
        }

        if (gameMode === '1p' && currentPlayer === PLAYER2) {
            setTimeout(() => {
                const aiMove: number = getBestMove();
                if (aiMove !== -1) {
                    handleCellClick(aiMove);
                }
            }, 500);
        }
    }
    renderBoard();
}

function isBoardFull(): boolean {
    return board[0].every(cell => cell !== 0);
}

function endGame(winner: Player | 0): void {
    gameActive = false;
    if (!statusElement) return;
    if (winner === 0) {
        statusElement.textContent = 'Unentschieden!';
    } else {
        const winnerName: string = winner === PLAYER1
            ? 'Spieler 1 (Rot)'
            : (gameMode === '1p' ? 'Computer (Gelb)' : 'Spieler 2 (Gelb)');
        statusElement.textContent = `${winnerName} hat gewonnen!`;
    }
}

function checkWin(board: Board, player: Player): boolean {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r][c + 1] === player && board[r][c + 2] === player && board[r][c + 3] === player) return true;
        }
    }
    // Check vertical
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === player && board[r + 1][c] === player && board[r + 2][c] === player && board[r + 3][c] === player) return true;
        }
    }
    // Check diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r + 1][c + 1] === player && board[r + 2][c + 2] === player && board[r + 3][c + 3] === player) return true;
        }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r - 1][c + 1] === player && board[r - 2][c + 2] === player && board[r - 3][c + 3] === player) return true;
        }
    }
    return false;
}

// =============================================
// AI Implementation (Minimax with Alpha-Beta Pruning)
// =============================================

function getBestMove(): number {
    let bestScore: number = -Infinity;
    let move: number = -1;
    const availableCols: number[] = getAvailableCols(board);

    for (const col of availableCols) {
        const tempBoard: Board = board.map(row => [...row]);
        makeMoveInBoard(tempBoard, col, PLAYER2);
        const score: number = minimax(tempBoard, difficulty, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            move = col;
        }
    }
    return move;
}

function getAvailableCols(board: Board): number[] {
    const available: number[] = [];
    for (let c = 0; c < COLS; c++) {
        if (board[0][c] === 0) available.push(c);
    }
    return available;
}

function makeMoveInBoard(board: Board, col: number, player: Player): void {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = player;
            break;
        }
    }
}

function minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (checkWin(board, PLAYER2)) return 10000 + depth;
    if (checkWin(board, PLAYER1)) return -10000 - depth;
    if (isBoardFull() || depth === 0) return evaluateBoard(board);

    const availableCols: number[] = getAvailableCols(board);

    if (isMaximizing) {
        let maxEval: number = -Infinity;
        for (const col of availableCols) {
            const tempBoard: Board = board.map(row => [...row]);
            makeMoveInBoard(tempBoard, col, PLAYER2);
            const evaluation: number = minimax(tempBoard, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval: number = Infinity;
        for (const col of availableCols) {
            const tempBoard: Board = board.map(row => [...row]);
            makeMoveInBoard(tempBoard, col, PLAYER1);
            const evaluation: number = minimax(tempBoard, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluateBoard(board: Board): number {
    let score: number = 0;
    for (let r = 0; r < ROWS; r++) {
        if (board[r][3] === PLAYER2) score += 3;
        else if (board[r][3] === PLAYER1) score -= 3;
    }
    return score;
}

// Event Listeners for Connect Four
if (gameModeSelect) {
    gameModeSelect.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        gameMode = target.value as GameMode;
        if (difficultyContainer) difficultyContainer.style.display = gameMode === '1p' ? 'flex' : 'none';
        initGame();
    });
}

if (difficultySelect) {
    difficultySelect.addEventListener('change', (e: Event) => {
        difficulty = parseInt((e.target as HTMLSelectElement).value);
        initGame();
    });
}

if (resetBtn) resetBtn.addEventListener('click', initGame);

// =============================================
// Minesweeper Logic
// =============================================

function initMinesweeper(): void {
    const difficulty: string = msDifficultySelect ? msDifficultySelect.value : 'easy';
    let rows: number, cols: number, mines: number;

    if (difficulty === 'easy') {
        rows = 10; cols = 10; mines = 10;
    } else if (difficulty === 'medium') {
        rows = 15; cols = 15; mines = 40;
    } else {
        rows = 20; cols = 20; mines = 80;
    }

    msMinesCount = mines;
    msFlags = 0;
    msGameOver = false;
    msBoard = Array.from({ length: rows }, () => Array(cols).fill(0) as MsCellValue[]);
    msMines = [];

    // Place mines
    let minesPlaced: number = 0;
    while (minesPlaced < mines) {
        const r: number = Math.floor(Math.random() * rows);
        const c: number = Math.floor(Math.random() * cols);
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
            let count: number = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr: number = r + dr;
                    const nc: number = c + dc;
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

function renderMinesweeperBoard(rows: number, cols: number): void {
    if (!msBoardElement) return;
    msBoardElement.innerHTML = '';
    msBoardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell: HTMLDivElement = document.createElement('div');
            cell.classList.add('ms-cell');
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);
            cell.addEventListener('click', () => revealCell(r, c));
            cell.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
                flagCell(r, c);
            });
            msBoardElement.appendChild(cell);
        }
    }
}

function revealCell(r: number, c: number): void {
    if (msGameOver) return;
    const cell: HTMLElement | null = msBoardElement ? msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
    if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

    if (msBoard[r][c] === 'M') {
        gameOverMinesweeper(false);
        return;
    }

    revealRecursive(r, c);
    checkWinMinesweeper();
}

function revealRecursive(r: number, c: number): void {
    const rows: number = msBoard.length;
    const cols: number = msBoard[0].length;
    const cell: HTMLElement | null = msBoardElement ? msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
    if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

    cell.classList.add('revealed');
    if (typeof msBoard[r][c] === 'number' && msBoard[r][c] > 0) {
        cell.textContent = String(msBoard[r][c]);
        cell.classList.add(`number-${msBoard[r][c]}`);
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr: number = r + dr;
                const nc: number = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    revealRecursive(nr, nc);
                }
            }
        }
    }
}

function flagCell(r: number, c: number): void {
    if (msGameOver) return;
    const cell: HTMLElement | null = msBoardElement ? msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
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

function updateMsStatus(): void {
    if (msStatusElement) msStatusElement.textContent = `Minen: ${msMinesCount - msFlags}`;
}

function gameOverMinesweeper(won: boolean): void {
    msGameOver = true;
    if (!msStatusElement || !msBoardElement) return;
    if (won) {
        msStatusElement.textContent = 'Gewonnen!';
    } else {
        msStatusElement.textContent = 'Verloren!';
        // Reveal all mines
        for (const [r, c] of msMines) {
            const cell: HTMLElement | null = msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            }
        }
    }
}

function checkWinMinesweeper(): void {
    const rows: number = msBoard.length;
    const cols: number = msBoard[0].length;
    const revealedCells: NodeListOf<Element> = document.querySelectorAll('.ms-cell.revealed');

    // Total cells minus mines
    const target: number = (rows * cols) - msMinesCount;

    if (revealedCells.length === target) {
        gameOverMinesweeper(true);
    }
}

if (msDifficultySelect) msDifficultySelect.addEventListener('change', () => initMinesweeper());
if (resetMsBtn) resetMsBtn.addEventListener('click', () => initMinesweeper());

// =============================================
// Tetris Logic
// =============================================

if (resetTetrisBtn) resetTetrisBtn.addEventListener('click', initTetris);

function clearLines(): void {
    let linesCleared: number = 0;
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
        if (tetrisStatusElement) tetrisStatusElement.textContent = `Punkte: ${tetrisScore}`;
    }
}

function initTetris(): void {
    if (tetrisInterval) clearInterval(tetrisInterval);
    tetrisBoard = Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null));
    tetrisScore = 0;
    nextPieceIndex = -1;
    if (tetrisStatusElement) tetrisStatusElement.textContent = `Punkte: ${tetrisScore}`;

    spawnPiece();

    tetrisInterval = setInterval(() => {
        if (!movePiece(0, 1)) {
            lockPiece();
        }
        drawTetris();
    }, 500);
}

function spawnPiece(): void {
    if (nextPieceIndex === -1) {
        nextPieceIndex = Math.floor(Math.random() * PIECES_DATA.length);
    }
    const index: number = nextPieceIndex;
    nextPieceIndex = Math.floor(Math.random() * PIECES_DATA.length);
    currentPiece = PIECES_DATA[index].shape.map(row => [...row]);
    currentPieceColor = PIECES_DATA[index].color;
    currentPiecePos = { x: Math.floor(TETRIS_COLS / 2) - 1, y: 0 };

    drawNextPiece();

    if (checkCollision(currentPiece, currentPiecePos.x, currentPiecePos.y)) {
        // Game Over
        if (tetrisInterval) clearInterval(tetrisInterval);
        if (tetrisStatusElement) tetrisStatusElement.textContent = `Game Over! Punkte: ${tetrisScore}`;
    }
}

function checkCollision(piece: number[][], x: number, y: number): boolean {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c]) {
                const newX: number = x + c;
                const newY: number = y + r;
                if (newX < 0 || newX >= TETRIS_COLS || newY >= TETRIS_ROWS || (newY >= 0 && tetrisBoard[newY][newX] !== null)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function movePiece(dx: number, dy: number): boolean {
    if (currentPiece && !checkCollision(currentPiece, currentPiecePos.x + dx, currentPiecePos.y + dy)) {
        currentPiecePos.x += dx;
        currentPiecePos.y += dy;
        return true;
    }
    return false;
}

function rotatePiece(): void {
    if (!currentPiece) return;
    const rotated: number[][] = currentPiece[0].map((_, index: number) =>
        currentPiece!.map(row => row[index]).reverse()
    );
    if (!checkCollision(rotated, currentPiecePos.x, currentPiecePos.y)) {
        currentPiece = rotated;
    }
}

function lockPiece(): void {
    if (!currentPiece) return;
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                const newY: number = currentPiecePos.y + r;
                const newX: number = currentPiecePos.x + c;
                if (newY >= 0 && newY < TETRIS_ROWS) {
                    tetrisBoard[newY][newX] = currentPieceColor;
                }
            }
        }
    }
    clearLines();
    spawnPiece();
}

function drawTetris(): void {
    if (!ctx) return;
    ctx.clearRect(0, 0, TETRIS_COLS * BLOCK_SIZE, TETRIS_ROWS * BLOCK_SIZE);
    for (let r = 0; r < TETRIS_ROWS; r++) {
        for (let c = 0; c < TETRIS_COLS; c++) {
            const cellColor: string | null = tetrisBoard[r][c];
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

function handleTetrisKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.key === 'ArrowLeft') movePiece(-1, 0);
        if (e.key === 'ArrowRight') movePiece(1, 0);
        if (e.key === 'ArrowDown') movePiece(0, 1);
        if (e.key === 'ArrowUp') rotatePiece();
        drawTetris();
    }
}

function drawNextPiece(): void {
    if (!nextCtx || !nextPieceCanvas) return;
    const canvasW: number = nextPieceCanvas.width;
    const canvasH: number = nextPieceCanvas.height;
    nextCtx.clearRect(0, 0, canvasW, canvasH);

    if (nextPieceIndex === -1) return;

    const piece: number[][] = PIECES_DATA[nextPieceIndex].shape;
    const color: string = PIECES_DATA[nextPieceIndex].color;
    const previewBlockSize: number = 20;

    // Center the piece in the preview canvas
    const pieceW: number = piece[0].length * previewBlockSize;
    const pieceH: number = piece.length * previewBlockSize;
    const offsetX: number = (canvasW - pieceW) / 2;
    const offsetY: number = (canvasH - pieceH) / 2;

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
function setupMobileControls(): void {
    const addControl = (btn: HTMLElement | null, action: () => void): void => {
        if (!btn) return;
        btn.addEventListener('touchstart', (e: Event) => {
            e.preventDefault();
            action();
            drawTetris();
        });
        btn.addEventListener('click', (e: Event) => {
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

function initSnake(): void {
    if (snakeInterval) clearInterval(snakeInterval);
    snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    snakeDir = { x: 1, y: 0 };
    snakeNextDir = { x: 1, y: 0 };
    snakeScore = 0;
    snakeGameOver = false;
    if (snakeStatusElement) snakeStatusElement.textContent = `Punkte: ${snakeScore}`;
    placeFood();
    drawSnake();

    snakeInterval = setInterval(() => {
        snakeDir = { ...snakeNextDir };
        moveSnake();
        drawSnake();
    }, 150);
}

function placeFood(): void {
    let free: boolean = false;
    while (!free) {
        const fx: number = Math.floor(Math.random() * SNAKE_COLS);
        const fy: number = Math.floor(Math.random() * SNAKE_ROWS);
        free = true;
        for (const seg of snake) {
            if (seg.x === fx && seg.y === fy) { free = false; break; }
        }
        if (free) {
            snakeFood = { x: fx, y: fy };
        }
    }
}

function moveSnake(): void {
    if (snakeGameOver) return;

    const head: SnakeSegment = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

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
        if (snakeStatusElement) snakeStatusElement.textContent = `Punkte: ${snakeScore}`;
        placeFood();
    } else {
        snake.pop();
    }
}

function endSnake(): void {
    snakeGameOver = true;
    if (snakeInterval) clearInterval(snakeInterval);
    if (snakeStatusElement) snakeStatusElement.textContent = `Game Over! Punkte: ${snakeScore}`;
}

function drawSnake(): void {
    if (!snakeCtx) return;
    snakeCtx.clearRect(0, 0, SNAKE_CANVAS_SIZE, SNAKE_CANVAS_SIZE);

    // Draw food
    snakeCtx.fillStyle = '#ff0000';
    snakeCtx.fillRect(snakeFood.x * SNAKE_SIZE, snakeFood.y * SNAKE_SIZE, SNAKE_SIZE, SNAKE_SIZE);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const g: number = 255 - Math.floor((i / snake.length) * 200);
        snakeCtx.fillStyle = `rgb(0, ${g}, 0)`;
        snakeCtx.fillRect(snake[i].x * SNAKE_SIZE, snake[i].y * SNAKE_SIZE, SNAKE_SIZE - 1, SNAKE_SIZE - 1);
    }
}

function handleSnakeKey(e: KeyboardEvent): void {
    if (snakeGameOver) return;
    switch (e.key) {
        case 'ArrowUp':
            if (snakeDir.y !== 1) snakeNextDir = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (snakeDir.y !== -1) snakeNextDir = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (snakeDir.x !== 1) snakeNextDir = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (snakeDir.x !== -1) snakeNextDir = { x: 1, y: 0 };
            break;
    }
    e.preventDefault();
}

if (resetSnakeBtn) resetSnakeBtn.addEventListener('click', initSnake);

// Snake mobile controls
function setupSnakeControls(): void {
    const addSnakeControl = (btn: HTMLElement | null, dx: number, dy: number): void => {
        if (!btn) return;
        const handler = (): void => {
            if (snakeGameOver) return;
            if (dx === 0 && dy === -1 && snakeDir.y !== 1) snakeNextDir = { x: 0, y: -1 };
            else if (dx === 0 && dy === 1 && snakeDir.y !== -1) snakeNextDir = { x: 0, y: 1 };
            else if (dx === -1 && dy === 0 && snakeDir.x !== 1) snakeNextDir = { x: -1, y: 0 };
            else if (dx === 1 && dy === 0 && snakeDir.x !== -1) snakeNextDir = { x: 1, y: 0 };
        };
        btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); handler(); });
        btn.addEventListener('click', (e: Event) => { e.preventDefault(); handler(); });
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

function initPong(): void {
    if (pongInterval) clearInterval(pongInterval);
    pongMode = pongModeSelect ? (pongModeSelect.value as GameMode) : '2p';
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
    if (pongStatusElement) pongStatusElement.textContent = 'Player 1: 0 | Player 2: 0';
    drawPong();

    pongInterval = setInterval(() => {
        updatePong();
        drawPong();
    }, 20);
}

function updatePong(): void {
    if (pongGameOver) return;

    // Move paddles
    pongLeftY += pongLeftMoving * PADDLE_SPEED;
    if (pongMode === '1p') {
        // Simple AI: follow the ball
        const target: number = pongBallY - PADDLE_HEIGHT / 2;
        const diff: number = target - pongRightY;
        if (Math.abs(diff) > AI_SPEED) {
            pongRightY += Math.sign(diff) * AI_SPEED;
        }
    } else {
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

    if (pongStatusElement) pongStatusElement.textContent = `Player 1: ${pongLeftScore} | Player 2: ${pongRightScore}`;

    // Win at 10
    if (pongLeftScore >= 10 || pongRightScore >= 10) {
        pongGameOver = true;
        if (pongInterval) clearInterval(pongInterval);
        const winner: string = pongLeftScore >= 10 ? 'Player 1' : 'Player 2';
        if (pongStatusElement) pongStatusElement.textContent = `${winner} hat gewonnen! (${pongLeftScore}:${pongRightScore})`;
    }
}

function resetPongBall(): void {
    pongBallX = PONG_WIDTH / 2;
    pongBallY = PONG_HEIGHT / 2;
    pongBallDX = 4 * (Math.random() > 0.5 ? 1 : -1);
    pongBallDY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

function drawPong(): void {
    if (!pongCtx) return;
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

function handlePongKey(e: KeyboardEvent, isDown: boolean): void {
    if (pongGameOver) return;
    // Left paddle controls: W / S
    if (e.key === 'w' || e.key === 'W') pongLeftMoving = isDown ? -1 : 0;
    if (e.key === 's' || e.key === 'S') pongLeftMoving = isDown ? 1 : 0;
    // Right paddle controls: ArrowUp / ArrowDown
    if (e.key === 'ArrowUp') pongRightMoving = isDown ? -1 : 0;
    if (e.key === 'ArrowDown') pongRightMoving = isDown ? 1 : 0;
    e.preventDefault();
}

if (resetPongBtn) resetPongBtn.addEventListener('click', initPong);
if (pongModeSelect) pongModeSelect.addEventListener('change', () => initPong());

// Pong mobile controls
function setupPongControls(): void {
    const addPongControl = (btn: HTMLElement | null, side: 'left' | 'right', dir: number): void => {
        if (!btn) return;
        const start = (): void => {
            if (side === 'left') pongLeftMoving = dir;
            else pongRightMoving = dir;
        };
        const stop = (): void => {
            if (side === 'left') pongLeftMoving = 0;
            else pongRightMoving = 0;
        };
        btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); start(); });
        btn.addEventListener('touchend', (e: Event) => { e.preventDefault(); stop(); });
        btn.addEventListener('mousedown', (e: Event) => { e.preventDefault(); start(); });
        btn.addEventListener('mouseup', (e: Event) => { e.preventDefault(); stop(); });
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

function initSpaceInvaders(): void {
    if (spaceInvadersInterval) clearInterval(spaceInvadersInterval);
    if (!spaceInvadersCanvas) return;
    siPlayerX = (spaceInvadersCanvas.width - SI_PLAYER_WIDTH) / 2;
    siBullets = [];
    siAlienBullets = [];
    siScore = 0;
    siGameOver = false;
    siAlienDir = 1;
    siAlienSpeed = 1;
    siAlienMoveTimer = 0;
    siAlienMoveInterval = 30;
    if (spaceInvadersStatusElement) spaceInvadersStatusElement.textContent = 'Punkte: 0';

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

function updateSpaceInvaders(): void {
    if (siGameOver) return;

    // Move aliens
    siAlienMoveTimer++;
    if (siAlienMoveTimer >= siAlienMoveInterval) {
        siAlienMoveTimer = 0;
        let shouldDrop: boolean = false;
        const aliveAliens: Alien[] = siAliens.filter(a => a.alive);

        // Check if any alien needs to drop
        for (const alien of aliveAliens) {
            if (!spaceInvadersCanvas) return;
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
                const minRow: number = Math.min(...aliveAliens.map(a => a.row));
                siAlienMoveInterval = Math.max(5, 30 - minRow * 5);
            }
        } else {
            for (const alien of aliveAliens) {
                alien.x += siAlienDir * siAlienSpeed;
            }
        }

        // Random alien shooting
        if (aliveAliens.length > 0 && Math.random() < 0.3) {
            const shooter: Alien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            siAlienBullets.push({
                x: shooter.x + SI_ALIEN_WIDTH / 2,
                y: shooter.y + SI_ALIEN_HEIGHT,
                speed: 3
            });
        }

        // Check if aliens reached bottom
        for (const alien of aliveAliens) {
            if (!spaceInvadersCanvas) return;
            if (alien.y + SI_ALIEN_HEIGHT >= spaceInvadersCanvas.height - SI_PLAYER_HEIGHT - 20) {
                siGameOver = true;
                if (spaceInvadersStatusElement) spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${siScore}`;
                if (spaceInvadersInterval) clearInterval(spaceInvadersInterval);
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
        siAlienBullets[i].y! += siAlienBullets[i].speed!;
        if (siAlienBullets[i].y! > (spaceInvadersCanvas ? spaceInvadersCanvas.height : 0)) {
            siAlienBullets.splice(i, 1);
        }
    }

    // Check bullet-alien collisions
    for (let i = siBullets.length - 1; i >= 0; i--) {
        const bullet: Bullet = siBullets[i];
        for (const alien of siAliens) {
            if (alien.alive &&
                bullet.x < alien.x + SI_ALIEN_WIDTH &&
                bullet.x + SI_BULLET_WIDTH > alien.x &&
                bullet.y < alien.y + SI_ALIEN_HEIGHT &&
                bullet.y + SI_BULLET_HEIGHT > alien.y) {
                alien.alive = false;
                siBullets.splice(i, 1);
                siScore += (SI_ALIEN_ROWS - alien.row) * 10;
                if (spaceInvadersStatusElement) spaceInvadersStatusElement.textContent = `Punkte: ${siScore}`;
                break;
            }
        }
    }

    // Check alien bullet-player collisions
    for (const bullet of siAlienBullets) {
        if (!spaceInvadersCanvas) return;
        if (bullet.x < siPlayerX + SI_PLAYER_WIDTH &&
            bullet.x + SI_ALIEN_BULLET_WIDTH > siPlayerX &&
            bullet.y < spaceInvadersCanvas.height - 30 &&
            bullet.y! + SI_ALIEN_BULLET_HEIGHT > spaceInvadersCanvas.height - 30) {
            siGameOver = true;
            if (spaceInvadersStatusElement) spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${siScore}`;
            if (spaceInvadersInterval) clearInterval(spaceInvadersInterval);
            return;
        }
    }
}

function drawSpaceInvaders(): void {
    if (!spaceInvadersCtx || !spaceInvadersCanvas) return;
    spaceInvadersCtx.clearRect(0, 0, spaceInvadersCanvas.width, spaceInvadersCanvas.height);

    // Draw aliens
    const colors: string[] = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    for (const alien of siAliens) {
        if (!alien.alive) continue;
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

function handleSpaceInvadersKey(e: KeyboardEvent, isDown: boolean): void {
    if (!spaceInvadersCanvas) return;
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

if (resetSpaceInvadersBtn) resetSpaceInvadersBtn.addEventListener('click', initSpaceInvaders);

// Space Invaders mobile controls
function setupSpaceInvadersControls(): void {
    const addControl = (btn: HTMLElement | null, action: () => void): void => {
        if (!btn) return;
        btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); action(); });
        btn.addEventListener('click', (e: Event) => { e.preventDefault(); action(); });
    };
    addControl(spaceInvadersBtnLeft, () => {
        if (!siGameOver) siPlayerX = Math.max(0, siPlayerX - 15);
    });
    addControl(spaceInvadersBtnRight, () => {
        if (!siGameOver) siPlayerX = Math.min(spaceInvadersCanvas ? spaceInvadersCanvas.width - SI_PLAYER_WIDTH : 0, siPlayerX + 15);
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

function initBreakout(): void {
    if (breakoutInterval) clearInterval(breakoutInterval);
    if (!breakoutCanvas) return;
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
    const brickColors: string[] = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff'];
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

    if (breakoutStatusElement) breakoutStatusElement.textContent = `Punkte: 0 | Leben: ${breakoutLives}`;

    breakoutInterval = setInterval(() => {
        updateBreakout();
        drawBreakout();
    }, 16);
}

function updateBreakout(): void {
    if (breakoutGameOver) return;

    // Move paddle
    breakoutPaddleX += breakoutPaddleMoving * BREAKOUT_PADDLE_SPEED;
    if (breakoutCanvas) breakoutPaddleX = Math.max(0, Math.min(breakoutCanvas.width - BREAKOUT_PADDLE_WIDTH, breakoutPaddleX));

    // Move ball
    breakoutBallX += breakoutBallDX;
    breakoutBallY += breakoutBallDY;

    // Wall collisions
    if (!breakoutCanvas) return;
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
        const hitPos: number = (breakoutBallX - breakoutPaddleX) / BREAKOUT_PADDLE_WIDTH;
        breakoutBallDX = 6 * (hitPos - 0.5);
    }

    // Bottom collision (lose life)
    if (breakoutBallY + BREAKOUT_BALL_RADIUS > breakoutCanvas.height) {
        breakoutLives--;
        if (breakoutLives <= 0) {
            breakoutGameOver = true;
            if (breakoutStatusElement) breakoutStatusElement.textContent = `Game Over! Punkte: ${breakoutScore}`;
            if (breakoutInterval) clearInterval(breakoutInterval);
            return;
        }
        breakoutBallX = breakoutCanvas.width / 2;
        breakoutBallY = breakoutCanvas.height - 40;
        breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
        breakoutBallDY = -3;
        if (breakoutStatusElement) breakoutStatusElement.textContent = `Punkte: ${breakoutScore} | Leben: ${breakoutLives}`;
    }

    // Brick collisions
    for (const brick of breakoutBricks) {
        if (!brick.alive) continue;
        if (breakoutBallX + BREAKOUT_BALL_RADIUS > brick.x &&
            breakoutBallX - BREAKOUT_BALL_RADIUS < brick.x + BREAKOUT_BRICK_WIDTH &&
            breakoutBallY + BREAKOUT_BALL_RADIUS > brick.y &&
            breakoutBallY - BREAKOUT_BALL_RADIUS < brick.y + BREAKOUT_BRICK_HEIGHT) {
            brick.alive = false;
            breakoutBallDY = -breakoutBallDY;
            breakoutScore += 10;
            if (breakoutStatusElement) breakoutStatusElement.textContent = `Punkte: ${breakoutScore} | Leben: ${breakoutLives}`;
            break;
        }
    }

    // Check win
    if (breakoutBricks.every(b => !b.alive)) {
        breakoutGameOver = true;
        if (breakoutStatusElement) breakoutStatusElement.textContent = `Gewonnen! Punkte: ${breakoutScore}`;
        if (breakoutInterval) clearInterval(breakoutInterval);
    }
}

function drawBreakout(): void {
    if (!breakoutCtx) return;
    breakoutCtx.clearRect(0, 0, breakoutCtx.canvas.width, breakoutCtx.canvas.height);

    // Draw bricks
    for (const brick of breakoutBricks) {
        if (!brick.alive) continue;
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

function handleBreakoutKey(e: KeyboardEvent, isDown: boolean): void {
    if (isDown) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            breakoutPaddleMoving = -1;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            breakoutPaddleMoving = 1;
        }
    } else {
        if ((e.key === 'ArrowLeft' || e.key === 'a') && breakoutPaddleMoving === -1) {
            breakoutPaddleMoving = 0;
        }
        if ((e.key === 'ArrowRight' || e.key === 'd') && breakoutPaddleMoving === 1) {
            breakoutPaddleMoving = 0;
        }
    }
    e.preventDefault();
}

if (resetBreakoutBtn) resetBreakoutBtn.addEventListener('click', initBreakout);

// Breakout mobile controls
function setupBreakoutControls(): void {
    const addControl = (btn: HTMLElement | null, direction: number): void => {
        if (!btn) return;
        const start = (): void => { breakoutPaddleMoving = direction; };
        const stop = (): void => { breakoutPaddleMoving = 0; };
        btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); start(); });
        btn.addEventListener('touchend', (e: Event) => { e.preventDefault(); stop(); });
        btn.addEventListener('mousedown', (e: Event) => { e.preventDefault(); start(); });
        btn.addEventListener('mouseup', (e: Event) => { e.preventDefault(); stop(); });
    };
    addControl(breakoutBtnLeft, -1);
    addControl(breakoutBtnRight, 1);
}
setupBreakoutControls();

// =============================================
// Boulder Dash Game
// =============================================

function initBoulderDash(): void {
    if (bd.interval) clearInterval(bd.interval);
    bd.canvas = bdCanvas;
    bd.ctx = bdCanvas ? bdCanvas.getContext('2d') : null;
    if (!bd.canvas || !bd.ctx) return;

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

function generateBdCave(): void {
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
    const numWalls: number = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numWalls; i++) {
        const x: number = 2 + Math.floor(Math.random() * (BD_SIZE - 4));
        const y: number = 2 + Math.floor(Math.random() * (BD_SIZE - 4));
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
    const numBoulders: number = 10 + Math.floor(Math.random() * 9);
    for (let i = 0; i < numBoulders; i++) {
        const x: number = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        const y: number = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        if (bd.board[y][x] === BD_DIRT_CHAR) {
            bd.board[y][x] = BD_BOULDER_CHAR;
        }
    }

    // Place diamonds (15-25)
    const numDiamonds: number = 15 + Math.floor(Math.random() * 11);
    for (let i = 0; i < numDiamonds; i++) {
        const x: number = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        const y: number = 1 + Math.floor(Math.random() * (BD_SIZE - 2));
        if (bd.board[y][x] === BD_DIRT_CHAR) {
            bd.board[y][x] = BD_DIAMOND_CHAR;
        }
    }

    // Place player at a safe position (top-left area)
    bd.board[2][2] = BD_PLAYER_CHAR;
    bd.playerX = 2;
    bd.playerY = 2;

    // Place magic wall (optional)
    const mwX: number = BD_SIZE - 3;
    const mwY: number = BD_SIZE - 3;
    if (bd.board[mwY][mwX] === BD_DIRT_CHAR) {
        bd.board[mwY][mwX] = BD_MAGIC_WALL_CHAR;
    }
}

function updateBdStatus(): void {
    if (bdStatusElement) {
        if (bd.won) {
            bdStatusElement.textContent = `🎉 Gewonnen! 💎 ${bd.collectedDiamonds}/${bd.totalDiamonds}  Punkte: ${bd.score}`;
        } else if (bd.gameOver) {
            bdStatusElement.textContent = `💀 Game Over! 💎 ${bd.collectedDiamonds}/${bd.totalDiamonds}`;
        } else {
            bdStatusElement.textContent = `Sammle 💎 ${bd.collectedDiamonds}/${bd.totalDiamonds}  Punkte: ${bd.score}`;
        }
    }
}

function drawBdBoard(): void {
    if (!bd.ctx || !bd.canvas) return;
    const ctx: CanvasRenderingContext2D = bd.ctx;
    const canvas: HTMLCanvasElement = bd.canvas;
    const cs: number = BD_CELL_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < BD_SIZE; y++) {
        for (let x = 0; x < BD_SIZE; x++) {
            const cell: number = bd.board[y][x];
            const px: number = x * cs;
            const py: number = y * cs;

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

function moveBdPlayer(dx: number, dy: number): void {
    if (bd.gameOver || bd.won) return;

    const nx: number = bd.playerX + dx;
    const ny: number = bd.playerY + dy;

    // Bounds check
    if (nx < 1 || nx >= BD_SIZE - 1 || ny < 1 || ny >= BD_SIZE - 1) return;

    const target: number = bd.board[ny][nx];

    // Can't walk through walls or boulders
    if (target === BD_WALL_CHAR || target === BD_BOULDER_CHAR) return;

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
                const mx: number = nx + dx2;
                const my: number = ny + dy2;
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

function updateBdPhysics(): void {
    if (bd.gameOver || bd.won) return;

    // Process boulders from bottom to top so they fall correctly
    for (let y = BD_SIZE - 2; y >= 1; y--) {
        for (let x = BD_SIZE - 2; x >= 1; x--) {
            if (bd.board[y][x] === BD_BOULDER_CHAR) {
                const below = bd.board[y + 1][x];

                // Fall straight down only through empty space (not dirt!)
                if (below === BD_EMPTY_CHAR) {
                    // Check if boulder falls on player — crushes player (game over)
                    if (y + 1 === bd.playerY && x === bd.playerX) {
                        bd.board[y][x] = BD_EMPTY_CHAR;
                        bd.board[y + 1][x] = BD_BOULDER_CHAR;
                        bd.gameOver = true;
                        updateBdStatus();
                        if (bd.interval) clearInterval(bd.interval);
                        drawBdBoard();
                        return;
                    }
                    // Fall down (replaces empty space)
                    bd.board[y + 1][x] = BD_BOULDER_CHAR;
                    bd.board[y][x] = BD_EMPTY_CHAR;
                }
                // Only roll when blocked by wall or another boulder (NOT dirt — boulders sit on dirt)
                else if (below === BD_WALL_CHAR || below === BD_BOULDER_CHAR) {
                    // Roll left: need solid diagonal support (wall or boulder below-left) + empty space or player to the left
                    const canRollLeft: boolean = (x > 1 && (bd.board[y + 1][x - 1] === BD_WALL_CHAR || bd.board[y + 1][x - 1] === BD_BOULDER_CHAR) && (bd.board[y][x - 1] === BD_EMPTY_CHAR || bd.board[y][x - 1] === BD_PLAYER_CHAR));
                    // Roll right: need solid diagonal support (wall or boulder below-right) + empty space or player to the right
                    const canRollRight: boolean = (x < BD_SIZE - 2 && (bd.board[y + 1][x + 1] === BD_WALL_CHAR || bd.board[y + 1][x + 1] === BD_BOULDER_CHAR) && (bd.board[y][x + 1] === BD_EMPTY_CHAR || bd.board[y][x + 1] === BD_PLAYER_CHAR));

                    if (canRollLeft) {
                        // Check if boulder rolls onto player — crushes player (game over)
                        if (y === bd.playerY && x - 1 === bd.playerX) {
                            bd.board[y][x] = BD_EMPTY_CHAR;
                            bd.board[y][x - 1] = BD_BOULDER_CHAR;
                            bd.gameOver = true;
                            updateBdStatus();
                            if (bd.interval) clearInterval(bd.interval);
                            drawBdBoard();
                            return;
                        }
                        bd.board[y][x - 1] = BD_BOULDER_CHAR;
                        bd.board[y][x] = BD_EMPTY_CHAR;
                    } else if (canRollRight) {
                        // Check if boulder rolls onto player — crushes player (game over)
                        if (y === bd.playerY && x + 1 === bd.playerX) {
                            bd.board[y][x] = BD_EMPTY_CHAR;
                            bd.board[y][x + 1] = BD_BOULDER_CHAR;
                            bd.gameOver = true;
                            updateBdStatus();
                            if (bd.interval) clearInterval(bd.interval);
                            drawBdBoard();
                            return;
                        }
                        bd.board[y][x + 1] = BD_BOULDER_CHAR;
                        bd.board[y][x] = BD_EMPTY_CHAR;
                    }
                }
            }
        }
    }
}

function checkBdWinCondition(): void {
    if (bd.collectedDiamonds >= BD_TARGET_COLLECT && !bd.won && !bd.gameOver) {
        bd.won = true;
        bd.score += 50; // Bonus for winning
        updateBdStatus();
        if (bd.interval) clearInterval(bd.interval);
        drawBdBoard();
    }
}

function handleBdKey(e: KeyboardEvent): void {
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

function setupBdMobileControls(): void {
    const addBdControl = (btn: HTMLElement | null, dx: number, dy: number): void => {
        if (!btn) return;
        const action = (): void => {
            moveBdPlayer(dx, dy);
            drawBdBoard();
            checkBdWinCondition();
        };
        btn.addEventListener('touchstart', (e: Event) => { e.preventDefault(); action(); });
        btn.addEventListener('mousedown', (e: Event) => { e.preventDefault(); action(); });
    };
    addBdControl(bdBtnUp, 0, -1);
    addBdControl(bdBtnDown, 0, 1);
    addBdControl(bdBtnLeft, -1, 0);
    addBdControl(bdBtnRight, 1, 0);
}
setupBdMobileControls();

if (resetBdBtn) resetBdBtn.addEventListener('click', () => initBoulderDash());

// =============================================
// Tower Defense Game
// =============================================

interface TdWaypoint {
    c: number;
    r: number;
}

interface TdEnemy {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    speed: number;
    baseSpeed: number;
    reward: number;
    pathIndex: number;
    radius: number;
    color: string;
    frozen: number;
    poison: number;
    poisonTimer: number;
    type: 'normal' | 'fast' | 'tank' | 'boss';
}

interface TdTower {
    c: number;
    r: number;
    type: 'archer' | 'fire' | 'ice' | 'lightning';
    level: number;
    cooldown: number;
    maxCooldown: number;
    range: number;
    damage: number;
}

interface TdProjectile {
    x: number;
    y: number;
    target: TdEnemy;
    type: 'arrow' | 'fireball' | 'ice' | 'lightning';
    damage: number;
    speed: number;
    splash?: number;
    chain?: number;
    chainHits?: number;
}

interface TdParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

const TD_COLS: number = 15;
const TD_ROWS: number = 12;
const TD_CELL_SIZE: number = 40;
const TD_WIDTH: number = TD_COLS * TD_CELL_SIZE;
const TD_HEIGHT: number = TD_ROWS * TD_CELL_SIZE;

const TD_TOWER_DATA: Record<TdTower['type'], { name: string; cost: number; range: number; damage: number; cooldown: number; color: string; desc: string }> = {
    archer: { name: 'Bogenschütze', cost: 50, range: 120, damage: 12, cooldown: 25, color: '#28a745', desc: 'Schnell, Einzelziel' },
    fire: { name: 'Feuer', cost: 120, range: 100, damage: 20, cooldown: 55, color: '#ff6600', desc: 'Flächenschaden' },
    ice: { name: 'Eis', cost: 100, range: 110, damage: 6, cooldown: 40, color: '#00ccff', desc: 'Verlangsamt Gegner' },
    lightning: { name: 'Blitz', cost: 175, range: 140, damage: 18, cooldown: 45, color: '#cc00ff', desc: 'Kettenblitz' }
};

const TD_WAVES: { count: number; interval: number; hp: number; speed: number; reward: number; type: TdEnemy['type']; color: string; radius: number }[] = [
    { count: 6, interval: 900, hp: 30, speed: 1.2, reward: 8, type: 'normal', color: '#e74c3c', radius: 10 },
    { count: 8, interval: 800, hp: 40, speed: 1.4, reward: 8, type: 'normal', color: '#e74c3c', radius: 10 },
    { count: 10, interval: 700, hp: 35, speed: 2.2, reward: 10, type: 'fast', color: '#f1c40f', radius: 8 },
    { count: 7, interval: 1000, hp: 90, speed: 0.9, reward: 14, type: 'tank', color: '#7f8c8d', radius: 13 },
    { count: 12, interval: 650, hp: 55, speed: 1.8, reward: 11, type: 'fast', color: '#f1c40f', radius: 8 },
    { count: 9, interval: 850, hp: 130, speed: 1.0, reward: 16, type: 'tank', color: '#7f8c8d', radius: 13 },
    { count: 15, interval: 600, hp: 70, speed: 2.4, reward: 12, type: 'fast', color: '#f1c40f', radius: 8 },
    { count: 1, interval: 1200, hp: 900, speed: 0.7, reward: 150, type: 'boss', color: '#8e44ad', radius: 18 },
    { count: 18, interval: 550, hp: 110, speed: 1.9, reward: 13, type: 'normal', color: '#e74c3c', radius: 10 },
    { count: 3, interval: 1500, hp: 700, speed: 0.8, reward: 120, type: 'boss', color: '#8e44ad', radius: 18 }
];

const TD_PATH: TdWaypoint[] = [
    { c: 0, r: 1 }, { c: 3, r: 1 }, { c: 3, r: 5 }, { c: 7, r: 5 },
    { c: 7, r: 2 }, { c: 11, r: 2 }, { c: 11, r: 8 }, { c: 5, r: 8 },
    { c: 5, r: 10 }, { c: 14, r: 10 }
];

let tdCtx: CanvasRenderingContext2D | null = tdCanvas ? tdCanvas.getContext('2d') : null;
let tdGold: number = 150;
let tdLives: number = 20;
let tdScore: number = 0;
let tdWave: number = 0;
let tdEnemies: TdEnemy[] = [];
let tdTowers: TdTower[] = [];
let tdProjectiles: TdProjectile[] = [];
let tdParticles: TdParticle[] = [];
let tdSelectedTower: TdTower['type'] = 'archer';
let tdWaveActive: boolean = false;
let tdWaveSpawned: number = 0;
let tdWaveToSpawn: number = 0;
let tdSpawnTimer: number = 0;
let tdGameOver: boolean = false;
let tdWon: boolean = false;
let tdHoverCell: { c: number; r: number } | null = null;

function initTowerDefense(): void {
    if (tdInterval) clearInterval(tdInterval);
    if (!tdCanvas || !tdCtx) return;

    tdGold = 180;
    tdLives = 20;
    tdScore = 0;
    tdWave = 0;
    tdEnemies = [];
    tdTowers = [];
    tdProjectiles = [];
    tdParticles = [];
    tdSelectedTower = 'archer';
    tdWaveActive = false;
    tdWaveSpawned = 0;
    tdWaveToSpawn = 0;
    tdSpawnTimer = 0;
    tdGameOver = false;
    tdWon = false;

    updateTdUi();
    drawTd();

    tdInterval = setInterval(() => {
        updateTowerDefense();
        drawTd();
    }, 16);
}

function updateTowerDefense(): void {
    if (tdGameOver || tdWon) return;

    if (tdWaveActive && tdWaveSpawned < tdWaveToSpawn) {
        tdSpawnTimer -= 16;
        if (tdSpawnTimer <= 0) {
            const wave = TD_WAVES[tdWave - 1];
            spawnTdEnemy(wave);
            tdWaveSpawned++;
            tdSpawnTimer = wave.interval;
        }
    }

    if (tdWaveActive && tdWaveSpawned >= tdWaveToSpawn && tdEnemies.length === 0) {
        tdWaveActive = false;
        if (tdWave >= TD_WAVES.length) {
            tdWon = true;
            updateTdUi();
            return;
        }
        updateTdUi();
    }

    for (let i = tdEnemies.length - 1; i >= 0; i--) {
        const enemy = tdEnemies[i];
        updateTdEnemy(enemy);
        if (enemy.hp <= 0) {
            tdGold += enemy.reward;
            tdScore += enemy.reward * 10;
            spawnTdParticles(enemy.x, enemy.y, enemy.color, 8);
            tdEnemies.splice(i, 1);
            updateTdUi();
        } else if (enemy.pathIndex >= TD_PATH.length) {
            tdLives--;
            tdEnemies.splice(i, 1);
            updateTdUi();
            if (tdLives <= 0) {
                tdGameOver = true;
                updateTdUi();
                return;
            }
        }
    }

    for (const tower of tdTowers) {
        if (tower.cooldown > 0) tower.cooldown--;
        if (tower.cooldown <= 0) {
            const target = findTdTarget(tower);
            if (target) {
                shootTdProjectile(tower, target);
                tower.cooldown = tower.maxCooldown;
            }
        }
    }

    for (let i = tdProjectiles.length - 1; i >= 0; i--) {
        const proj = tdProjectiles[i];
        if (tdEnemies.indexOf(proj.target) === -1 || proj.target.hp <= 0) {
            tdProjectiles.splice(i, 1);
            continue;
        }
        const dx = proj.target.x - proj.x;
        const dy = proj.target.y - proj.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= proj.speed) {
            hitTdEnemy(proj.target, proj);
            tdProjectiles.splice(i, 1);
        } else {
            proj.x += (dx / dist) * proj.speed;
            proj.y += (dy / dist) * proj.speed;
        }
    }

    for (let i = tdParticles.length - 1; i >= 0; i--) {
        const p = tdParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) tdParticles.splice(i, 1);
    }
}

function spawnTdEnemy(wave: typeof TD_WAVES[0]): void {
    const start = TD_PATH[0];
    tdEnemies.push({
        x: start.c * TD_CELL_SIZE + TD_CELL_SIZE / 2,
        y: start.r * TD_CELL_SIZE + TD_CELL_SIZE / 2,
        hp: wave.hp,
        maxHp: wave.hp,
        speed: wave.speed,
        baseSpeed: wave.speed,
        reward: wave.reward,
        pathIndex: 0,
        radius: wave.radius,
        color: wave.color,
        frozen: 0,
        poison: 0,
        poisonTimer: 0,
        type: wave.type
    });
}

function updateTdEnemy(enemy: TdEnemy): void {
    if (enemy.frozen > 0) {
        enemy.frozen--;
        enemy.speed = enemy.baseSpeed * 0.5;
    } else {
        enemy.speed = enemy.baseSpeed;
    }

    if (enemy.poison > 0) {
        enemy.poisonTimer--;
        if (enemy.poisonTimer <= 0) {
            enemy.hp -= enemy.poison;
            enemy.poisonTimer = 30;
            spawnTdParticles(enemy.x, enemy.y, '#00ff00', 2);
        }
        enemy.poison--;
    }

    const target = TD_PATH[Math.min(enemy.pathIndex + 1, TD_PATH.length - 1)];
    const tx = target.c * TD_CELL_SIZE + TD_CELL_SIZE / 2;
    const ty = target.r * TD_CELL_SIZE + TD_CELL_SIZE / 2;
    const dx = tx - enemy.x;
    const dy = ty - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= enemy.speed) {
        enemy.x = tx;
        enemy.y = ty;
        enemy.pathIndex++;
    } else {
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
    }
}

function findTdTarget(tower: TdTower): TdEnemy | null {
    const tx = tower.c * TD_CELL_SIZE + TD_CELL_SIZE / 2;
    const ty = tower.r * TD_CELL_SIZE + TD_CELL_SIZE / 2;
    let best: TdEnemy | null = null;
    let bestProgress = -1;
    for (const enemy of tdEnemies) {
        const dist = Math.hypot(enemy.x - tx, enemy.y - ty);
        if (dist <= tower.range) {
            const progress = enemy.pathIndex * 1000 + Math.hypot(enemy.x - tx, enemy.y - ty);
            if (progress > bestProgress) {
                bestProgress = progress;
                best = enemy;
            }
        }
    }
    return best;
}

function shootTdProjectile(tower: TdTower, target: TdEnemy): void {
    const tx = tower.c * TD_CELL_SIZE + TD_CELL_SIZE / 2;
    const ty = tower.r * TD_CELL_SIZE + TD_CELL_SIZE / 2;
    const type = tower.type === 'archer' ? 'arrow' : tower.type === 'fire' ? 'fireball' : tower.type;
    tdProjectiles.push({
        x: tx,
        y: ty,
        target,
        type,
        damage: tower.damage,
        speed: type === 'lightning' ? 15 : 8,
        splash: tower.type === 'fire' ? 60 : undefined,
        chain: tower.type === 'lightning' ? 3 : undefined,
        chainHits: 0
    });
}

function hitTdEnemy(enemy: TdEnemy, proj: TdProjectile): void {
    if (proj.type === 'fireball' && proj.splash) {
        for (const e of tdEnemies) {
            const dist = Math.hypot(e.x - enemy.x, e.y - enemy.y);
            if (dist <= proj.splash) {
                e.hp -= Math.round(proj.damage * (1 - dist / proj.splash));
                if (e !== enemy) spawnTdParticles(e.x, e.y, '#ff6600', 3);
            }
        }
        spawnTdParticles(enemy.x, enemy.y, '#ff6600', 12);
    } else if (proj.type === 'ice') {
        enemy.hp -= proj.damage;
        enemy.frozen = 60;
        spawnTdParticles(enemy.x, enemy.y, '#00ccff', 6);
    } else if (proj.type === 'lightning') {
        chainTdLightning(enemy, proj);
    } else {
        enemy.hp -= proj.damage;
        spawnTdParticles(enemy.x, enemy.y, '#ffff00', 4);
    }
}

function chainTdLightning(first: TdEnemy, proj: TdProjectile): void {
    let current: TdEnemy | null = first;
    const hit: Set<TdEnemy> = new Set();
    let damage = proj.damage;
    while (current && proj.chain && hit.size < proj.chain) {
        current.hp -= damage;
        hit.add(current);
        spawnTdParticles(current.x, current.y, '#cc00ff', 5);
        damage = Math.round(damage * 0.7);
        let next: TdEnemy | null = null;
        let bestDist = 100;
        for (const e of tdEnemies) {
            if (!hit.has(e)) {
                const dist = Math.hypot(e.x - current!.x, e.y - current!.y);
                if (dist < bestDist) {
                    bestDist = dist;
                    next = e;
                }
            }
        }
        current = next;
    }
}

function spawnTdParticles(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        tdParticles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 20 + Math.floor(Math.random() * 20),
            maxLife: 40,
            color,
            size: 2 + Math.random() * 3
        });
    }
}

function drawTd(): void {
    if (!tdCtx || !tdCanvas) return;

    tdCtx.fillStyle = '#1a2a1a';
    tdCtx.fillRect(0, 0, TD_WIDTH, TD_HEIGHT);

    tdCtx.strokeStyle = 'rgba(255,255,255,0.05)';
    tdCtx.lineWidth = 1;
    for (let c = 0; c <= TD_COLS; c++) {
        tdCtx.beginPath();
        tdCtx.moveTo(c * TD_CELL_SIZE, 0);
        tdCtx.lineTo(c * TD_CELL_SIZE, TD_HEIGHT);
        tdCtx.stroke();
    }
    for (let r = 0; r <= TD_ROWS; r++) {
        tdCtx.beginPath();
        tdCtx.moveTo(0, r * TD_CELL_SIZE);
        tdCtx.lineTo(TD_WIDTH, r * TD_CELL_SIZE);
        tdCtx.stroke();
    }

    tdCtx.fillStyle = 'rgba(139, 90, 43, 0.6)';
    for (let i = 0; i < TD_PATH.length; i++) {
        const wp = TD_PATH[i];
        tdCtx.fillRect(wp.c * TD_CELL_SIZE, wp.r * TD_CELL_SIZE, TD_CELL_SIZE, TD_CELL_SIZE);
        if (i < TD_PATH.length - 1) {
            const next = TD_PATH[i + 1];
            const minC = Math.min(wp.c, next.c);
            const maxC = Math.max(wp.c, next.c);
            const minR = Math.min(wp.r, next.r);
            const maxR = Math.max(wp.r, next.r);
            for (let c = minC; c <= maxC; c++) {
                for (let r = minR; r <= maxR; r++) {
                    tdCtx.fillRect(c * TD_CELL_SIZE, r * TD_CELL_SIZE, TD_CELL_SIZE, TD_CELL_SIZE);
                }
            }
        }
    }

    if (TD_PATH.length > 0) {
        const start = TD_PATH[0];
        const end = TD_PATH[TD_PATH.length - 1];
        tdCtx.fillStyle = '#2ecc71';
        tdCtx.font = '14px sans-serif';
        tdCtx.textAlign = 'center';
        tdCtx.fillText('START', start.c * TD_CELL_SIZE + TD_CELL_SIZE / 2, start.r * TD_CELL_SIZE + TD_CELL_SIZE / 2 + 5);
        tdCtx.fillStyle = '#e74c3c';
        tdCtx.fillText('END', end.c * TD_CELL_SIZE + TD_CELL_SIZE / 2, end.r * TD_CELL_SIZE + TD_CELL_SIZE / 2 + 5);
    }

    if (tdHoverCell && !tdGameOver && !tdWon) {
        const data = TD_TOWER_DATA[tdSelectedTower];
        const cx = tdHoverCell.c * TD_CELL_SIZE + TD_CELL_SIZE / 2;
        const cy = tdHoverCell.r * TD_CELL_SIZE + TD_CELL_SIZE / 2;
        const canPlace = canPlaceTower(tdHoverCell.c, tdHoverCell.r) && tdGold >= data.cost;
        tdCtx.fillStyle = canPlace ? 'rgba(40, 167, 69, 0.3)' : 'rgba(231, 76, 60, 0.3)';
        tdCtx.fillRect(tdHoverCell.c * TD_CELL_SIZE, tdHoverCell.r * TD_CELL_SIZE, TD_CELL_SIZE, TD_CELL_SIZE);
        tdCtx.strokeStyle = canPlace ? '#28a745' : '#e74c3c';
        tdCtx.beginPath();
        tdCtx.arc(cx, cy, data.range, 0, Math.PI * 2);
        tdCtx.stroke();
    }

    for (const tower of tdTowers) {
        drawTdTower(tower);
    }

    for (const enemy of tdEnemies) {
        drawTdEnemy(enemy);
    }

    for (const proj of tdProjectiles) {
        tdCtx.fillStyle = proj.type === 'arrow' ? '#ffff00' : proj.type === 'fireball' ? '#ff6600' : proj.type === 'ice' ? '#00ccff' : '#cc00ff';
        tdCtx.beginPath();
        tdCtx.arc(proj.x, proj.y, proj.type === 'arrow' ? 3 : 5, 0, Math.PI * 2);
        tdCtx.fill();
    }

    for (const p of tdParticles) {
        tdCtx.globalAlpha = p.life / p.maxLife;
        tdCtx.fillStyle = p.color;
        tdCtx.beginPath();
        tdCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        tdCtx.fill();
    }
    tdCtx.globalAlpha = 1;

    if (tdGameOver || tdWon) {
        tdCtx.fillStyle = 'rgba(0,0,0,0.7)';
        tdCtx.fillRect(0, 0, TD_WIDTH, TD_HEIGHT);
        tdCtx.fillStyle = tdWon ? '#2ecc71' : '#e74c3c';
        tdCtx.font = 'bold 36px sans-serif';
        tdCtx.textAlign = 'center';
        tdCtx.fillText(tdWon ? 'SIEG!' : 'GAME OVER', TD_WIDTH / 2, TD_HEIGHT / 2);
        tdCtx.font = '18px sans-serif';
        tdCtx.fillStyle = '#fff';
        tdCtx.fillText(`Punkte: ${tdScore}`, TD_WIDTH / 2, TD_HEIGHT / 2 + 30);
    }
}

function drawTdTower(tower: TdTower): void {
    if (!tdCtx) return;
    const x = tower.c * TD_CELL_SIZE;
    const y = tower.r * TD_CELL_SIZE;
    const data = TD_TOWER_DATA[tower.type];

    tdCtx.fillStyle = data.color;
    tdCtx.fillRect(x + 4, y + 4, TD_CELL_SIZE - 8, TD_CELL_SIZE - 8);
    tdCtx.strokeStyle = '#fff';
    tdCtx.lineWidth = 2;
    tdCtx.strokeRect(x + 4, y + 4, TD_CELL_SIZE - 8, TD_CELL_SIZE - 8);

    tdCtx.fillStyle = '#fff';
    for (let i = 0; i < tower.level; i++) {
        tdCtx.beginPath();
        tdCtx.arc(x + 10 + i * 8, y + 10, 2, 0, Math.PI * 2);
        tdCtx.fill();
    }

    tdCtx.fillStyle = '#fff';
    tdCtx.font = 'bold 16px sans-serif';
    tdCtx.textAlign = 'center';
    let symbol = 'A';
    if (tower.type === 'fire') symbol = 'F';
    if (tower.type === 'ice') symbol = 'I';
    if (tower.type === 'lightning') symbol = 'L';
    tdCtx.fillText(symbol, x + TD_CELL_SIZE / 2, y + TD_CELL_SIZE / 2 + 6);
}

function drawTdEnemy(enemy: TdEnemy): void {
    if (!tdCtx) return;
    tdCtx.fillStyle = enemy.color;
    tdCtx.beginPath();
    tdCtx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    tdCtx.fill();
    tdCtx.strokeStyle = '#000';
    tdCtx.lineWidth = 1;
    tdCtx.stroke();

    const barW = enemy.radius * 2;
    const barH = 4;
    const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
    tdCtx.fillStyle = '#000';
    tdCtx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 8, barW, barH);
    tdCtx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f1c40f' : '#e74c3c';
    tdCtx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 8, barW * hpPct, barH);

    if (enemy.frozen > 0) {
        tdCtx.strokeStyle = '#00ccff';
        tdCtx.beginPath();
        tdCtx.arc(enemy.x, enemy.y, enemy.radius + 4, 0, Math.PI * 2);
        tdCtx.stroke();
    }
}

function isTdPathCell(c: number, r: number): boolean {
    for (let i = 0; i < TD_PATH.length - 1; i++) {
        const a = TD_PATH[i];
        const b = TD_PATH[i + 1];
        const minC = Math.min(a.c, b.c);
        const maxC = Math.max(a.c, b.c);
        const minR = Math.min(a.r, b.r);
        const maxR = Math.max(a.r, b.r);
        if (c >= minC && c <= maxC && r >= minR && r <= maxR) return true;
    }
    return false;
}

function canPlaceTower(c: number, r: number): boolean {
    if (c < 0 || c >= TD_COLS || r < 0 || r >= TD_ROWS) return false;
    if (isTdPathCell(c, r)) return false;
    for (const tower of tdTowers) {
        if (tower.c === c && tower.r === r) return false;
    }
    return true;
}

function handleTdClick(e: MouseEvent): void {
    if (tdGameOver || tdWon || !tdCanvas) return;
    const rect = tdCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / TD_CELL_SIZE);
    const r = Math.floor(y / TD_CELL_SIZE);
    if (canPlaceTower(c, r)) {
        const data = TD_TOWER_DATA[tdSelectedTower];
        if (tdGold >= data.cost) {
            tdGold -= data.cost;
            tdTowers.push({
                c, r,
                type: tdSelectedTower,
                level: 1,
                cooldown: 0,
                maxCooldown: data.cooldown,
                range: data.range,
                damage: data.damage
            });
            updateTdUi();
        }
    }
}

function handleTdMouseMove(e: MouseEvent): void {
    if (!tdCanvas) return;
    const rect = tdCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / TD_CELL_SIZE);
    const r = Math.floor(y / TD_CELL_SIZE);
    if (c >= 0 && c < TD_COLS && r >= 0 && r < TD_ROWS) {
        tdHoverCell = { c, r };
    } else {
        tdHoverCell = null;
    }
}

function startNextTdWave(): void {
    if (tdWaveActive || tdGameOver || tdWon) return;
    if (tdWave < TD_WAVES.length) {
        tdWave++;
        tdWaveActive = true;
        tdWaveSpawned = 0;
        tdWaveToSpawn = TD_WAVES[tdWave - 1].count;
        tdSpawnTimer = 0;
        updateTdUi();
    }
}

function updateTdUi(): void {
    if (tdGoldDisplay) tdGoldDisplay.textContent = String(tdGold);
    if (tdLivesDisplay) tdLivesDisplay.textContent = String(tdLives);
    if (tdWaveDisplay) tdWaveDisplay.textContent = `${tdWave}/${TD_WAVES.length}`;
    if (tdScoreDisplay) tdScoreDisplay.textContent = String(tdScore);
    if (tdStatus) {
        if (tdWon) {
            tdStatus.textContent = `🎉 Sieg! Punkte: ${tdScore}`;
        } else if (tdGameOver) {
            tdStatus.textContent = '💀 Game Over!';
        } else if (tdWaveActive) {
            tdStatus.textContent = `Welle ${tdWave} läuft...`;
        } else if (tdWave >= TD_WAVES.length) {
            tdStatus.textContent = 'Alle Wellen geschafft!';
        } else {
            tdStatus.textContent = 'Baue Türme und starte die nächste Welle!';
        }
    }
    if (tdNextWaveBtn) {
        tdNextWaveBtn.disabled = tdWaveActive || tdGameOver || tdWon || tdWave >= TD_WAVES.length;
    }
}

function setupTdTowerButtons(): void {
    const types: TdTower['type'][] = ['archer', 'fire', 'ice', 'lightning'];
    for (const type of types) {
        const btn = document.getElementById(`tdTower${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (btn) {
            btn.addEventListener('click', () => {
                tdSelectedTower = type;
                document.querySelectorAll('.td-tower-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        }
    }
}

if (tdCanvas) {
    tdCanvas.addEventListener('click', handleTdClick);
    tdCanvas.addEventListener('mousemove', handleTdMouseMove);
    tdCanvas.addEventListener('mouseleave', () => { tdHoverCell = null; });
}
if (resetTdBtn) resetTdBtn.addEventListener('click', initTowerDefense);
if (tdNextWaveBtn) tdNextWaveBtn.addEventListener('click', startNextTdWave);
setupTdTowerButtons();

// =============================================
// Global Keyboard Handler
// =============================================

document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (boulderDashContainer && boulderDashContainer.style.display === 'block') {
        handleBdKey(e);
    } else if (snakeContainer && snakeContainer.style.display === 'block') {
        handleSnakeKey(e);
    } else if (pongContainer && pongContainer.style.display === 'block') {
        handlePongKey(e, true);
    } else if (spaceInvadersContainer && spaceInvadersContainer.style.display === 'block') {
        handleSpaceInvadersKey(e, true);
    } else if (breakoutContainer && breakoutContainer.style.display === 'block') {
        handleBreakoutKey(e, true);
    } else {
        handleTetrisKey(e);
    }
});

document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (pongContainer && pongContainer.style.display === 'block') {
        handlePongKey(e, false);
    } else if (spaceInvadersContainer && spaceInvadersContainer.style.display === 'block') {
        handleSpaceInvadersKey(e, false);
    } else if (breakoutContainer && breakoutContainer.style.display === 'block') {
        handleBreakoutKey(e, false);
    }
});

// =============================================
// Start the game
// =============================================

initGame();

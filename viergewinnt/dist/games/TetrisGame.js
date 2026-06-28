export class TetrisGame {
    constructor() {
        this.id = 'tetris';
        this.TETRIS_ROWS = 20;
        this.TETRIS_COLS = 10;
        this.BLOCK_SIZE = 20;
        this.PIECES_DATA = [
            { shape: [[1, 1, 1, 1]], color: '#00ffff' },
            { shape: [[1, 1], [1, 1]], color: '#ffff00' },
            { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' },
            { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' },
            { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' },
            { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' },
            { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffa500' }
        ];
        this.tetrisScore = 0;
        this.tetrisBoard = [];
        this.currentPiece = null;
        this.currentPiecePos = { x: 0, y: 0 };
        this.currentPieceColor = '';
        this.nextPieceIndex = -1;
        this.resetTetrisBtn = null;
        this.tetrisCanvas = null;
        this.tetrisStatusElement = null;
        this.nextPieceCanvas = null;
        this.tetrisBtnLeft = null;
        this.tetrisBtnRight = null;
        this.tetrisBtnDown = null;
        this.tetrisBtnRotate = null;
        this.ctx = null;
        this.nextCtx = null;
        this.resetTetrisBtn = document.getElementById('resetTetrisBtn');
        this.tetrisCanvas = document.getElementById('tetrisCanvas');
        this.tetrisStatusElement = document.getElementById('tetrisStatus');
        this.nextPieceCanvas = document.getElementById('nextPieceCanvas');
        this.tetrisBtnLeft = document.getElementById('tetrisBtnLeft');
        this.tetrisBtnRight = document.getElementById('tetrisBtnRight');
        this.tetrisBtnDown = document.getElementById('tetrisBtnDown');
        this.tetrisBtnRotate = document.getElementById('tetrisBtnRotate');
        this.ctx = this.tetrisCanvas ? this.tetrisCanvas.getContext('2d') : null;
        this.nextCtx = this.nextPieceCanvas ? this.nextPieceCanvas.getContext('2d') : null;
        this.setupEventListeners();
        this.setupMobileControls();
    }
    setupEventListeners() {
        if (this.resetTetrisBtn) {
            this.resetTetrisBtn.addEventListener('click', () => this.init());
        }
    }
    init() {
        if (this.tetrisInterval)
            clearInterval(this.tetrisInterval);
        this.tetrisBoard = Array.from({ length: this.TETRIS_ROWS }, () => Array(this.TETRIS_COLS).fill(null));
        this.tetrisScore = 0;
        this.nextPieceIndex = -1;
        if (this.tetrisStatusElement)
            this.tetrisStatusElement.textContent = `Punkte: ${this.tetrisScore}`;
        this.spawnPiece();
        this.tetrisInterval = setInterval(() => {
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
            }
            this.draw();
        }, 500);
    }
    cleanup() {
        if (this.tetrisInterval) {
            clearInterval(this.tetrisInterval);
            this.tetrisInterval = undefined;
        }
    }
    handleKey(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (e.key === 'ArrowLeft')
                this.movePiece(-1, 0);
            if (e.key === 'ArrowRight')
                this.movePiece(1, 0);
            if (e.key === 'ArrowDown')
                this.movePiece(0, 1);
            if (e.key === 'ArrowUp')
                this.rotatePiece();
            this.draw();
        }
    }
    clearLines() {
        let linesCleared = 0;
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
            if (this.tetrisStatusElement)
                this.tetrisStatusElement.textContent = `Punkte: ${this.tetrisScore}`;
        }
    }
    spawnPiece() {
        if (this.nextPieceIndex === -1) {
            this.nextPieceIndex = Math.floor(Math.random() * this.PIECES_DATA.length);
        }
        const index = this.nextPieceIndex;
        this.nextPieceIndex = Math.floor(Math.random() * this.PIECES_DATA.length);
        this.currentPiece = this.PIECES_DATA[index].shape.map(row => [...row]);
        this.currentPieceColor = this.PIECES_DATA[index].color;
        this.currentPiecePos = { x: Math.floor(this.TETRIS_COLS / 2) - 1, y: 0 };
        this.drawNextPiece();
        if (this.checkCollision(this.currentPiece, this.currentPiecePos.x, this.currentPiecePos.y)) {
            if (this.tetrisInterval)
                clearInterval(this.tetrisInterval);
            if (this.tetrisStatusElement)
                this.tetrisStatusElement.textContent = `Game Over! Punkte: ${this.tetrisScore}`;
        }
    }
    checkCollision(piece, x, y) {
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
                if (piece[r][c]) {
                    const newX = x + c;
                    const newY = y + r;
                    if (newX < 0 || newX >= this.TETRIS_COLS || newY >= this.TETRIS_ROWS || (newY >= 0 && this.tetrisBoard[newY][newX] !== null)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    movePiece(dx, dy) {
        if (this.currentPiece && !this.checkCollision(this.currentPiece, this.currentPiecePos.x + dx, this.currentPiecePos.y + dy)) {
            this.currentPiecePos.x += dx;
            this.currentPiecePos.y += dy;
            return true;
        }
        return false;
    }
    rotatePiece() {
        if (!this.currentPiece)
            return;
        const rotated = this.currentPiece[0].map((_, index) => this.currentPiece.map(row => row[index]).reverse());
        if (!this.checkCollision(rotated, this.currentPiecePos.x, this.currentPiecePos.y)) {
            this.currentPiece = rotated;
        }
    }
    lockPiece() {
        if (!this.currentPiece)
            return;
        for (let r = 0; r < this.currentPiece.length; r++) {
            for (let c = 0; c < this.currentPiece[r].length; c++) {
                if (this.currentPiece[r][c]) {
                    const newY = this.currentPiecePos.y + r;
                    const newX = this.currentPiecePos.x + c;
                    if (newY >= 0 && newY < this.TETRIS_ROWS) {
                        this.tetrisBoard[newY][newX] = this.currentPieceColor;
                    }
                }
            }
        }
        this.clearLines();
        this.spawnPiece();
    }
    draw() {
        if (!this.ctx)
            return;
        this.ctx.clearRect(0, 0, this.TETRIS_COLS * this.BLOCK_SIZE, this.TETRIS_ROWS * this.BLOCK_SIZE);
        for (let r = 0; r < this.TETRIS_ROWS; r++) {
            for (let c = 0; c < this.TETRIS_COLS; c++) {
                const cellColor = this.tetrisBoard[r][c];
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
    drawNextPiece() {
        if (!this.nextCtx || !this.nextPieceCanvas)
            return;
        const canvasW = this.nextPieceCanvas.width;
        const canvasH = this.nextPieceCanvas.height;
        this.nextCtx.clearRect(0, 0, canvasW, canvasH);
        if (this.nextPieceIndex === -1)
            return;
        const piece = this.PIECES_DATA[this.nextPieceIndex].shape;
        const color = this.PIECES_DATA[this.nextPieceIndex].color;
        const previewBlockSize = 20;
        const pieceW = piece[0].length * previewBlockSize;
        const pieceH = piece.length * previewBlockSize;
        const offsetX = (canvasW - pieceW) / 2;
        const offsetY = (canvasH - pieceH) / 2;
        this.nextCtx.fillStyle = color;
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
                if (piece[r][c]) {
                    this.nextCtx.fillRect(offsetX + c * previewBlockSize, offsetY + r * previewBlockSize, previewBlockSize, previewBlockSize);
                }
            }
        }
    }
    setupMobileControls() {
        const addControl = (btn, action) => {
            if (!btn)
                return;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                action();
                this.draw();
            });
            btn.addEventListener('click', (e) => {
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
//# sourceMappingURL=TetrisGame.js.map
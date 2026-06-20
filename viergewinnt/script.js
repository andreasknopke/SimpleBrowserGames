"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/games/ConnectFourGame.ts
  var ConnectFourGame;
  var init_ConnectFourGame = __esm({
    "src/games/ConnectFourGame.ts"() {
      "use strict";
      ConnectFourGame = class {
        constructor() {
          this.id = "fourWins";
          this.ROWS = 6;
          this.COLS = 7;
          this.PLAYER1 = 1;
          this.PLAYER2 = 2;
          this.board = [];
          this.currentPlayer = this.PLAYER1;
          this.gameActive = true;
          this.gameMode = "2p";
          this.difficulty = 1;
          this.boardElement = null;
          this.statusElement = null;
          this.gameModeSelect = null;
          this.difficultyContainer = null;
          this.difficultySelect = null;
          this.resetBtn = null;
          this.boardElement = document.getElementById("board");
          this.statusElement = document.getElementById("status");
          this.gameModeSelect = document.getElementById("gameMode");
          this.difficultyContainer = document.getElementById("difficultyContainer");
          this.difficultySelect = document.getElementById("difficulty");
          this.resetBtn = document.getElementById("resetBtn");
          this.setupEventListeners();
        }
        setupEventListeners() {
          if (this.gameModeSelect) {
            this.gameModeSelect.addEventListener("change", (e) => {
              const target = e.target;
              this.gameMode = target.value;
              if (this.difficultyContainer) {
                this.difficultyContainer.style.display = this.gameMode === "1p" ? "flex" : "none";
              }
              this.init();
            });
          }
          if (this.difficultySelect) {
            this.difficultySelect.addEventListener("change", (e) => {
              this.difficulty = parseInt(e.target.value);
              this.init();
            });
          }
          if (this.resetBtn) {
            this.resetBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
          this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
          this.currentPlayer = this.PLAYER1;
          this.gameActive = true;
          if (this.statusElement) this.statusElement.textContent = "Spieler 1 (Rot) ist am Zug";
          this.renderBoard();
        }
        cleanup() {
        }
        renderBoard() {
          if (!this.boardElement) return;
          this.boardElement.innerHTML = "";
          for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
              const cell = document.createElement("div");
              cell.classList.add("cell");
              if (this.board[r][c] !== 0) {
                const piece = document.createElement("div");
                piece.classList.add("piece");
                piece.classList.add(this.board[r][c] === this.PLAYER1 ? "red" : "yellow");
                cell.appendChild(piece);
              }
              cell.addEventListener("click", () => this.handleCellClick(c));
              this.boardElement.appendChild(cell);
            }
          }
        }
        handleCellClick(col) {
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
              this.statusElement.textContent = this.currentPlayer === this.PLAYER1 ? "Spieler 1 (Rot) ist am Zug" : this.gameMode === "1p" ? "Computer (Gelb) ist am Zug" : "Spieler 2 (Gelb) ist am Zug";
            }
            if (this.gameMode === "1p" && this.currentPlayer === this.PLAYER2) {
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
          return this.board[0].every((cell) => cell !== 0);
        }
        endGame(winner) {
          this.gameActive = false;
          if (!this.statusElement) return;
          if (winner === 0) {
            this.statusElement.textContent = "Unentschieden!";
          } else {
            const winnerName = winner === this.PLAYER1 ? "Spieler 1 (Rot)" : this.gameMode === "1p" ? "Computer (Gelb)" : "Spieler 2 (Gelb)";
            this.statusElement.textContent = `${winnerName} hat gewonnen!`;
          }
        }
        checkWin(board, player) {
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
        getBestMove() {
          let bestScore = -Infinity;
          let move = -1;
          const availableCols = this.getAvailableCols(this.board);
          for (const col of availableCols) {
            const tempBoard = this.board.map((row) => [...row]);
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
            if (board[0][c] === 0) available.push(c);
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
          if (this.checkWin(board, this.PLAYER2)) return 1e4 + depth;
          if (this.checkWin(board, this.PLAYER1)) return -1e4 - depth;
          if (this.isBoardFull() || depth === 0) return this.evaluateBoard(board);
          const availableCols = this.getAvailableCols(board);
          if (isMaximizing) {
            let maxEval = -Infinity;
            for (const col of availableCols) {
              const tempBoard = board.map((row) => [...row]);
              this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
              const evaluation = this.minimax(tempBoard, depth - 1, alpha, beta, false);
              maxEval = Math.max(maxEval, evaluation);
              alpha = Math.max(alpha, evaluation);
              if (beta <= alpha) break;
            }
            return maxEval;
          } else {
            let minEval = Infinity;
            for (const col of availableCols) {
              const tempBoard = board.map((row) => [...row]);
              this.makeMoveInBoard(tempBoard, col, this.PLAYER1);
              const evaluation = this.minimax(tempBoard, depth - 1, alpha, beta, true);
              minEval = Math.min(minEval, evaluation);
              beta = Math.min(beta, evaluation);
              if (beta <= alpha) break;
            }
            return minEval;
          }
        }
        evaluateBoard(board) {
          let score = 0;
          for (let r = 0; r < this.ROWS; r++) {
            if (board[r][3] === this.PLAYER2) score += 3;
            else if (board[r][3] === this.PLAYER1) score -= 3;
          }
          return score;
        }
      };
    }
  });

  // src/games/MinesweeperGame.ts
  var MinesweeperGame;
  var init_MinesweeperGame = __esm({
    "src/games/MinesweeperGame.ts"() {
      "use strict";
      MinesweeperGame = class {
        constructor() {
          this.id = "minesweeper";
          this.msBoard = [];
          this.msMines = [];
          this.msGameOver = false;
          this.msFlags = 0;
          this.msMinesCount = 0;
          this.resetMsBtn = null;
          this.msDifficultySelect = null;
          this.msBoardElement = null;
          this.msStatusElement = null;
          this.resetMsBtn = document.getElementById("resetMsBtn");
          this.msDifficultySelect = document.getElementById("msDifficulty");
          this.msBoardElement = document.getElementById("msBoard");
          this.msStatusElement = document.getElementById("msStatus");
          this.setupEventListeners();
        }
        setupEventListeners() {
          if (this.msDifficultySelect) {
            this.msDifficultySelect.addEventListener("change", () => this.init());
          }
          if (this.resetMsBtn) {
            this.resetMsBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
          const difficulty = this.msDifficultySelect ? this.msDifficultySelect.value : "easy";
          let rows, cols, mines;
          if (difficulty === "easy") {
            rows = 10;
            cols = 10;
            mines = 10;
          } else if (difficulty === "medium") {
            rows = 15;
            cols = 15;
            mines = 40;
          } else {
            rows = 20;
            cols = 20;
            mines = 80;
          }
          this.msMinesCount = mines;
          this.msFlags = 0;
          this.msGameOver = false;
          this.msBoard = Array.from({ length: rows }, () => Array(cols).fill(0));
          this.msMines = [];
          let minesPlaced = 0;
          while (minesPlaced < mines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (this.msBoard[r][c] !== "M") {
              this.msBoard[r][c] = "M";
              this.msMines.push([r, c]);
              minesPlaced++;
            }
          }
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (this.msBoard[r][c] === "M") continue;
              let count = 0;
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr;
                  const nc = c + dc;
                  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && this.msBoard[nr][nc] === "M") {
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
        }
        renderBoard(rows, cols) {
          if (!this.msBoardElement) return;
          this.msBoardElement.innerHTML = "";
          this.msBoardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cell = document.createElement("div");
              cell.classList.add("ms-cell");
              cell.dataset.row = String(r);
              cell.dataset.col = String(c);
              cell.addEventListener("click", () => this.revealCell(r, c));
              cell.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.flagCell(r, c);
              });
              this.msBoardElement.appendChild(cell);
            }
          }
        }
        revealCell(r, c) {
          if (this.msGameOver) return;
          const cell = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
          if (!cell || cell.classList.contains("revealed") || cell.classList.contains("flagged")) return;
          if (this.msBoard[r][c] === "M") {
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
          if (!cell || cell.classList.contains("revealed") || cell.classList.contains("flagged")) return;
          cell.classList.add("revealed");
          if (typeof this.msBoard[r][c] === "number" && this.msBoard[r][c] > 0) {
            cell.textContent = String(this.msBoard[r][c]);
            cell.classList.add(`number-${this.msBoard[r][c]}`);
          } else {
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
          if (this.msGameOver) return;
          const cell = this.msBoardElement ? this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`) : null;
          if (!cell || cell.classList.contains("revealed")) return;
          if (cell.classList.contains("flagged")) {
            cell.classList.remove("flagged");
            this.msFlags--;
          } else {
            cell.classList.add("flagged");
            this.msFlags++;
          }
          this.updateStatus();
        }
        updateStatus() {
          if (this.msStatusElement) this.msStatusElement.textContent = `Minen: ${this.msMinesCount - this.msFlags}`;
        }
        gameOver(won) {
          this.msGameOver = true;
          if (!this.msStatusElement || !this.msBoardElement) return;
          if (won) {
            this.msStatusElement.textContent = "Gewonnen!";
          } else {
            this.msStatusElement.textContent = "Verloren!";
            for (const [r, c] of this.msMines) {
              const cell = this.msBoardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
              if (cell) {
                cell.classList.add("mine");
                cell.textContent = "\u{1F4A3}";
              }
            }
          }
        }
        checkWin() {
          const rows = this.msBoard.length;
          const cols = this.msBoard[0].length;
          const revealedCells = document.querySelectorAll(".ms-cell.revealed");
          const target = rows * cols - this.msMinesCount;
          if (revealedCells.length === target) {
            this.gameOver(true);
          }
        }
      };
    }
  });

  // src/games/TetrisGame.ts
  var TetrisGame;
  var init_TetrisGame = __esm({
    "src/games/TetrisGame.ts"() {
      "use strict";
      TetrisGame = class {
        constructor() {
          this.id = "tetris";
          this.TETRIS_ROWS = 20;
          this.TETRIS_COLS = 10;
          this.BLOCK_SIZE = 20;
          this.PIECES_DATA = [
            { shape: [[1, 1, 1, 1]], color: "#00ffff" },
            { shape: [[1, 1], [1, 1]], color: "#ffff00" },
            { shape: [[0, 1, 0], [1, 1, 1]], color: "#800080" },
            { shape: [[0, 1, 1], [1, 1, 0]], color: "#00ff00" },
            { shape: [[1, 1, 0], [0, 1, 1]], color: "#ff0000" },
            { shape: [[1, 0, 0], [1, 1, 1]], color: "#0000ff" },
            { shape: [[0, 0, 1], [1, 1, 1]], color: "#ffa500" }
          ];
          this.tetrisScore = 0;
          this.tetrisBoard = [];
          this.currentPiece = null;
          this.currentPiecePos = { x: 0, y: 0 };
          this.currentPieceColor = "";
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
          this.resetTetrisBtn = document.getElementById("resetTetrisBtn");
          this.tetrisCanvas = document.getElementById("tetrisCanvas");
          this.tetrisStatusElement = document.getElementById("tetrisStatus");
          this.nextPieceCanvas = document.getElementById("nextPieceCanvas");
          this.tetrisBtnLeft = document.getElementById("tetrisBtnLeft");
          this.tetrisBtnRight = document.getElementById("tetrisBtnRight");
          this.tetrisBtnDown = document.getElementById("tetrisBtnDown");
          this.tetrisBtnRotate = document.getElementById("tetrisBtnRotate");
          this.ctx = this.tetrisCanvas ? this.tetrisCanvas.getContext("2d") : null;
          this.nextCtx = this.nextPieceCanvas ? this.nextPieceCanvas.getContext("2d") : null;
          this.setupEventListeners();
          this.setupMobileControls();
        }
        setupEventListeners() {
          if (this.resetTetrisBtn) {
            this.resetTetrisBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
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
        cleanup() {
          if (this.tetrisInterval) {
            clearInterval(this.tetrisInterval);
            this.tetrisInterval = void 0;
          }
        }
        handleKey(e) {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (e.key === "ArrowLeft") this.movePiece(-1, 0);
            if (e.key === "ArrowRight") this.movePiece(1, 0);
            if (e.key === "ArrowDown") this.movePiece(0, 1);
            if (e.key === "ArrowUp") this.rotatePiece();
            this.draw();
          }
        }
        clearLines() {
          let linesCleared = 0;
          for (let r = this.TETRIS_ROWS - 1; r >= 0; r--) {
            if (this.tetrisBoard[r].every((cell) => cell !== null)) {
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
        spawnPiece() {
          if (this.nextPieceIndex === -1) {
            this.nextPieceIndex = Math.floor(Math.random() * this.PIECES_DATA.length);
          }
          const index = this.nextPieceIndex;
          this.nextPieceIndex = Math.floor(Math.random() * this.PIECES_DATA.length);
          this.currentPiece = this.PIECES_DATA[index].shape.map((row) => [...row]);
          this.currentPieceColor = this.PIECES_DATA[index].color;
          this.currentPiecePos = { x: Math.floor(this.TETRIS_COLS / 2) - 1, y: 0 };
          this.drawNextPiece();
          if (this.checkCollision(this.currentPiece, this.currentPiecePos.x, this.currentPiecePos.y)) {
            if (this.tetrisInterval) clearInterval(this.tetrisInterval);
            if (this.tetrisStatusElement) this.tetrisStatusElement.textContent = `Game Over! Punkte: ${this.tetrisScore}`;
          }
        }
        checkCollision(piece, x, y) {
          for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
              if (piece[r][c]) {
                const newX = x + c;
                const newY = y + r;
                if (newX < 0 || newX >= this.TETRIS_COLS || newY >= this.TETRIS_ROWS || newY >= 0 && this.tetrisBoard[newY][newX] !== null) {
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
          if (!this.currentPiece) return;
          const rotated = this.currentPiece[0].map(
            (_, index) => this.currentPiece.map((row) => row[index]).reverse()
          );
          if (!this.checkCollision(rotated, this.currentPiecePos.x, this.currentPiecePos.y)) {
            this.currentPiece = rotated;
          }
        }
        lockPiece() {
          if (!this.currentPiece) return;
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
          if (!this.ctx) return;
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
          if (!this.nextCtx || !this.nextPieceCanvas) return;
          const canvasW = this.nextPieceCanvas.width;
          const canvasH = this.nextPieceCanvas.height;
          this.nextCtx.clearRect(0, 0, canvasW, canvasH);
          if (this.nextPieceIndex === -1) return;
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
            if (!btn) return;
            btn.addEventListener("touchstart", (e) => {
              e.preventDefault();
              action();
              this.draw();
            });
            btn.addEventListener("click", (e) => {
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
      };
    }
  });

  // src/games/SnakeGame.ts
  var SnakeGame;
  var init_SnakeGame = __esm({
    "src/games/SnakeGame.ts"() {
      "use strict";
      SnakeGame = class {
        constructor() {
          this.id = "snake";
          this.SNAKE_SIZE = 20;
          this.SNAKE_COLS = 20;
          this.SNAKE_ROWS = 20;
          this.SNAKE_CANVAS_SIZE = 400;
          this.snake = [];
          this.snakeDir = { x: 1, y: 0 };
          this.snakeNextDir = { x: 1, y: 0 };
          this.snakeFood = { x: 5, y: 5 };
          this.snakeScore = 0;
          this.snakeGameOver = false;
          this.resetSnakeBtn = null;
          this.snakeCanvas = null;
          this.snakeStatusElement = null;
          this.snakeBtnUp = null;
          this.snakeBtnLeft = null;
          this.snakeBtnDown = null;
          this.snakeBtnRight = null;
          this.snakeCtx = null;
          this.resetSnakeBtn = document.getElementById("resetSnakeBtn");
          this.snakeCanvas = document.getElementById("snakeCanvas");
          this.snakeStatusElement = document.getElementById("snakeStatus");
          this.snakeBtnUp = document.getElementById("snakeBtnUp");
          this.snakeBtnLeft = document.getElementById("snakeBtnLeft");
          this.snakeBtnDown = document.getElementById("snakeBtnDown");
          this.snakeBtnRight = document.getElementById("snakeBtnRight");
          this.snakeCtx = this.snakeCanvas ? this.snakeCanvas.getContext("2d") : null;
          this.setupEventListeners();
          this.setupMobileControls();
        }
        setupEventListeners() {
          if (this.resetSnakeBtn) {
            this.resetSnakeBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
          if (this.snakeInterval) clearInterval(this.snakeInterval);
          this.snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
          this.snakeDir = { x: 1, y: 0 };
          this.snakeNextDir = { x: 1, y: 0 };
          this.snakeScore = 0;
          this.snakeGameOver = false;
          if (this.snakeStatusElement) this.snakeStatusElement.textContent = `Punkte: ${this.snakeScore}`;
          this.placeFood();
          this.draw();
          this.snakeInterval = setInterval(() => {
            this.snakeDir = __spreadValues({}, this.snakeNextDir);
            this.move();
            this.draw();
          }, 150);
        }
        cleanup() {
          if (this.snakeInterval) {
            clearInterval(this.snakeInterval);
            this.snakeInterval = void 0;
          }
        }
        handleKey(e) {
          if (this.snakeGameOver) return;
          switch (e.key) {
            case "ArrowUp":
              if (this.snakeDir.y !== 1) this.snakeNextDir = { x: 0, y: -1 };
              break;
            case "ArrowDown":
              if (this.snakeDir.y !== -1) this.snakeNextDir = { x: 0, y: 1 };
              break;
            case "ArrowLeft":
              if (this.snakeDir.x !== 1) this.snakeNextDir = { x: -1, y: 0 };
              break;
            case "ArrowRight":
              if (this.snakeDir.x !== -1) this.snakeNextDir = { x: 1, y: 0 };
              break;
          }
          e.preventDefault();
        }
        placeFood() {
          let free = false;
          while (!free) {
            const fx = Math.floor(Math.random() * this.SNAKE_COLS);
            const fy = Math.floor(Math.random() * this.SNAKE_ROWS);
            free = true;
            for (const seg of this.snake) {
              if (seg.x === fx && seg.y === fy) {
                free = false;
                break;
              }
            }
            if (free) {
              this.snakeFood = { x: fx, y: fy };
            }
          }
        }
        move() {
          if (this.snakeGameOver) return;
          const head = { x: this.snake[0].x + this.snakeDir.x, y: this.snake[0].y + this.snakeDir.y };
          if (head.x < 0 || head.x >= this.SNAKE_COLS || head.y < 0 || head.y >= this.SNAKE_ROWS) {
            this.end();
            return;
          }
          for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
              this.end();
              return;
            }
          }
          this.snake.unshift(head);
          if (head.x === this.snakeFood.x && head.y === this.snakeFood.y) {
            this.snakeScore += 10;
            if (this.snakeStatusElement) this.snakeStatusElement.textContent = `Punkte: ${this.snakeScore}`;
            this.placeFood();
          } else {
            this.snake.pop();
          }
        }
        end() {
          this.snakeGameOver = true;
          if (this.snakeInterval) clearInterval(this.snakeInterval);
          if (this.snakeStatusElement) this.snakeStatusElement.textContent = `Game Over! Punkte: ${this.snakeScore}`;
        }
        draw() {
          if (!this.snakeCtx) return;
          this.snakeCtx.clearRect(0, 0, this.SNAKE_CANVAS_SIZE, this.SNAKE_CANVAS_SIZE);
          this.snakeCtx.fillStyle = "#ff0000";
          this.snakeCtx.fillRect(this.snakeFood.x * this.SNAKE_SIZE, this.snakeFood.y * this.SNAKE_SIZE, this.SNAKE_SIZE, this.SNAKE_SIZE);
          for (let i = 0; i < this.snake.length; i++) {
            const g = 255 - Math.floor(i / this.snake.length * 200);
            this.snakeCtx.fillStyle = `rgb(0, ${g}, 0)`;
            this.snakeCtx.fillRect(this.snake[i].x * this.SNAKE_SIZE, this.snake[i].y * this.SNAKE_SIZE, this.SNAKE_SIZE - 1, this.SNAKE_SIZE - 1);
          }
        }
        setupMobileControls() {
          const addSnakeControl = (btn, dx, dy) => {
            if (!btn) return;
            const handler = () => {
              if (this.snakeGameOver) return;
              if (dx === 0 && dy === -1 && this.snakeDir.y !== 1) this.snakeNextDir = { x: 0, y: -1 };
              else if (dx === 0 && dy === 1 && this.snakeDir.y !== -1) this.snakeNextDir = { x: 0, y: 1 };
              else if (dx === -1 && dy === 0 && this.snakeDir.x !== 1) this.snakeNextDir = { x: -1, y: 0 };
              else if (dx === 1 && dy === 0 && this.snakeDir.x !== -1) this.snakeNextDir = { x: 1, y: 0 };
            };
            btn.addEventListener("touchstart", (e) => {
              e.preventDefault();
              handler();
            });
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              handler();
            });
          };
          addSnakeControl(this.snakeBtnUp, 0, -1);
          addSnakeControl(this.snakeBtnDown, 0, 1);
          addSnakeControl(this.snakeBtnLeft, -1, 0);
          addSnakeControl(this.snakeBtnRight, 1, 0);
        }
      };
    }
  });

  // src/games/PongGame.ts
  var PongGame;
  var init_PongGame = __esm({
    "src/games/PongGame.ts"() {
      "use strict";
      PongGame = class {
        constructor() {
          this.id = "pong";
          this.PONG_WIDTH = 600;
          this.PONG_HEIGHT = 400;
          this.PADDLE_WIDTH = 10;
          this.PADDLE_HEIGHT = 60;
          this.BALL_SIZE = 8;
          this.PADDLE_SPEED = 5;
          this.AI_SPEED = 4;
          this.pongMode = "2p";
          this.pongLeftY = 160;
          this.pongRightY = 160;
          this.pongBallX = 300;
          this.pongBallY = 200;
          this.pongBallDX = 4;
          this.pongBallDY = 4;
          this.pongLeftScore = 0;
          this.pongRightScore = 0;
          this.pongGameOver = false;
          this.pongLeftMoving = 0;
          this.pongRightMoving = 0;
          this.resetPongBtn = null;
          this.pongCanvas = null;
          this.pongStatusElement = null;
          this.pongModeSelect = null;
          this.pongBtnLeftUp = null;
          this.pongBtnLeftDown = null;
          this.pongBtnRightUp = null;
          this.pongBtnRightDown = null;
          this.pongCtx = null;
          this.resetPongBtn = document.getElementById("resetPongBtn");
          this.pongCanvas = document.getElementById("pongCanvas");
          this.pongStatusElement = document.getElementById("pongStatus");
          this.pongModeSelect = document.getElementById("pongMode");
          this.pongBtnLeftUp = document.getElementById("pongBtnLeftUp");
          this.pongBtnLeftDown = document.getElementById("pongBtnLeftDown");
          this.pongBtnRightUp = document.getElementById("pongBtnRightUp");
          this.pongBtnRightDown = document.getElementById("pongBtnRightDown");
          this.pongCtx = this.pongCanvas ? this.pongCanvas.getContext("2d") : null;
          this.setupEventListeners();
          this.setupMobileControls();
        }
        setupEventListeners() {
          if (this.resetPongBtn) this.resetPongBtn.addEventListener("click", () => this.init());
          if (this.pongModeSelect) this.pongModeSelect.addEventListener("change", () => this.init());
        }
        init() {
          if (this.pongInterval) clearInterval(this.pongInterval);
          this.pongMode = this.pongModeSelect ? this.pongModeSelect.value : "2p";
          this.pongLeftY = 160;
          this.pongRightY = 160;
          this.pongBallX = 300;
          this.pongBallY = 200;
          this.pongBallDX = 4 * (Math.random() > 0.5 ? 1 : -1);
          this.pongBallDY = 4 * (Math.random() > 0.5 ? 1 : -1);
          this.pongLeftScore = 0;
          this.pongRightScore = 0;
          this.pongGameOver = false;
          this.pongLeftMoving = 0;
          this.pongRightMoving = 0;
          if (this.pongStatusElement) this.pongStatusElement.textContent = "Player 1: 0 | Player 2: 0";
          this.draw();
          this.pongInterval = setInterval(() => {
            this.update();
            this.draw();
          }, 20);
        }
        cleanup() {
          if (this.pongInterval) {
            clearInterval(this.pongInterval);
            this.pongInterval = void 0;
          }
        }
        handleKeyDown(e) {
          if (this.pongGameOver) return;
          if (e.key === "w" || e.key === "W") this.pongLeftMoving = -1;
          if (e.key === "s" || e.key === "S") this.pongLeftMoving = 1;
          if (e.key === "ArrowUp") this.pongRightMoving = -1;
          if (e.key === "ArrowDown") this.pongRightMoving = 1;
          e.preventDefault();
        }
        handleKeyUp(e) {
          if (e.key === "w" || e.key === "W") this.pongLeftMoving = 0;
          if (e.key === "s" || e.key === "S") this.pongLeftMoving = 0;
          if (e.key === "ArrowUp") this.pongRightMoving = 0;
          if (e.key === "ArrowDown") this.pongRightMoving = 0;
          e.preventDefault();
        }
        update() {
          if (this.pongGameOver) return;
          this.pongLeftY += this.pongLeftMoving * this.PADDLE_SPEED;
          if (this.pongMode === "1p") {
            const target = this.pongBallY - this.PADDLE_HEIGHT / 2;
            const diff = target - this.pongRightY;
            if (Math.abs(diff) > this.AI_SPEED) {
              this.pongRightY += Math.sign(diff) * this.AI_SPEED;
            }
          } else {
            this.pongRightY += this.pongRightMoving * this.PADDLE_SPEED;
          }
          this.pongLeftY = Math.max(0, Math.min(this.PONG_HEIGHT - this.PADDLE_HEIGHT, this.pongLeftY));
          this.pongRightY = Math.max(0, Math.min(this.PONG_HEIGHT - this.PADDLE_HEIGHT, this.pongRightY));
          this.pongBallX += this.pongBallDX;
          this.pongBallY += this.pongBallDY;
          if (this.pongBallY <= 0 || this.pongBallY >= this.PONG_HEIGHT - this.BALL_SIZE) {
            this.pongBallDY = -this.pongBallDY;
          }
          if (this.pongBallX <= 10 + this.BALL_SIZE && this.pongBallX >= 10 && this.pongBallY + this.BALL_SIZE >= this.pongLeftY && this.pongBallY <= this.pongLeftY + this.PADDLE_HEIGHT) {
            this.pongBallDX = -this.pongBallDX;
            this.pongBallX = 10 + this.BALL_SIZE + 1;
          }
          if (this.pongBallX >= this.PONG_WIDTH - 10 - this.BALL_SIZE && this.pongBallX <= this.PONG_WIDTH - 10 && this.pongBallY + this.BALL_SIZE >= this.pongRightY && this.pongBallY <= this.pongRightY + this.PADDLE_HEIGHT) {
            this.pongBallDX = -this.pongBallDX;
            this.pongBallX = this.PONG_WIDTH - 10 - this.BALL_SIZE - 1;
          }
          if (this.pongBallX < 0) {
            this.pongRightScore++;
            this.resetBall();
          }
          if (this.pongBallX > this.PONG_WIDTH) {
            this.pongLeftScore++;
            this.resetBall();
          }
          if (this.pongStatusElement) this.pongStatusElement.textContent = `Player 1: ${this.pongLeftScore} | Player 2: ${this.pongRightScore}`;
          if (this.pongLeftScore >= 10 || this.pongRightScore >= 10) {
            this.pongGameOver = true;
            if (this.pongInterval) clearInterval(this.pongInterval);
            const winner = this.pongLeftScore >= 10 ? "Player 1" : "Player 2";
            if (this.pongStatusElement) this.pongStatusElement.textContent = `${winner} hat gewonnen! (${this.pongLeftScore}:${this.pongRightScore})`;
          }
        }
        resetBall() {
          this.pongBallX = this.PONG_WIDTH / 2;
          this.pongBallY = this.PONG_HEIGHT / 2;
          this.pongBallDX = 4 * (Math.random() > 0.5 ? 1 : -1);
          this.pongBallDY = 4 * (Math.random() > 0.5 ? 1 : -1);
        }
        draw() {
          if (!this.pongCtx) return;
          this.pongCtx.clearRect(0, 0, this.PONG_WIDTH, this.PONG_HEIGHT);
          this.pongCtx.strokeStyle = "#fff";
          this.pongCtx.setLineDash([10, 10]);
          this.pongCtx.beginPath();
          this.pongCtx.moveTo(this.PONG_WIDTH / 2, 0);
          this.pongCtx.lineTo(this.PONG_WIDTH / 2, this.PONG_HEIGHT);
          this.pongCtx.stroke();
          this.pongCtx.setLineDash([]);
          this.pongCtx.fillStyle = "#fff";
          this.pongCtx.fillRect(10, this.pongLeftY, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
          this.pongCtx.fillRect(this.PONG_WIDTH - 10 - this.PADDLE_WIDTH, this.pongRightY, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
          this.pongCtx.fillRect(this.pongBallX, this.pongBallY, this.BALL_SIZE, this.BALL_SIZE);
        }
        setupMobileControls() {
          const addPongControl = (btn, side, dir) => {
            if (!btn) return;
            const start = () => {
              if (side === "left") this.pongLeftMoving = dir;
              else this.pongRightMoving = dir;
            };
            const stop = () => {
              if (side === "left") this.pongLeftMoving = 0;
              else this.pongRightMoving = 0;
            };
            btn.addEventListener("touchstart", (e) => {
              e.preventDefault();
              start();
            });
            btn.addEventListener("touchend", (e) => {
              e.preventDefault();
              stop();
            });
            btn.addEventListener("mousedown", (e) => {
              e.preventDefault();
              start();
            });
            btn.addEventListener("mouseup", (e) => {
              e.preventDefault();
              stop();
            });
          };
          addPongControl(this.pongBtnLeftUp, "left", -1);
          addPongControl(this.pongBtnLeftDown, "left", 1);
          addPongControl(this.pongBtnRightUp, "right", -1);
          addPongControl(this.pongBtnRightDown, "right", 1);
        }
      };
    }
  });

  // src/games/SpaceInvadersGame.ts
  var SpaceInvadersGame;
  var init_SpaceInvadersGame = __esm({
    "src/games/SpaceInvadersGame.ts"() {
      "use strict";
      SpaceInvadersGame = class {
        constructor() {
          this.id = "spaceInvaders";
          this.SI_ALIEN_ROWS = 4;
          this.SI_ALIEN_COLS = 8;
          this.SI_ALIEN_WIDTH = 30;
          this.SI_ALIEN_HEIGHT = 20;
          this.SI_ALIEN_GAP = 10;
          this.SI_ALIEN_OFFSET_TOP = 40;
          this.SI_ALIEN_OFFSET_LEFT = 20;
          this.SI_PLAYER_WIDTH = 40;
          this.SI_PLAYER_HEIGHT = 20;
          this.SI_BULLET_WIDTH = 3;
          this.SI_BULLET_HEIGHT = 10;
          this.SI_ALIEN_BULLET_WIDTH = 3;
          this.SI_ALIEN_BULLET_HEIGHT = 8;
          this.siPlayerX = 220;
          this.siBullets = [];
          this.siAliens = [];
          this.siAlienBullets = [];
          this.siAlienDir = 1;
          this.siAlienSpeed = 1;
          this.siAlienDropAmount = 10;
          this.siScore = 0;
          this.siGameOver = false;
          this.siAlienMoveTimer = 0;
          this.siAlienMoveInterval = 30;
          this.resetSpaceInvadersBtn = null;
          this.spaceInvadersCanvas = null;
          this.spaceInvadersStatusElement = null;
          this.spaceInvadersBtnLeft = null;
          this.spaceInvadersBtnRight = null;
          this.spaceInvadersBtnShoot = null;
          this.spaceInvadersCtx = null;
          this.resetSpaceInvadersBtn = document.getElementById("resetSpaceInvadersBtn");
          this.spaceInvadersCanvas = document.getElementById("spaceInvadersCanvas");
          this.spaceInvadersStatusElement = document.getElementById("spaceInvadersStatus");
          this.spaceInvadersBtnLeft = document.getElementById("spaceInvadersBtnLeft");
          this.spaceInvadersBtnRight = document.getElementById("spaceInvadersBtnRight");
          this.spaceInvadersBtnShoot = document.getElementById("spaceInvadersBtnShoot");
          this.spaceInvadersCtx = this.spaceInvadersCanvas ? this.spaceInvadersCanvas.getContext("2d") : null;
          this.setupEventListeners();
          this.setupMobileControls();
        }
        setupEventListeners() {
          if (this.resetSpaceInvadersBtn) {
            this.resetSpaceInvadersBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
          if (this.spaceInvadersInterval) clearInterval(this.spaceInvadersInterval);
          if (!this.spaceInvadersCanvas) return;
          this.siPlayerX = (this.spaceInvadersCanvas.width - this.SI_PLAYER_WIDTH) / 2;
          this.siBullets = [];
          this.siAlienBullets = [];
          this.siScore = 0;
          this.siGameOver = false;
          this.siAlienDir = 1;
          this.siAlienSpeed = 1;
          this.siAlienMoveTimer = 0;
          this.siAlienMoveInterval = 30;
          if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = "Punkte: 0";
          this.siAliens = [];
          for (let r = 0; r < this.SI_ALIEN_ROWS; r++) {
            for (let c = 0; c < this.SI_ALIEN_COLS; c++) {
              this.siAliens.push({
                x: this.SI_ALIEN_OFFSET_LEFT + c * (this.SI_ALIEN_WIDTH + this.SI_ALIEN_GAP),
                y: this.SI_ALIEN_OFFSET_TOP + r * (this.SI_ALIEN_HEIGHT + this.SI_ALIEN_GAP),
                alive: true,
                row: r
              });
            }
          }
          this.spaceInvadersInterval = setInterval(() => {
            this.update();
            this.draw();
          }, 16);
        }
        cleanup() {
          if (this.spaceInvadersInterval) {
            clearInterval(this.spaceInvadersInterval);
            this.spaceInvadersInterval = void 0;
          }
        }
        handleKeyDown(e) {
          if (!this.spaceInvadersCanvas) return;
          if (e.key === "ArrowLeft" || e.key === "a") {
            this.siPlayerX = Math.max(0, this.siPlayerX - 15);
          }
          if (e.key === "ArrowRight" || e.key === "d") {
            this.siPlayerX = Math.min(this.spaceInvadersCanvas.width - this.SI_PLAYER_WIDTH, this.siPlayerX + 15);
          }
          if (e.key === " " || e.key === "Space") {
            if (this.siBullets.length < 3) {
              this.siBullets.push({
                x: this.siPlayerX + this.SI_PLAYER_WIDTH / 2 - this.SI_BULLET_WIDTH / 2,
                y: this.spaceInvadersCanvas.height - 38
              });
            }
          }
          e.preventDefault();
        }
        handleKeyUp(_e) {
        }
        update() {
          if (this.siGameOver) return;
          this.siAlienMoveTimer++;
          if (this.siAlienMoveTimer >= this.siAlienMoveInterval) {
            this.siAlienMoveTimer = 0;
            let shouldDrop = false;
            const aliveAliens = this.siAliens.filter((a) => a.alive);
            for (const alien of aliveAliens) {
              if (!this.spaceInvadersCanvas) return;
              if (this.siAlienDir === 1 && alien.x + this.SI_ALIEN_WIDTH >= this.spaceInvadersCanvas.width - 10 || this.siAlienDir === -1 && alien.x <= 10) {
                shouldDrop = true;
                break;
              }
            }
            if (shouldDrop) {
              this.siAlienDir *= -1;
              for (const alien of aliveAliens) {
                alien.y += this.siAlienDropAmount;
              }
              if (aliveAliens.length > 0) {
                const minRow = Math.min(...aliveAliens.map((a) => a.row));
                this.siAlienMoveInterval = Math.max(5, 30 - minRow * 5);
              }
            } else {
              for (const alien of aliveAliens) {
                alien.x += this.siAlienDir * this.siAlienSpeed;
              }
            }
            if (aliveAliens.length > 0 && Math.random() < 0.3) {
              const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
              this.siAlienBullets.push({
                x: shooter.x + this.SI_ALIEN_WIDTH / 2,
                y: shooter.y + this.SI_ALIEN_HEIGHT,
                speed: 3
              });
            }
            for (const alien of aliveAliens) {
              if (!this.spaceInvadersCanvas) return;
              if (alien.y + this.SI_ALIEN_HEIGHT >= this.spaceInvadersCanvas.height - this.SI_PLAYER_HEIGHT - 20) {
                this.siGameOver = true;
                if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${this.siScore}`;
                if (this.spaceInvadersInterval) clearInterval(this.spaceInvadersInterval);
                return;
              }
            }
            if (aliveAliens.length === 0) {
              this.siAlienSpeed += 0.5;
              this.siAlienMoveInterval = Math.max(5, 30 - this.siAlienSpeed * 3);
              for (let r = 0; r < this.SI_ALIEN_ROWS; r++) {
                for (let c = 0; c < this.SI_ALIEN_COLS; c++) {
                  this.siAliens.push({
                    x: this.SI_ALIEN_OFFSET_LEFT + c * (this.SI_ALIEN_WIDTH + this.SI_ALIEN_GAP),
                    y: this.SI_ALIEN_OFFSET_TOP + r * (this.SI_ALIEN_HEIGHT + this.SI_ALIEN_GAP),
                    alive: true,
                    row: r
                  });
                }
              }
            }
          }
          for (let i = this.siBullets.length - 1; i >= 0; i--) {
            this.siBullets[i].y -= 5;
            if (this.siBullets[i].y < 0) {
              this.siBullets.splice(i, 1);
            }
          }
          for (let i = this.siAlienBullets.length - 1; i >= 0; i--) {
            this.siAlienBullets[i].y += this.siAlienBullets[i].speed;
            if (this.siAlienBullets[i].y > (this.spaceInvadersCanvas ? this.spaceInvadersCanvas.height : 0)) {
              this.siAlienBullets.splice(i, 1);
            }
          }
          for (let i = this.siBullets.length - 1; i >= 0; i--) {
            const bullet = this.siBullets[i];
            for (const alien of this.siAliens) {
              if (alien.alive && bullet.x < alien.x + this.SI_ALIEN_WIDTH && bullet.x + this.SI_BULLET_WIDTH > alien.x && bullet.y < alien.y + this.SI_ALIEN_HEIGHT && bullet.y + this.SI_BULLET_HEIGHT > alien.y) {
                alien.alive = false;
                this.siBullets.splice(i, 1);
                this.siScore += (this.SI_ALIEN_ROWS - alien.row) * 10;
                if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = `Punkte: ${this.siScore}`;
                break;
              }
            }
          }
          for (const bullet of this.siAlienBullets) {
            if (!this.spaceInvadersCanvas) return;
            if (bullet.x < this.siPlayerX + this.SI_PLAYER_WIDTH && bullet.x + this.SI_ALIEN_BULLET_WIDTH > this.siPlayerX && bullet.y < this.spaceInvadersCanvas.height - 30 && bullet.y + this.SI_ALIEN_BULLET_HEIGHT > this.spaceInvadersCanvas.height - 30) {
              this.siGameOver = true;
              if (this.spaceInvadersStatusElement) this.spaceInvadersStatusElement.textContent = `Game Over! Punkte: ${this.siScore}`;
              if (this.spaceInvadersInterval) clearInterval(this.spaceInvadersInterval);
              return;
            }
          }
        }
        draw() {
          if (!this.spaceInvadersCtx || !this.spaceInvadersCanvas) return;
          this.spaceInvadersCtx.clearRect(0, 0, this.spaceInvadersCanvas.width, this.spaceInvadersCanvas.height);
          const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
          for (const alien of this.siAliens) {
            if (!alien.alive) continue;
            this.spaceInvadersCtx.fillStyle = colors[alien.row % colors.length];
            this.spaceInvadersCtx.fillRect(alien.x, alien.y, this.SI_ALIEN_WIDTH, this.SI_ALIEN_HEIGHT);
            this.spaceInvadersCtx.fillStyle = "#000";
            this.spaceInvadersCtx.fillRect(alien.x + 7, alien.y + 6, 5, 5);
            this.spaceInvadersCtx.fillRect(alien.x + 18, alien.y + 6, 5, 5);
          }
          this.spaceInvadersCtx.fillStyle = "#00ff00";
          this.spaceInvadersCtx.fillRect(this.siPlayerX, this.spaceInvadersCanvas.height - 30, this.SI_PLAYER_WIDTH, this.SI_PLAYER_HEIGHT);
          this.spaceInvadersCtx.fillRect(this.siPlayerX + this.SI_PLAYER_WIDTH / 2 - 3, this.spaceInvadersCanvas.height - 38, 6, 8);
          this.spaceInvadersCtx.fillStyle = "#ffff00";
          for (const bullet of this.siBullets) {
            this.spaceInvadersCtx.fillRect(bullet.x, bullet.y, this.SI_BULLET_WIDTH, this.SI_BULLET_HEIGHT);
          }
          this.spaceInvadersCtx.fillStyle = "#ff4444";
          for (const bullet of this.siAlienBullets) {
            this.spaceInvadersCtx.fillRect(bullet.x, bullet.y, this.SI_ALIEN_BULLET_WIDTH, this.SI_ALIEN_BULLET_HEIGHT);
          }
        }
        setupMobileControls() {
          const addControl = (btn, action) => {
            if (!btn) return;
            btn.addEventListener("touchstart", (e) => {
              e.preventDefault();
              action();
            });
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              action();
            });
          };
          addControl(this.spaceInvadersBtnLeft, () => {
            if (!this.siGameOver) this.siPlayerX = Math.max(0, this.siPlayerX - 15);
          });
          addControl(this.spaceInvadersBtnRight, () => {
            if (!this.siGameOver) this.siPlayerX = Math.min(this.spaceInvadersCanvas ? this.spaceInvadersCanvas.width - this.SI_PLAYER_WIDTH : 0, this.siPlayerX + 15);
          });
          addControl(this.spaceInvadersBtnShoot, () => {
            if (!this.siGameOver && this.siBullets.length < 3 && this.spaceInvadersCanvas) {
              this.siBullets.push({
                x: this.siPlayerX + this.SI_PLAYER_WIDTH / 2 - this.SI_BULLET_WIDTH / 2,
                y: this.spaceInvadersCanvas.height - 38
              });
            }
          });
        }
      };
    }
  });

  // src/games/BreakoutGame.ts
  var BreakoutGame;
  var init_BreakoutGame = __esm({
    "src/games/BreakoutGame.ts"() {
      "use strict";
      BreakoutGame = class {
        constructor() {
          this.id = "breakout";
          this.BREAKOUT_PADDLE_WIDTH = 80;
          this.BREAKOUT_PADDLE_HEIGHT = 12;
          this.BREAKOUT_BRICK_ROWS = 5;
          this.BREAKOUT_BRICK_COLS = 8;
          this.BREAKOUT_BRICK_WIDTH = 52;
          this.BREAKOUT_BRICK_HEIGHT = 18;
          this.BREAKOUT_BRICK_GAP = 6;
          this.BREAKOUT_BRICK_OFFSET_TOP = 40;
          this.BREAKOUT_BRICK_OFFSET_LEFT = 10;
          this.BREAKOUT_BALL_RADIUS = 6;
          this.BREAKOUT_PADDLE_SPEED = 6;
          this.breakoutPaddleX = 200;
          this.breakoutBallX = 240;
          this.breakoutBallY = 350;
          this.breakoutBallDX = 3;
          this.breakoutBallDY = -3;
          this.breakoutBricks = [];
          this.breakoutScore = 0;
          this.breakoutLives = 3;
          this.breakoutGameOver = false;
          this.breakoutPaddleMoving = 0;
          this.resetBreakoutBtn = null;
          this.breakoutCanvas = null;
          this.breakoutStatusElement = null;
          this.breakoutBtnLeft = null;
          this.breakoutBtnRight = null;
          this.breakoutCtx = null;
          this.resetBreakoutBtn = document.getElementById("resetBreakoutBtn");
          this.breakoutCanvas = document.getElementById("breakoutCanvas");
          this.breakoutStatusElement = document.getElementById("breakoutStatus");
          this.breakoutBtnLeft = document.getElementById("breakoutBtnLeft");
          this.breakoutBtnRight = document.getElementById("breakoutBtnRight");
          this.breakoutCtx = this.breakoutCanvas ? this.breakoutCanvas.getContext("2d") : null;
          this.setupEventListeners();
          this.setupMobileControls();
        }
        setupEventListeners() {
          if (this.resetBreakoutBtn) {
            this.resetBreakoutBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
          if (this.breakoutInterval) clearInterval(this.breakoutInterval);
          if (!this.breakoutCanvas) return;
          this.breakoutPaddleX = (this.breakoutCanvas.width - this.BREAKOUT_PADDLE_WIDTH) / 2;
          this.breakoutBallX = this.breakoutCanvas.width / 2;
          this.breakoutBallY = this.breakoutCanvas.height - 40;
          this.breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
          this.breakoutBallDY = -3;
          this.breakoutScore = 0;
          this.breakoutLives = 3;
          this.breakoutGameOver = false;
          this.breakoutPaddleMoving = 0;
          this.breakoutBricks = [];
          const brickColors = ["#ff0000", "#ff7700", "#ffff00", "#00ff00", "#0000ff"];
          for (let r = 0; r < this.BREAKOUT_BRICK_ROWS; r++) {
            for (let c = 0; c < this.BREAKOUT_BRICK_COLS; c++) {
              this.breakoutBricks.push({
                x: this.BREAKOUT_BRICK_OFFSET_LEFT + c * (this.BREAKOUT_BRICK_WIDTH + this.BREAKOUT_BRICK_GAP),
                y: this.BREAKOUT_BRICK_OFFSET_TOP + r * (this.BREAKOUT_BRICK_HEIGHT + this.BREAKOUT_BRICK_GAP),
                color: brickColors[r],
                alive: true
              });
            }
          }
          if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Punkte: 0 | Leben: ${this.breakoutLives}`;
          this.breakoutInterval = setInterval(() => {
            this.update();
            this.draw();
          }, 16);
        }
        cleanup() {
          if (this.breakoutInterval) {
            clearInterval(this.breakoutInterval);
            this.breakoutInterval = void 0;
          }
        }
        handleKeyDown(e) {
          if (e.key === "ArrowLeft" || e.key === "a") {
            this.breakoutPaddleMoving = -1;
          }
          if (e.key === "ArrowRight" || e.key === "d") {
            this.breakoutPaddleMoving = 1;
          }
          e.preventDefault();
        }
        handleKeyUp(e) {
          if ((e.key === "ArrowLeft" || e.key === "a") && this.breakoutPaddleMoving === -1) {
            this.breakoutPaddleMoving = 0;
          }
          if ((e.key === "ArrowRight" || e.key === "d") && this.breakoutPaddleMoving === 1) {
            this.breakoutPaddleMoving = 0;
          }
          e.preventDefault();
        }
        update() {
          if (this.breakoutGameOver) return;
          this.breakoutPaddleX += this.breakoutPaddleMoving * this.BREAKOUT_PADDLE_SPEED;
          if (this.breakoutCanvas) this.breakoutPaddleX = Math.max(0, Math.min(this.breakoutCanvas.width - this.BREAKOUT_PADDLE_WIDTH, this.breakoutPaddleX));
          this.breakoutBallX += this.breakoutBallDX;
          this.breakoutBallY += this.breakoutBallDY;
          if (!this.breakoutCanvas) return;
          if (this.breakoutBallX - this.BREAKOUT_BALL_RADIUS <= 0 || this.breakoutBallX + this.BREAKOUT_BALL_RADIUS >= this.breakoutCanvas.width) {
            this.breakoutBallDX = -this.breakoutBallDX;
          }
          if (this.breakoutBallY - this.BREAKOUT_BALL_RADIUS <= 0) {
            this.breakoutBallDY = -this.breakoutBallDY;
          }
          if (this.breakoutBallY + this.BREAKOUT_BALL_RADIUS >= this.breakoutCanvas.height - 30 && this.breakoutBallY + this.BREAKOUT_BALL_RADIUS <= this.breakoutCanvas.height - 15 && this.breakoutBallX >= this.breakoutPaddleX && this.breakoutBallX <= this.breakoutPaddleX + this.BREAKOUT_PADDLE_WIDTH) {
            this.breakoutBallDY = -Math.abs(this.breakoutBallDY);
            const hitPos = (this.breakoutBallX - this.breakoutPaddleX) / this.BREAKOUT_PADDLE_WIDTH;
            this.breakoutBallDX = 6 * (hitPos - 0.5);
          }
          if (this.breakoutBallY + this.BREAKOUT_BALL_RADIUS > this.breakoutCanvas.height) {
            this.breakoutLives--;
            if (this.breakoutLives <= 0) {
              this.breakoutGameOver = true;
              if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Game Over! Punkte: ${this.breakoutScore}`;
              if (this.breakoutInterval) clearInterval(this.breakoutInterval);
              return;
            }
            this.breakoutBallX = this.breakoutCanvas.width / 2;
            this.breakoutBallY = this.breakoutCanvas.height - 40;
            this.breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
            this.breakoutBallDY = -3;
            if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Punkte: ${this.breakoutScore} | Leben: ${this.breakoutLives}`;
          }
          for (const brick of this.breakoutBricks) {
            if (!brick.alive) continue;
            if (this.breakoutBallX + this.BREAKOUT_BALL_RADIUS > brick.x && this.breakoutBallX - this.BREAKOUT_BALL_RADIUS < brick.x + this.BREAKOUT_BRICK_WIDTH && this.breakoutBallY + this.BREAKOUT_BALL_RADIUS > brick.y && this.breakoutBallY - this.BREAKOUT_BALL_RADIUS < brick.y + this.BREAKOUT_BRICK_HEIGHT) {
              brick.alive = false;
              this.breakoutBallDY = -this.breakoutBallDY;
              this.breakoutScore += 10;
              if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Punkte: ${this.breakoutScore} | Leben: ${this.breakoutLives}`;
              break;
            }
          }
          if (this.breakoutBricks.every((b) => !b.alive)) {
            this.breakoutGameOver = true;
            if (this.breakoutStatusElement) this.breakoutStatusElement.textContent = `Gewonnen! Punkte: ${this.breakoutScore}`;
            if (this.breakoutInterval) clearInterval(this.breakoutInterval);
          }
        }
        draw() {
          if (!this.breakoutCtx) return;
          this.breakoutCtx.clearRect(0, 0, this.breakoutCtx.canvas.width, this.breakoutCtx.canvas.height);
          for (const brick of this.breakoutBricks) {
            if (!brick.alive) continue;
            this.breakoutCtx.fillStyle = brick.color;
            this.breakoutCtx.fillRect(brick.x, brick.y, this.BREAKOUT_BRICK_WIDTH, this.BREAKOUT_BRICK_HEIGHT);
            this.breakoutCtx.strokeStyle = "#333";
            this.breakoutCtx.strokeRect(brick.x, brick.y, this.BREAKOUT_BRICK_WIDTH, this.BREAKOUT_BRICK_HEIGHT);
          }
          this.breakoutCtx.fillStyle = "#007bff";
          this.breakoutCtx.fillRect(this.breakoutPaddleX, this.breakoutCtx.canvas.height - 30, this.BREAKOUT_PADDLE_WIDTH, this.BREAKOUT_PADDLE_HEIGHT);
          this.breakoutCtx.beginPath();
          this.breakoutCtx.arc(this.breakoutBallX, this.breakoutBallY, this.BREAKOUT_BALL_RADIUS, 0, Math.PI * 2);
          this.breakoutCtx.fillStyle = "#fff";
          this.breakoutCtx.fill();
          this.breakoutCtx.closePath();
        }
        setupMobileControls() {
          const addControl = (btn, direction) => {
            if (!btn) return;
            const start = () => {
              this.breakoutPaddleMoving = direction;
            };
            const stop = () => {
              this.breakoutPaddleMoving = 0;
            };
            btn.addEventListener("touchstart", (e) => {
              e.preventDefault();
              start();
            });
            btn.addEventListener("touchend", (e) => {
              e.preventDefault();
              stop();
            });
            btn.addEventListener("mousedown", (e) => {
              e.preventDefault();
              start();
            });
            btn.addEventListener("mouseup", (e) => {
              e.preventDefault();
              stop();
            });
          };
          addControl(this.breakoutBtnLeft, -1);
          addControl(this.breakoutBtnRight, 1);
        }
      };
    }
  });

  // src/games/BoulderDashGame.ts
  var BD_EMPTY_CHAR, BD_PLAYER_CHAR, BD_WALL_CHAR, BD_DIRT_CHAR, BD_BOULDER_CHAR, BD_DIAMOND_CHAR, BD_MAGIC_WALL_CHAR, BoulderDashGame;
  var init_BoulderDashGame = __esm({
    "src/games/BoulderDashGame.ts"() {
      "use strict";
      BD_EMPTY_CHAR = 0;
      BD_PLAYER_CHAR = 1;
      BD_WALL_CHAR = 2;
      BD_DIRT_CHAR = 3;
      BD_BOULDER_CHAR = 4;
      BD_DIAMOND_CHAR = 5;
      BD_MAGIC_WALL_CHAR = 6;
      BoulderDashGame = class {
        constructor() {
          this.id = "boulderDash";
          this.BD_SIZE = 20;
          this.BD_CELL_SIZE = 20;
          this.BD_TARGET_COLLECT = 10;
          this.board = [];
          this.playerX = 0;
          this.playerY = 0;
          this.score = 0;
          this.totalDiamonds = 0;
          this.collectedDiamonds = 0;
          this.gameOver = false;
          this.won = false;
          this.resetBdBtn = null;
          this.bdCanvas = null;
          this.bdStatusElement = null;
          this.bdBtnUp = null;
          this.bdBtnDown = null;
          this.bdBtnLeft = null;
          this.bdBtnRight = null;
          this.ctx = null;
          this.resetBdBtn = document.getElementById("resetBdBtn");
          this.bdCanvas = document.getElementById("bdCanvas");
          this.bdStatusElement = document.getElementById("bdStatus");
          this.bdBtnUp = document.getElementById("bdBtnUp");
          this.bdBtnDown = document.getElementById("bdBtnDown");
          this.bdBtnLeft = document.getElementById("bdBtnLeft");
          this.bdBtnRight = document.getElementById("bdBtnRight");
          this.ctx = this.bdCanvas ? this.bdCanvas.getContext("2d") : null;
          this.setupEventListeners();
          this.setupMobileControls();
        }
        setupEventListeners() {
          if (this.resetBdBtn) {
            this.resetBdBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
          if (this.interval) clearInterval(this.interval);
          this.score = 0;
          this.collectedDiamonds = 0;
          this.totalDiamonds = 0;
          this.gameOver = false;
          this.won = false;
          this.generateCave();
          for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
              if (this.board[y][x] === BD_PLAYER_CHAR) {
                this.playerX = x;
                this.playerY = y;
              }
            }
          }
          this.totalDiamonds = 0;
          for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
              if (this.board[y][x] === BD_DIAMOND_CHAR) {
                this.totalDiamonds++;
              }
            }
          }
          if (this.totalDiamonds < this.BD_TARGET_COLLECT) {
            this.totalDiamonds = this.BD_TARGET_COLLECT;
          }
          this.updateStatus();
          this.draw();
          this.interval = setInterval(() => {
            this.updatePhysics();
            this.draw();
            this.checkWinCondition();
          }, 100);
        }
        cleanup() {
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = void 0;
          }
        }
        handleKey(e) {
          switch (e.key) {
            case "ArrowUp":
            case "w":
            case "W":
              e.preventDefault();
              this.movePlayer(0, -1);
              break;
            case "ArrowDown":
            case "s":
            case "S":
              e.preventDefault();
              this.movePlayer(0, 1);
              break;
            case "ArrowLeft":
            case "a":
            case "A":
              e.preventDefault();
              this.movePlayer(-1, 0);
              break;
            case "ArrowRight":
            case "d":
            case "D":
              e.preventDefault();
              this.movePlayer(1, 0);
              break;
          }
        }
        generateCave() {
          this.board = [];
          for (let y = 0; y < this.BD_SIZE; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BD_SIZE; x++) {
              this.board[y][x] = BD_DIRT_CHAR;
            }
          }
          for (let x = 0; x < this.BD_SIZE; x++) {
            this.board[0][x] = BD_WALL_CHAR;
            this.board[this.BD_SIZE - 1][x] = BD_WALL_CHAR;
          }
          for (let y = 0; y < this.BD_SIZE; y++) {
            this.board[y][0] = BD_WALL_CHAR;
            this.board[y][this.BD_SIZE - 1] = BD_WALL_CHAR;
          }
          const numWalls = 8 + Math.floor(Math.random() * 8);
          for (let i = 0; i < numWalls; i++) {
            const x = 2 + Math.floor(Math.random() * (this.BD_SIZE - 4));
            const y = 2 + Math.floor(Math.random() * (this.BD_SIZE - 4));
            for (let dy = 0; dy < 2; dy++) {
              for (let dx = 0; dx < 2; dx++) {
                if (y + dy < this.BD_SIZE - 1 && x + dx < this.BD_SIZE - 1) {
                  this.board[y + dy][x + dx] = BD_WALL_CHAR;
                }
              }
            }
          }
          const numBoulders = 10 + Math.floor(Math.random() * 9);
          for (let i = 0; i < numBoulders; i++) {
            const x = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            const y = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            if (this.board[y][x] === BD_DIRT_CHAR) {
              this.board[y][x] = BD_BOULDER_CHAR;
            }
          }
          const numDiamonds = 15 + Math.floor(Math.random() * 11);
          for (let i = 0; i < numDiamonds; i++) {
            const x = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            const y = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            if (this.board[y][x] === BD_DIRT_CHAR) {
              this.board[y][x] = BD_DIAMOND_CHAR;
            }
          }
          this.board[2][2] = BD_PLAYER_CHAR;
          this.playerX = 2;
          this.playerY = 2;
          const mwX = this.BD_SIZE - 3;
          const mwY = this.BD_SIZE - 3;
          if (this.board[mwY][mwX] === BD_DIRT_CHAR) {
            this.board[mwY][mwX] = BD_MAGIC_WALL_CHAR;
          }
        }
        updateStatus() {
          if (this.bdStatusElement) {
            if (this.won) {
              this.bdStatusElement.textContent = `\u{1F389} Gewonnen! \u{1F48E} ${this.collectedDiamonds}/${this.totalDiamonds}  Punkte: ${this.score}`;
            } else if (this.gameOver) {
              this.bdStatusElement.textContent = `\u{1F480} Game Over! \u{1F48E} ${this.collectedDiamonds}/${this.totalDiamonds}`;
            } else {
              this.bdStatusElement.textContent = `Sammle \u{1F48E} ${this.collectedDiamonds}/${this.totalDiamonds}  Punkte: ${this.score}`;
            }
          }
        }
        draw() {
          if (!this.ctx || !this.bdCanvas) return;
          const cs = this.BD_CELL_SIZE;
          this.ctx.clearRect(0, 0, this.bdCanvas.width, this.bdCanvas.height);
          for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
              const cell = this.board[y][x];
              const px = x * cs;
              const py = y * cs;
              switch (cell) {
                case BD_EMPTY_CHAR:
                  this.ctx.fillStyle = "#1a1a2e";
                  this.ctx.fillRect(px, py, cs, cs);
                  break;
                case BD_WALL_CHAR:
                  this.ctx.fillStyle = "#555";
                  this.ctx.fillRect(px, py, cs, cs);
                  this.ctx.strokeStyle = "#777";
                  this.ctx.strokeRect(px, py, cs, cs);
                  break;
                case BD_DIRT_CHAR:
                  this.ctx.fillStyle = "#8B4513";
                  this.ctx.fillRect(px, py, cs, cs);
                  this.ctx.fillStyle = "#A0522D";
                  this.ctx.fillRect(px + 4, py + 4, 3, 3);
                  this.ctx.fillRect(px + 12, py + 10, 3, 3);
                  this.ctx.fillRect(px + 7, py + 15, 3, 3);
                  break;
                case BD_BOULDER_CHAR:
                  this.ctx.fillStyle = "#888";
                  this.ctx.fillRect(px, py, cs, cs);
                  this.ctx.fillStyle = "#aaa";
                  this.ctx.beginPath();
                  this.ctx.arc(px + 6, py + 6, 5, 0, Math.PI * 2);
                  this.ctx.fill();
                  this.ctx.fillStyle = "#666";
                  this.ctx.beginPath();
                  this.ctx.arc(px + 14, py + 14, 5, 0, Math.PI * 2);
                  this.ctx.fill();
                  break;
                case BD_DIAMOND_CHAR:
                  this.ctx.fillStyle = "#00ffff";
                  this.ctx.fillRect(px, py, cs, cs);
                  this.ctx.fillStyle = "#00ced1";
                  this.ctx.beginPath();
                  this.ctx.moveTo(px + 10, py + 2);
                  this.ctx.lineTo(px + 18, py + 10);
                  this.ctx.lineTo(px + 10, py + 18);
                  this.ctx.lineTo(px + 2, py + 10);
                  this.ctx.closePath();
                  this.ctx.fill();
                  this.ctx.strokeStyle = "#fff";
                  this.ctx.lineWidth = 1;
                  this.ctx.stroke();
                  this.ctx.lineWidth = 1;
                  break;
                case BD_PLAYER_CHAR:
                  this.ctx.fillStyle = "#1a1a2e";
                  this.ctx.fillRect(px, py, cs, cs);
                  this.ctx.fillStyle = "#ffd700";
                  this.ctx.beginPath();
                  this.ctx.arc(px + 10, py + 10, 7, 0, Math.PI * 2);
                  this.ctx.fill();
                  this.ctx.fillStyle = "#000";
                  this.ctx.beginPath();
                  this.ctx.arc(px + 8, py + 8, 2, 0, Math.PI * 2);
                  this.ctx.fill();
                  this.ctx.beginPath();
                  this.ctx.arc(px + 12, py + 8, 2, 0, Math.PI * 2);
                  this.ctx.fill();
                  this.ctx.strokeStyle = "#000";
                  this.ctx.beginPath();
                  this.ctx.arc(px + 10, py + 12, 3, 0, Math.PI);
                  this.ctx.stroke();
                  break;
                case BD_MAGIC_WALL_CHAR:
                  this.ctx.fillStyle = "#1a1a2e";
                  this.ctx.fillRect(px, py, cs, cs);
                  this.ctx.fillStyle = "#ff00ff";
                  this.ctx.fillRect(px + 2, py + 2, cs - 4, cs - 4);
                  this.ctx.fillStyle = "#ff69b4";
                  this.ctx.fillRect(px + 5, py + 5, cs - 10, cs - 10);
                  this.ctx.fillStyle = "#ff00ff";
                  this.ctx.font = "10px monospace";
                  this.ctx.fillText("\u2605", px + 5, py + 15);
                  break;
              }
            }
          }
          this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
          this.ctx.lineWidth = 0.5;
          for (let i = 0; i <= this.BD_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cs, 0);
            this.ctx.lineTo(i * cs, this.bdCanvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * cs);
            this.ctx.lineTo(this.bdCanvas.width, i * cs);
            this.ctx.stroke();
          }
        }
        movePlayer(dx, dy) {
          if (this.gameOver || this.won) return;
          const nx = this.playerX + dx;
          const ny = this.playerY + dy;
          if (nx < 1 || nx >= this.BD_SIZE - 1 || ny < 1 || ny >= this.BD_SIZE - 1) return;
          const target = this.board[ny][nx];
          if (target === BD_WALL_CHAR || target === BD_BOULDER_CHAR) return;
          if (target === BD_DIRT_CHAR || target === BD_EMPTY_CHAR) {
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            this.draw();
            return;
          }
          if (target === BD_DIAMOND_CHAR) {
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            this.collectedDiamonds++;
            this.score += 10;
            this.updateStatus();
            this.draw();
            this.checkWinCondition();
            return;
          }
          if (target === BD_MAGIC_WALL_CHAR) {
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            for (let dy2 = -1; dy2 <= 1; dy2++) {
              for (let dx2 = -1; dx2 <= 1; dx2++) {
                const mx = nx + dx2;
                const my = ny + dy2;
                if (mx >= 1 && mx < this.BD_SIZE - 1 && my >= 1 && my < this.BD_SIZE - 1) {
                  if (this.board[my][mx] === BD_DIRT_CHAR) {
                    this.board[my][mx] = BD_EMPTY_CHAR;
                  }
                }
              }
            }
            this.draw();
            return;
          }
        }
        updatePhysics() {
          if (this.gameOver || this.won) return;
          for (let y = this.BD_SIZE - 2; y >= 1; y--) {
            for (let x = this.BD_SIZE - 2; x >= 1; x--) {
              if (this.board[y][x] === BD_BOULDER_CHAR) {
                const below = this.board[y + 1][x];
                if (below === BD_EMPTY_CHAR) {
                  if (y + 1 === this.playerY && x === this.playerX) {
                    this.board[y][x] = BD_EMPTY_CHAR;
                    this.board[y + 1][x] = BD_BOULDER_CHAR;
                    this.gameOver = true;
                    this.updateStatus();
                    if (this.interval) clearInterval(this.interval);
                    this.draw();
                    return;
                  }
                  this.board[y + 1][x] = BD_BOULDER_CHAR;
                  this.board[y][x] = BD_EMPTY_CHAR;
                } else if (below === BD_WALL_CHAR || below === BD_BOULDER_CHAR) {
                  const canRollLeft = x > 1 && (this.board[y + 1][x - 1] === BD_WALL_CHAR || this.board[y + 1][x - 1] === BD_BOULDER_CHAR) && (this.board[y][x - 1] === BD_EMPTY_CHAR || this.board[y][x - 1] === BD_PLAYER_CHAR);
                  const canRollRight = x < this.BD_SIZE - 2 && (this.board[y + 1][x + 1] === BD_WALL_CHAR || this.board[y + 1][x + 1] === BD_BOULDER_CHAR) && (this.board[y][x + 1] === BD_EMPTY_CHAR || this.board[y][x + 1] === BD_PLAYER_CHAR);
                  if (canRollLeft) {
                    if (y === this.playerY && x - 1 === this.playerX) {
                      this.board[y][x] = BD_EMPTY_CHAR;
                      this.board[y][x - 1] = BD_BOULDER_CHAR;
                      this.gameOver = true;
                      this.updateStatus();
                      if (this.interval) clearInterval(this.interval);
                      this.draw();
                      return;
                    }
                    this.board[y][x - 1] = BD_BOULDER_CHAR;
                    this.board[y][x] = BD_EMPTY_CHAR;
                  } else if (canRollRight) {
                    if (y === this.playerY && x + 1 === this.playerX) {
                      this.board[y][x] = BD_EMPTY_CHAR;
                      this.board[y][x + 1] = BD_BOULDER_CHAR;
                      this.gameOver = true;
                      this.updateStatus();
                      if (this.interval) clearInterval(this.interval);
                      this.draw();
                      return;
                    }
                    this.board[y][x + 1] = BD_BOULDER_CHAR;
                    this.board[y][x] = BD_EMPTY_CHAR;
                  }
                }
              }
            }
          }
        }
        checkWinCondition() {
          if (this.collectedDiamonds >= this.BD_TARGET_COLLECT && !this.won && !this.gameOver) {
            this.won = true;
            this.score += 50;
            this.updateStatus();
            if (this.interval) clearInterval(this.interval);
            this.draw();
          }
        }
        setupMobileControls() {
          const addBdControl = (btn, dx, dy) => {
            if (!btn) return;
            const action = () => {
              this.movePlayer(dx, dy);
              this.draw();
              this.checkWinCondition();
            };
            btn.addEventListener("touchstart", (e) => {
              e.preventDefault();
              action();
            });
            btn.addEventListener("mousedown", (e) => {
              e.preventDefault();
              action();
            });
          };
          addBdControl(this.bdBtnUp, 0, -1);
          addBdControl(this.bdBtnDown, 0, 1);
          addBdControl(this.bdBtnLeft, -1, 0);
          addBdControl(this.bdBtnRight, 1, 0);
        }
      };
    }
  });

  // src/games/TowerDefenseGame.ts
  var TowerDefenseGame;
  var init_TowerDefenseGame = __esm({
    "src/games/TowerDefenseGame.ts"() {
      "use strict";
      TowerDefenseGame = class {
        constructor() {
          this.id = "towerDefense";
          this.TD_COLS = 15;
          this.TD_ROWS = 12;
          this.TD_CELL_SIZE = 40;
          this.TD_WIDTH = 600;
          this.TD_HEIGHT = 480;
          this.TD_TOWER_DATA = {
            archer: { name: "Bogensch\xFCtze", cost: 50, range: 120, damage: 12, cooldown: 25, color: "#28a745", desc: "Schnell, Einzelziel" },
            fire: { name: "Feuer", cost: 120, range: 100, damage: 20, cooldown: 55, color: "#ff6600", desc: "Fl\xE4chenschaden" },
            ice: { name: "Eis", cost: 100, range: 110, damage: 6, cooldown: 40, color: "#00ccff", desc: "Verlangsamt Gegner" },
            lightning: { name: "Blitz", cost: 175, range: 140, damage: 18, cooldown: 45, color: "#cc00ff", desc: "Kettenblitz" }
          };
          this.TD_WAVES = [
            { count: 6, interval: 900, hp: 30, speed: 1.2, reward: 8, type: "normal", color: "#e74c3c", radius: 10 },
            { count: 8, interval: 800, hp: 40, speed: 1.4, reward: 8, type: "normal", color: "#e74c3c", radius: 10 },
            { count: 10, interval: 700, hp: 35, speed: 2.2, reward: 10, type: "fast", color: "#f1c40f", radius: 8 },
            { count: 7, interval: 1e3, hp: 90, speed: 0.9, reward: 14, type: "tank", color: "#7f8c8d", radius: 13 },
            { count: 12, interval: 650, hp: 55, speed: 1.8, reward: 11, type: "fast", color: "#f1c40f", radius: 8 },
            { count: 9, interval: 850, hp: 130, speed: 1, reward: 16, type: "tank", color: "#7f8c8d", radius: 13 },
            { count: 15, interval: 600, hp: 70, speed: 2.4, reward: 12, type: "fast", color: "#f1c40f", radius: 8 },
            { count: 1, interval: 1200, hp: 900, speed: 0.7, reward: 150, type: "boss", color: "#8e44ad", radius: 18 },
            { count: 18, interval: 550, hp: 110, speed: 1.9, reward: 13, type: "normal", color: "#e74c3c", radius: 10 },
            { count: 3, interval: 1500, hp: 700, speed: 0.8, reward: 120, type: "boss", color: "#8e44ad", radius: 18 }
          ];
          this.TD_PATH = [
            { c: 0, r: 1 },
            { c: 3, r: 1 },
            { c: 3, r: 5 },
            { c: 7, r: 5 },
            { c: 7, r: 2 },
            { c: 11, r: 2 },
            { c: 11, r: 8 },
            { c: 5, r: 8 },
            { c: 5, r: 10 },
            { c: 14, r: 10 }
          ];
          this.tdGold = 150;
          this.tdLives = 20;
          this.tdScore = 0;
          this.tdWave = 0;
          this.tdEnemies = [];
          this.tdTowers = [];
          this.tdProjectiles = [];
          this.tdParticles = [];
          this.tdSelectedTower = "archer";
          this.tdWaveActive = false;
          this.tdWaveSpawned = 0;
          this.tdWaveToSpawn = 0;
          this.tdSpawnTimer = 0;
          this.tdGameOver = false;
          this.tdWon = false;
          this.tdHoverCell = null;
          this.tdCtx = null;
          this.resetTdBtn = null;
          this.tdCanvas = null;
          this.tdStatus = null;
          this.tdGoldDisplay = null;
          this.tdLivesDisplay = null;
          this.tdWaveDisplay = null;
          this.tdScoreDisplay = null;
          this.tdNextWaveBtn = null;
          this.resetTdBtn = document.getElementById("resetTdBtn");
          this.tdCanvas = document.getElementById("tdCanvas");
          this.tdStatus = document.getElementById("tdStatus");
          this.tdGoldDisplay = document.getElementById("tdGold");
          this.tdLivesDisplay = document.getElementById("tdLives");
          this.tdWaveDisplay = document.getElementById("tdWave");
          this.tdScoreDisplay = document.getElementById("tdScore");
          this.tdNextWaveBtn = document.getElementById("tdNextWaveBtn");
          this.tdCtx = this.tdCanvas ? this.tdCanvas.getContext("2d") : null;
          this.setupEventListeners();
          this.setupTdTowerButtons();
        }
        setupEventListeners() {
          if (this.tdCanvas) {
            this.tdCanvas.addEventListener("click", (e) => this.handleTdClick(e));
            this.tdCanvas.addEventListener("mousemove", (e) => this.handleTdMouseMove(e));
            this.tdCanvas.addEventListener("mouseleave", () => {
              this.tdHoverCell = null;
            });
          }
          if (this.resetTdBtn) this.resetTdBtn.addEventListener("click", () => this.init());
          if (this.tdNextWaveBtn) this.tdNextWaveBtn.addEventListener("click", () => this.startNextWave());
        }
        init() {
          if (this.tdInterval) clearInterval(this.tdInterval);
          if (!this.tdCanvas || !this.tdCtx) return;
          this.tdGold = 180;
          this.tdLives = 20;
          this.tdScore = 0;
          this.tdWave = 0;
          this.tdEnemies = [];
          this.tdTowers = [];
          this.tdProjectiles = [];
          this.tdParticles = [];
          this.tdSelectedTower = "archer";
          this.tdWaveActive = false;
          this.tdWaveSpawned = 0;
          this.tdWaveToSpawn = 0;
          this.tdSpawnTimer = 0;
          this.tdGameOver = false;
          this.tdWon = false;
          this.updateUi();
          this.draw();
          this.tdInterval = setInterval(() => {
            this.update();
            this.draw();
          }, 16);
        }
        cleanup() {
          if (this.tdInterval) {
            clearInterval(this.tdInterval);
            this.tdInterval = void 0;
          }
        }
        update() {
          if (this.tdGameOver || this.tdWon) return;
          if (this.tdWaveActive && this.tdWaveSpawned < this.tdWaveToSpawn) {
            this.tdSpawnTimer -= 16;
            if (this.tdSpawnTimer <= 0) {
              const wave = this.TD_WAVES[this.tdWave - 1];
              this.spawnEnemy(wave);
              this.tdWaveSpawned++;
              this.tdSpawnTimer = wave.interval;
            }
          }
          if (this.tdWaveActive && this.tdWaveSpawned >= this.tdWaveToSpawn && this.tdEnemies.length === 0) {
            this.tdWaveActive = false;
            if (this.tdWave >= this.TD_WAVES.length) {
              this.tdWon = true;
              this.updateUi();
              return;
            }
            this.updateUi();
          }
          for (let i = this.tdEnemies.length - 1; i >= 0; i--) {
            const enemy = this.tdEnemies[i];
            this.updateEnemy(enemy);
            if (enemy.hp <= 0) {
              this.tdGold += enemy.reward;
              this.tdScore += enemy.reward * 10;
              this.spawnParticles(enemy.x, enemy.y, enemy.color, 8);
              this.tdEnemies.splice(i, 1);
              this.updateUi();
            } else if (enemy.pathIndex >= this.TD_PATH.length) {
              this.tdLives--;
              this.tdEnemies.splice(i, 1);
              this.updateUi();
              if (this.tdLives <= 0) {
                this.tdGameOver = true;
                this.updateUi();
                return;
              }
            }
          }
          for (const tower of this.tdTowers) {
            if (tower.cooldown > 0) tower.cooldown--;
            if (tower.cooldown <= 0) {
              const target = this.findTarget(tower);
              if (target) {
                this.shootProjectile(tower, target);
                tower.cooldown = tower.maxCooldown;
              }
            }
          }
          for (let i = this.tdProjectiles.length - 1; i >= 0; i--) {
            const proj = this.tdProjectiles[i];
            if (this.tdEnemies.indexOf(proj.target) === -1 || proj.target.hp <= 0) {
              this.tdProjectiles.splice(i, 1);
              continue;
            }
            const dx = proj.target.x - proj.x;
            const dy = proj.target.y - proj.y;
            const dist = Math.hypot(dx, dy);
            if (dist <= proj.speed) {
              this.hitEnemy(proj.target, proj);
              this.tdProjectiles.splice(i, 1);
            } else {
              proj.x += dx / dist * proj.speed;
              proj.y += dy / dist * proj.speed;
            }
          }
          for (let i = this.tdParticles.length - 1; i >= 0; i--) {
            const p = this.tdParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.tdParticles.splice(i, 1);
          }
        }
        spawnEnemy(wave) {
          const start = this.TD_PATH[0];
          this.tdEnemies.push({
            x: start.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2,
            y: start.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2,
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
        updateEnemy(enemy) {
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
              this.spawnParticles(enemy.x, enemy.y, "#00ff00", 2);
            }
            enemy.poison--;
          }
          const target = this.TD_PATH[Math.min(enemy.pathIndex + 1, this.TD_PATH.length - 1)];
          const tx = target.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
          const ty = target.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
          const dx = tx - enemy.x;
          const dy = ty - enemy.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= enemy.speed) {
            enemy.x = tx;
            enemy.y = ty;
            enemy.pathIndex++;
          } else {
            enemy.x += dx / dist * enemy.speed;
            enemy.y += dy / dist * enemy.speed;
          }
        }
        findTarget(tower) {
          const tx = tower.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
          const ty = tower.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
          let best = null;
          let bestProgress = -1;
          for (const enemy of this.tdEnemies) {
            const dist = Math.hypot(enemy.x - tx, enemy.y - ty);
            if (dist <= tower.range) {
              const progress = enemy.pathIndex * 1e3 + Math.hypot(enemy.x - tx, enemy.y - ty);
              if (progress > bestProgress) {
                bestProgress = progress;
                best = enemy;
              }
            }
          }
          return best;
        }
        shootProjectile(tower, target) {
          const tx = tower.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
          const ty = tower.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
          const type = tower.type === "archer" ? "arrow" : tower.type === "fire" ? "fireball" : tower.type;
          this.tdProjectiles.push({
            x: tx,
            y: ty,
            target,
            type,
            damage: tower.damage,
            speed: type === "lightning" ? 15 : 8,
            splash: tower.type === "fire" ? 60 : void 0,
            chain: tower.type === "lightning" ? 3 : void 0,
            chainHits: 0
          });
        }
        hitEnemy(enemy, proj) {
          if (proj.type === "fireball" && proj.splash) {
            for (const e of this.tdEnemies) {
              const dist = Math.hypot(e.x - enemy.x, e.y - enemy.y);
              if (dist <= proj.splash) {
                e.hp -= Math.round(proj.damage * (1 - dist / proj.splash));
                if (e !== enemy) this.spawnParticles(e.x, e.y, "#ff6600", 3);
              }
            }
            this.spawnParticles(enemy.x, enemy.y, "#ff6600", 12);
          } else if (proj.type === "ice") {
            enemy.hp -= proj.damage;
            enemy.frozen = 60;
            this.spawnParticles(enemy.x, enemy.y, "#00ccff", 6);
          } else if (proj.type === "lightning") {
            this.chainLightning(enemy, proj);
          } else {
            enemy.hp -= proj.damage;
            this.spawnParticles(enemy.x, enemy.y, "#ffff00", 4);
          }
        }
        chainLightning(first, proj) {
          let current = first;
          const hit = /* @__PURE__ */ new Set();
          let damage = proj.damage;
          while (current && proj.chain && hit.size < proj.chain) {
            current.hp -= damage;
            hit.add(current);
            this.spawnParticles(current.x, current.y, "#cc00ff", 5);
            damage = Math.round(damage * 0.7);
            let next = null;
            let bestDist = 100;
            for (const e of this.tdEnemies) {
              if (!hit.has(e)) {
                const dist = Math.hypot(e.x - current.x, e.y - current.y);
                if (dist < bestDist) {
                  bestDist = dist;
                  next = e;
                }
              }
            }
            current = next;
          }
        }
        spawnParticles(x, y, color, count) {
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            this.tdParticles.push({
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
        draw() {
          if (!this.tdCtx || !this.tdCanvas) return;
          this.tdCtx.fillStyle = "#1a2a1a";
          this.tdCtx.fillRect(0, 0, this.TD_WIDTH, this.TD_HEIGHT);
          this.tdCtx.strokeStyle = "rgba(255,255,255,0.05)";
          this.tdCtx.lineWidth = 1;
          for (let c = 0; c <= this.TD_COLS; c++) {
            this.tdCtx.beginPath();
            this.tdCtx.moveTo(c * this.TD_CELL_SIZE, 0);
            this.tdCtx.lineTo(c * this.TD_CELL_SIZE, this.TD_HEIGHT);
            this.tdCtx.stroke();
          }
          for (let r = 0; r <= this.TD_ROWS; r++) {
            this.tdCtx.beginPath();
            this.tdCtx.moveTo(0, r * this.TD_CELL_SIZE);
            this.tdCtx.lineTo(this.TD_WIDTH, r * this.TD_CELL_SIZE);
            this.tdCtx.stroke();
          }
          this.tdCtx.fillStyle = "rgba(139, 90, 43, 0.6)";
          for (let i = 0; i < this.TD_PATH.length; i++) {
            const wp = this.TD_PATH[i];
            this.tdCtx.fillRect(wp.c * this.TD_CELL_SIZE, wp.r * this.TD_CELL_SIZE, this.TD_CELL_SIZE, this.TD_CELL_SIZE);
            if (i < this.TD_PATH.length - 1) {
              const next = this.TD_PATH[i + 1];
              const minC = Math.min(wp.c, next.c);
              const maxC = Math.max(wp.c, next.c);
              const minR = Math.min(wp.r, next.r);
              const maxR = Math.max(wp.r, next.r);
              for (let c = minC; c <= maxC; c++) {
                for (let r = minR; r <= maxR; r++) {
                  this.tdCtx.fillRect(c * this.TD_CELL_SIZE, r * this.TD_CELL_SIZE, this.TD_CELL_SIZE, this.TD_CELL_SIZE);
                }
              }
            }
          }
          if (this.TD_PATH.length > 0) {
            const start = this.TD_PATH[0];
            const end = this.TD_PATH[this.TD_PATH.length - 1];
            this.tdCtx.fillStyle = "#2ecc71";
            this.tdCtx.font = "14px sans-serif";
            this.tdCtx.textAlign = "center";
            this.tdCtx.fillText("START", start.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2, start.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2 + 5);
            this.tdCtx.fillStyle = "#e74c3c";
            this.tdCtx.fillText("END", end.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2, end.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2 + 5);
          }
          if (this.tdHoverCell && !this.tdGameOver && !this.tdWon) {
            const data = this.TD_TOWER_DATA[this.tdSelectedTower];
            const cx = this.tdHoverCell.c * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
            const cy = this.tdHoverCell.r * this.TD_CELL_SIZE + this.TD_CELL_SIZE / 2;
            const canPlace = this.canPlaceTower(this.tdHoverCell.c, this.tdHoverCell.r) && this.tdGold >= data.cost;
            this.tdCtx.fillStyle = canPlace ? "rgba(40, 167, 69, 0.3)" : "rgba(231, 76, 60, 0.3)";
            this.tdCtx.fillRect(this.tdHoverCell.c * this.TD_CELL_SIZE, this.tdHoverCell.r * this.TD_CELL_SIZE, this.TD_CELL_SIZE, this.TD_CELL_SIZE);
            this.tdCtx.strokeStyle = canPlace ? "#28a745" : "#e74c3c";
            this.tdCtx.beginPath();
            this.tdCtx.arc(cx, cy, data.range, 0, Math.PI * 2);
            this.tdCtx.stroke();
          }
          for (const tower of this.tdTowers) {
            this.drawTower(tower);
          }
          for (const enemy of this.tdEnemies) {
            this.drawEnemy(enemy);
          }
          for (const proj of this.tdProjectiles) {
            this.tdCtx.fillStyle = proj.type === "arrow" ? "#ffff00" : proj.type === "fireball" ? "#ff6600" : proj.type === "ice" ? "#00ccff" : "#cc00ff";
            this.tdCtx.beginPath();
            this.tdCtx.arc(proj.x, proj.y, proj.type === "arrow" ? 3 : 5, 0, Math.PI * 2);
            this.tdCtx.fill();
          }
          for (const p of this.tdParticles) {
            this.tdCtx.globalAlpha = p.life / p.maxLife;
            this.tdCtx.fillStyle = p.color;
            this.tdCtx.beginPath();
            this.tdCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.tdCtx.fill();
          }
          this.tdCtx.globalAlpha = 1;
          if (this.tdGameOver || this.tdWon) {
            this.tdCtx.fillStyle = "rgba(0,0,0,0.7)";
            this.tdCtx.fillRect(0, 0, this.TD_WIDTH, this.TD_HEIGHT);
            this.tdCtx.fillStyle = this.tdWon ? "#2ecc71" : "#e74c3c";
            this.tdCtx.font = "bold 36px sans-serif";
            this.tdCtx.textAlign = "center";
            this.tdCtx.fillText(this.tdWon ? "SIEG!" : "GAME OVER", this.TD_WIDTH / 2, this.TD_HEIGHT / 2);
            this.tdCtx.font = "18px sans-serif";
            this.tdCtx.fillStyle = "#fff";
            this.tdCtx.fillText(`Punkte: ${this.tdScore}`, this.TD_WIDTH / 2, this.TD_HEIGHT / 2 + 30);
          }
        }
        drawTower(tower) {
          if (!this.tdCtx) return;
          const x = tower.c * this.TD_CELL_SIZE;
          const y = tower.r * this.TD_CELL_SIZE;
          const data = this.TD_TOWER_DATA[tower.type];
          this.tdCtx.fillStyle = data.color;
          this.tdCtx.fillRect(x + 4, y + 4, this.TD_CELL_SIZE - 8, this.TD_CELL_SIZE - 8);
          this.tdCtx.strokeStyle = "#fff";
          this.tdCtx.lineWidth = 2;
          this.tdCtx.strokeRect(x + 4, y + 4, this.TD_CELL_SIZE - 8, this.TD_CELL_SIZE - 8);
          this.tdCtx.fillStyle = "#fff";
          for (let i = 0; i < tower.level; i++) {
            this.tdCtx.beginPath();
            this.tdCtx.arc(x + 10 + i * 8, y + 10, 2, 0, Math.PI * 2);
            this.tdCtx.fill();
          }
          this.tdCtx.fillStyle = "#fff";
          this.tdCtx.font = "bold 16px sans-serif";
          this.tdCtx.textAlign = "center";
          let symbol = "A";
          if (tower.type === "fire") symbol = "F";
          if (tower.type === "ice") symbol = "I";
          if (tower.type === "lightning") symbol = "L";
          this.tdCtx.fillText(symbol, x + this.TD_CELL_SIZE / 2, y + this.TD_CELL_SIZE / 2 + 6);
        }
        drawEnemy(enemy) {
          if (!this.tdCtx) return;
          this.tdCtx.fillStyle = enemy.color;
          this.tdCtx.beginPath();
          this.tdCtx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
          this.tdCtx.fill();
          this.tdCtx.strokeStyle = "#000";
          this.tdCtx.lineWidth = 1;
          this.tdCtx.stroke();
          const barW = enemy.radius * 2;
          const barH = 4;
          const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
          this.tdCtx.fillStyle = "#000";
          this.tdCtx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 8, barW, barH);
          this.tdCtx.fillStyle = hpPct > 0.5 ? "#2ecc71" : hpPct > 0.25 ? "#f1c40f" : "#e74c3c";
          this.tdCtx.fillRect(enemy.x - barW / 2, enemy.y - enemy.radius - 8, barW * hpPct, barH);
          if (enemy.frozen > 0) {
            this.tdCtx.strokeStyle = "#00ccff";
            this.tdCtx.beginPath();
            this.tdCtx.arc(enemy.x, enemy.y, enemy.radius + 4, 0, Math.PI * 2);
            this.tdCtx.stroke();
          }
        }
        isPathCell(c, r) {
          for (let i = 0; i < this.TD_PATH.length - 1; i++) {
            const a = this.TD_PATH[i];
            const b = this.TD_PATH[i + 1];
            const minC = Math.min(a.c, b.c);
            const maxC = Math.max(a.c, b.c);
            const minR = Math.min(a.r, b.r);
            const maxR = Math.max(a.r, b.r);
            if (c >= minC && c <= maxC && r >= minR && r <= maxR) return true;
          }
          return false;
        }
        canPlaceTower(c, r) {
          if (c < 0 || c >= this.TD_COLS || r < 0 || r >= this.TD_ROWS) return false;
          if (this.isPathCell(c, r)) return false;
          for (const tower of this.tdTowers) {
            if (tower.c === c && tower.r === r) return false;
          }
          return true;
        }
        handleTdClick(e) {
          if (this.tdGameOver || this.tdWon || !this.tdCanvas) return;
          const rect = this.tdCanvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const c = Math.floor(x / this.TD_CELL_SIZE);
          const r = Math.floor(y / this.TD_CELL_SIZE);
          if (this.canPlaceTower(c, r)) {
            const data = this.TD_TOWER_DATA[this.tdSelectedTower];
            if (this.tdGold >= data.cost) {
              this.tdGold -= data.cost;
              this.tdTowers.push({
                c,
                r,
                type: this.tdSelectedTower,
                level: 1,
                cooldown: 0,
                maxCooldown: data.cooldown,
                range: data.range,
                damage: data.damage
              });
              this.updateUi();
            }
          }
        }
        handleTdMouseMove(e) {
          if (!this.tdCanvas) return;
          const rect = this.tdCanvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const c = Math.floor(x / this.TD_CELL_SIZE);
          const r = Math.floor(y / this.TD_CELL_SIZE);
          if (c >= 0 && c < this.TD_COLS && r >= 0 && r < this.TD_ROWS) {
            this.tdHoverCell = { c, r };
          } else {
            this.tdHoverCell = null;
          }
        }
        startNextWave() {
          if (this.tdWaveActive || this.tdGameOver || this.tdWon) return;
          if (this.tdWave < this.TD_WAVES.length) {
            this.tdWave++;
            this.tdWaveActive = true;
            this.tdWaveSpawned = 0;
            this.tdWaveToSpawn = this.TD_WAVES[this.tdWave - 1].count;
            this.tdSpawnTimer = 0;
            this.updateUi();
          }
        }
        updateUi() {
          if (this.tdGoldDisplay) this.tdGoldDisplay.textContent = String(this.tdGold);
          if (this.tdLivesDisplay) this.tdLivesDisplay.textContent = String(this.tdLives);
          if (this.tdWaveDisplay) this.tdWaveDisplay.textContent = `${this.tdWave}/${this.TD_WAVES.length}`;
          if (this.tdScoreDisplay) this.tdScoreDisplay.textContent = String(this.tdScore);
          if (this.tdStatus) {
            if (this.tdWon) {
              this.tdStatus.textContent = `\u{1F389} Sieg! Punkte: ${this.tdScore}`;
            } else if (this.tdGameOver) {
              this.tdStatus.textContent = "\u{1F480} Game Over!";
            } else if (this.tdWaveActive) {
              this.tdStatus.textContent = `Welle ${this.tdWave} l\xE4uft...`;
            } else if (this.tdWave >= this.TD_WAVES.length) {
              this.tdStatus.textContent = "Alle Wellen geschafft!";
            } else {
              this.tdStatus.textContent = "Baue T\xFCrme und starte die n\xE4chste Welle!";
            }
          }
          if (this.tdNextWaveBtn) {
            this.tdNextWaveBtn.disabled = this.tdWaveActive || this.tdGameOver || this.tdWon || this.tdWave >= this.TD_WAVES.length;
          }
        }
        setupTdTowerButtons() {
          const types = ["archer", "fire", "ice", "lightning"];
          for (const type of types) {
            const btn = document.getElementById(`tdTower${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (btn) {
              btn.addEventListener("click", () => {
                this.tdSelectedTower = type;
                document.querySelectorAll(".td-tower-btn").forEach((b) => b.classList.remove("selected"));
                btn.classList.add("selected");
              });
            }
          }
        }
      };
    }
  });

  // src/games/PacmanGame.ts
  var PacmanGame;
  var init_PacmanGame = __esm({
    "src/games/PacmanGame.ts"() {
      "use strict";
      PacmanGame = class {
        constructor() {
          this.id = "pacman";
          this.PM_COLS = 28;
          this.PM_ROWS = 31;
          this.PM_CELL = 16;
          this.PM_SPEED = 2;
          this.PM_GHOST_SPEED = 1;
          this.PM_FRIGHTENED_DURATION = 8e3;
          this.PM_FRIGHTENED_SPEED = 1;
          this.PM_MAZE_TEMPLATE = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
            [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
            [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
            [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 4, 4, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
            [1, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 1],
            [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
            [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
            [1, 3, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 3, 1],
            [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
            [1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
          ];
          this.pmMaze = [];
          this.pmPacman = { x: 0, y: 0, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouthAngle: 0, mouthOpening: true };
          this.pmGhosts = [];
          this.pmScore = 0;
          this.pmLives = 3;
          this.pmGameOver = false;
          this.pmWon = false;
          this.pmFrightenedTimer = 0;
          this.pmTotalPellets = 0;
          this.pmAnimFrame = 0;
          this.resetPacmanBtn = null;
          this.pacmanCanvas = null;
          this.pacmanStatus = null;
          this.resetPacmanBtn = document.getElementById("resetPacmanBtn");
          this.pacmanCanvas = document.getElementById("pacmanCanvas");
          this.pacmanStatus = document.getElementById("pacmanStatus");
          this.setupEventListeners();
          this.setupMobileControls();
        }
        setupEventListeners() {
          if (this.resetPacmanBtn) {
            this.resetPacmanBtn.addEventListener("click", () => this.init());
          }
        }
        init() {
          if (this.pacmanInterval) clearInterval(this.pacmanInterval);
          this.pmMaze = this.PM_MAZE_TEMPLATE.map((row) => [...row]);
          this.pmScore = 0;
          this.pmLives = 3;
          this.pmGameOver = false;
          this.pmWon = false;
          this.pmFrightenedTimer = 0;
          this.pmAnimFrame = 0;
          this.pmTotalPellets = 0;
          for (let r = 0; r < this.PM_ROWS; r++) {
            for (let c = 0; c < this.PM_COLS; c++) {
              if (this.pmMaze[r][c] === 2 || this.pmMaze[r][c] === 3) this.pmTotalPellets++;
            }
          }
          this.resetPositions();
          this.updateStatus();
          this.pacmanInterval = setInterval(() => this.update(), 1e3 / 60);
        }
        cleanup() {
          if (this.pacmanInterval) {
            clearInterval(this.pacmanInterval);
            this.pacmanInterval = void 0;
          }
        }
        handleKey(e) {
          switch (e.key) {
            case "ArrowUp":
            case "w":
            case "W":
              this.pmPacman.nextDir = { x: 0, y: -1 };
              e.preventDefault();
              break;
            case "ArrowDown":
            case "s":
            case "S":
              this.pmPacman.nextDir = { x: 0, y: 1 };
              e.preventDefault();
              break;
            case "ArrowLeft":
            case "a":
            case "A":
              this.pmPacman.nextDir = { x: -1, y: 0 };
              e.preventDefault();
              break;
            case "ArrowRight":
            case "d":
            case "D":
              this.pmPacman.nextDir = { x: 1, y: 0 };
              e.preventDefault();
              break;
          }
        }
        resetPositions() {
          this.pmPacman = {
            x: 14 * this.PM_CELL,
            y: 23 * this.PM_CELL,
            dir: { x: 0, y: 0 },
            nextDir: { x: 0, y: 0 },
            mouthAngle: 0,
            mouthOpening: true
          };
          const ghostColors = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"];
          const ghostStartPositions = [
            { x: 14, y: 11 },
            { x: 13, y: 14 },
            { x: 14, y: 14 },
            { x: 15, y: 14 }
          ];
          this.pmGhosts = ghostColors.map((color, i) => ({
            x: ghostStartPositions[i].x * this.PM_CELL,
            y: ghostStartPositions[i].y * this.PM_CELL,
            dir: { x: 0, y: -1 },
            color,
            mode: i === 0 ? "chase" : "scatter",
            target: { x: 0, y: 0 },
            inHouse: i > 0,
            houseTimer: i * 120
          }));
        }
        update() {
          if (this.pmGameOver || this.pmWon) return;
          this.pmAnimFrame++;
          this.updatePacmanPosition();
          this.pmGhosts.forEach((ghost, i) => this.updateGhost(ghost, i));
          this.checkCollisions();
          if (this.pmFrightenedTimer > 0) {
            this.pmFrightenedTimer--;
            if (this.pmFrightenedTimer <= 0) {
              this.pmGhosts.forEach((g) => {
                if (g.mode === "frightened") g.mode = "chase";
              });
            }
          }
          this.draw();
        }
        updatePacmanPosition() {
          const p = this.pmPacman;
          const gridX = Math.round(p.x / this.PM_CELL) * this.PM_CELL;
          const gridY = Math.round(p.y / this.PM_CELL) * this.PM_CELL;
          const aligned = Math.abs(p.x - gridX) < this.PM_SPEED && Math.abs(p.y - gridY) < this.PM_SPEED;
          if (aligned) {
            p.x = gridX;
            p.y = gridY;
            const nextCol = Math.round(p.x / this.PM_CELL) + p.nextDir.x;
            const nextRow = Math.round(p.y / this.PM_CELL) + p.nextDir.y;
            if (nextCol >= 0 && nextCol < this.PM_COLS && nextRow >= 0 && nextRow < this.PM_ROWS) {
              if (this.pmMaze[nextRow][nextCol] !== 1 && this.pmMaze[nextRow][nextCol] !== 4) {
                p.dir = __spreadValues({}, p.nextDir);
              }
            }
            const curCol = Math.round(p.x / this.PM_CELL) + p.dir.x;
            const curRow = Math.round(p.y / this.PM_CELL) + p.dir.y;
            if (curCol < 0 || curCol >= this.PM_COLS || curRow < 0 || curRow >= this.PM_ROWS || this.pmMaze[curRow][curCol] === 1 || this.pmMaze[curRow][curCol] === 4) {
              p.dir = { x: 0, y: 0 };
            }
          }
          p.x += p.dir.x * this.PM_SPEED;
          p.y += p.dir.y * this.PM_SPEED;
          if (p.x < -this.PM_CELL) p.x = this.PM_COLS * this.PM_CELL;
          if (p.x > this.PM_COLS * this.PM_CELL) p.x = -this.PM_CELL;
          const col = Math.round(p.x / this.PM_CELL);
          const row = Math.round(p.y / this.PM_CELL);
          if (col >= 0 && col < this.PM_COLS && row >= 0 && row < this.PM_ROWS) {
            if (this.pmMaze[row][col] === 2) {
              this.pmMaze[row][col] = 0;
              this.pmScore += 10;
            } else if (this.pmMaze[row][col] === 3) {
              this.pmMaze[row][col] = 0;
              this.pmScore += 50;
              this.pmFrightenedTimer = this.PM_FRIGHTENED_DURATION / (1e3 / 60);
              this.pmGhosts.forEach((g) => {
                if (g.mode !== "eaten") {
                  g.mode = "frightened";
                  g.dir = { x: -g.dir.x, y: -g.dir.y };
                }
              });
            }
          }
          let pelletsLeft = 0;
          for (let r = 0; r < this.PM_ROWS; r++) {
            for (let c = 0; c < this.PM_COLS; c++) {
              if (this.pmMaze[r][c] === 2 || this.pmMaze[r][c] === 3) pelletsLeft++;
            }
          }
          if (pelletsLeft === 0) {
            this.pmWon = true;
            if (this.pacmanStatus) this.pacmanStatus.textContent = "\u{1F389} Gewonnen! Alle Pellets gesammelt!";
          }
          if (this.pmAnimFrame % 4 === 0) {
            p.mouthOpening = !p.mouthOpening;
          }
          this.updateStatus();
        }
        updateGhost(ghost, _index) {
          if (ghost.inHouse) {
            ghost.houseTimer--;
            if (ghost.houseTimer <= 0) {
              ghost.inHouse = false;
              ghost.x = 14 * this.PM_CELL;
              ghost.y = 11 * this.PM_CELL;
              ghost.dir = { x: -1, y: 0 };
            }
            return;
          }
          const speed = ghost.mode === "frightened" ? this.PM_FRIGHTENED_SPEED : this.PM_GHOST_SPEED;
          const gridX = Math.round(ghost.x / this.PM_CELL) * this.PM_CELL;
          const gridY = Math.round(ghost.y / this.PM_CELL) * this.PM_CELL;
          const aligned = Math.abs(ghost.x - gridX) < speed && Math.abs(ghost.y - gridY) < speed;
          if (aligned) {
            ghost.x = gridX;
            ghost.y = gridY;
            const col = Math.round(ghost.x / this.PM_CELL);
            const row = Math.round(ghost.y / this.PM_CELL);
            const dirs = [
              { x: 0, y: -1 },
              { x: 0, y: 1 },
              { x: -1, y: 0 },
              { x: 1, y: 0 }
            ];
            const validDirs = dirs.filter((d) => {
              if (d.x === -ghost.dir.x && d.y === -ghost.dir.y && ghost.mode !== "frightened") return false;
              const nc = col + d.x;
              const nr = row + d.y;
              if (nc < 0 || nc >= this.PM_COLS || nr < 0 || nr >= this.PM_ROWS) return true;
              return this.pmMaze[nr][nc] !== 1;
            });
            if (validDirs.length > 0) {
              if (ghost.mode === "frightened") {
                ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
              } else {
                let bestDir = validDirs[0];
                let bestDist = Infinity;
                validDirs.forEach((d) => {
                  const nc = col + d.x;
                  const nr = row + d.y;
                  const dist = Math.abs(nc - Math.round(this.pmPacman.x / this.PM_CELL)) + Math.abs(nr - Math.round(this.pmPacman.y / this.PM_CELL));
                  if (dist < bestDist) {
                    bestDist = dist;
                    bestDir = d;
                  }
                });
                if (Math.random() < 0.3) {
                  ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                } else {
                  ghost.dir = bestDir;
                }
              }
            }
          }
          ghost.x += ghost.dir.x * speed;
          ghost.y += ghost.dir.y * speed;
          if (ghost.x < -this.PM_CELL) ghost.x = this.PM_COLS * this.PM_CELL;
          if (ghost.x > this.PM_COLS * this.PM_CELL) ghost.x = -this.PM_CELL;
        }
        checkCollisions() {
          const p = this.pmPacman;
          this.pmGhosts.forEach((ghost) => {
            if (ghost.inHouse) return;
            const dist = Math.sqrt(Math.pow(p.x - ghost.x, 2) + Math.pow(p.y - ghost.y, 2));
            if (dist < this.PM_CELL) {
              if (ghost.mode === "frightened") {
                ghost.mode = "eaten";
                ghost.x = 14 * this.PM_CELL;
                ghost.y = 14 * this.PM_CELL;
                ghost.inHouse = true;
                ghost.houseTimer = 60;
                this.pmScore += 200;
              } else if (ghost.mode !== "eaten") {
                this.pmLives--;
                if (this.pmLives <= 0) {
                  this.pmGameOver = true;
                  if (this.pacmanStatus) this.pacmanStatus.textContent = `\u{1F480} Game Over! Punkte: ${this.pmScore}`;
                } else {
                  this.resetPositions();
                  if (this.pacmanStatus) this.pacmanStatus.textContent = `Punkte: ${this.pmScore} | Leben: ${this.pmLives}`;
                }
              }
            }
          });
        }
        draw() {
          if (!this.pacmanCanvas || !this.pacmanCanvas.getContext) return;
          const ctx = this.pacmanCanvas.getContext("2d");
          if (!ctx) return;
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, this.pacmanCanvas.width, this.pacmanCanvas.height);
          for (let r = 0; r < this.PM_ROWS; r++) {
            for (let c = 0; c < this.PM_COLS; c++) {
              const tile = this.pmMaze[r][c];
              const x = c * this.PM_CELL;
              const y = r * this.PM_CELL;
              if (tile === 1) {
                ctx.fillStyle = "#2121de";
                ctx.fillRect(x, y, this.PM_CELL, this.PM_CELL);
                ctx.fillStyle = "#000";
                ctx.fillRect(x + 2, y + 2, this.PM_CELL - 4, this.PM_CELL - 4);
                ctx.strokeStyle = "#2121de";
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, this.PM_CELL - 4, this.PM_CELL - 4);
              } else if (tile === 2) {
                ctx.fillStyle = "#ffb8ae";
                ctx.beginPath();
                ctx.arc(x + this.PM_CELL / 2, y + this.PM_CELL / 2, 2, 0, Math.PI * 2);
                ctx.fill();
              } else if (tile === 3) {
                if (this.pmAnimFrame % 20 < 10) {
                  ctx.fillStyle = "#ffb8ae";
                  ctx.beginPath();
                  ctx.arc(x + this.PM_CELL / 2, y + this.PM_CELL / 2, 6, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (tile === 4) {
                ctx.fillStyle = "#000";
                ctx.fillRect(x, y, this.PM_CELL, this.PM_CELL);
              }
            }
          }
          const p = this.pmPacman;
          const px = p.x + this.PM_CELL / 2;
          const py = p.y + this.PM_CELL / 2;
          const mouthAngle = p.mouthOpening ? 0.3 : 0.05;
          let rotation = 0;
          if (p.dir.x === 1) rotation = 0;
          else if (p.dir.x === -1) rotation = Math.PI;
          else if (p.dir.y === -1) rotation = -Math.PI / 2;
          else if (p.dir.y === 1) rotation = Math.PI / 2;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(rotation);
          ctx.fillStyle = "#ffff00";
          ctx.beginPath();
          ctx.arc(0, 0, this.PM_CELL / 2 - 1, mouthAngle, Math.PI * 2 - mouthAngle);
          ctx.lineTo(0, 0);
          ctx.fill();
          ctx.restore();
          this.pmGhosts.forEach((ghost) => {
            const gx = ghost.x + this.PM_CELL / 2;
            const gy = ghost.y + this.PM_CELL / 2;
            let color = ghost.color;
            if (ghost.mode === "frightened") {
              color = this.pmFrightenedTimer < 120 && this.pmAnimFrame % 10 < 5 ? "#fff" : "#2121de";
            } else if (ghost.mode === "eaten") {
              color = "#333";
            }
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(gx, gy - 2, this.PM_CELL / 2 - 1, Math.PI, 0);
            ctx.lineTo(gx + this.PM_CELL / 2 - 1, gy + this.PM_CELL / 2 - 1);
            for (let i = 0; i < 3; i++) {
              const wx = gx + this.PM_CELL / 2 - 1 - (i + 1) * (this.PM_CELL - 2) / 3;
              const wy = gy + this.PM_CELL / 2 - 1 + (i % 2 === 0 ? -3 : 0);
              ctx.lineTo(wx, wy);
            }
            ctx.fill();
            if (ghost.mode !== "eaten") {
              ctx.fillStyle = "#fff";
              ctx.beginPath();
              ctx.arc(gx - 3, gy - 3, 3, 0, Math.PI * 2);
              ctx.arc(gx + 3, gy - 3, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#00f";
              ctx.beginPath();
              ctx.arc(gx - 2 + ghost.dir.x * 1.5, gy - 3 + ghost.dir.y * 1.5, 1.5, 0, Math.PI * 2);
              ctx.arc(gx + 4 + ghost.dir.x * 1.5, gy - 3 + ghost.dir.y * 1.5, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
        updateStatus() {
          if (this.pacmanStatus && !this.pmGameOver && !this.pmWon) {
            this.pacmanStatus.textContent = `Punkte: ${this.pmScore} | Leben: ${this.pmLives}`;
          }
        }
        setupMobileControls() {
          const btnUp = document.getElementById("pacmanBtnUp");
          const btnDown = document.getElementById("pacmanBtnDown");
          const btnLeft = document.getElementById("pacmanBtnLeft");
          const btnRight = document.getElementById("pacmanBtnRight");
          if (btnUp) btnUp.addEventListener("click", () => {
            this.pmPacman.nextDir = { x: 0, y: -1 };
          });
          if (btnDown) btnDown.addEventListener("click", () => {
            this.pmPacman.nextDir = { x: 0, y: 1 };
          });
          if (btnLeft) btnLeft.addEventListener("click", () => {
            this.pmPacman.nextDir = { x: -1, y: 0 };
          });
          if (btnRight) btnRight.addEventListener("click", () => {
            this.pmPacman.nextDir = { x: 1, y: 0 };
          });
        }
      };
    }
  });

  // src/GameRegistry.ts
  var GameRegistry;
  var init_GameRegistry = __esm({
    "src/GameRegistry.ts"() {
      "use strict";
      init_ConnectFourGame();
      init_MinesweeperGame();
      init_TetrisGame();
      init_SnakeGame();
      init_PongGame();
      init_SpaceInvadersGame();
      init_BreakoutGame();
      init_BoulderDashGame();
      init_TowerDefenseGame();
      init_PacmanGame();
      GameRegistry = class {
        constructor() {
          this.activeGameId = null;
          this.games = /* @__PURE__ */ new Map([
            ["fourWins", new ConnectFourGame()],
            ["minesweeper", new MinesweeperGame()],
            ["tetris", new TetrisGame()],
            ["snake", new SnakeGame()],
            ["pong", new PongGame()],
            ["spaceInvaders", new SpaceInvadersGame()],
            ["breakout", new BreakoutGame()],
            ["boulderDash", new BoulderDashGame()],
            ["towerDefense", new TowerDefenseGame()],
            ["pacman", new PacmanGame()]
          ]);
          this.setupGameSwitching();
          this.setupKeyboardHandler();
        }
        getActiveGame() {
          if (!this.activeGameId) return null;
          return this.games.get(this.activeGameId) || null;
        }
        setupGameSwitching() {
          const gameIds = [
            "fourWins",
            "minesweeper",
            "tetris",
            "snake",
            "pong",
            "spaceInvaders",
            "breakout",
            "boulderDash",
            "towerDefense",
            "pacman"
          ];
          for (const gameId of gameIds) {
            const btn = document.getElementById(`btn${this.getPascalCase(gameId)}`);
            if (btn) {
              btn.addEventListener("click", () => this.switchGame(gameId));
            }
          }
        }
        getPascalCase(gameId) {
          const map = {
            "fourWins": "FourWins",
            "minesweeper": "Minesweeper",
            "tetris": "Tetris",
            "snake": "Snake",
            "pong": "Pong",
            "spaceInvaders": "SpaceInvaders",
            "breakout": "Breakout",
            "boulderDash": "BoulderDash",
            "towerDefense": "TowerDefense",
            "pacman": "Pacman"
          };
          return map[gameId];
        }
        getContainerId(gameId) {
          const map = {
            "fourWins": "fourWinsContainer",
            "minesweeper": "minesweeperContainer",
            "tetris": "tetrisContainer",
            "snake": "snakeContainer",
            "pong": "pongContainer",
            "spaceInvaders": "spaceInvadersContainer",
            "breakout": "breakoutContainer",
            "boulderDash": "boulderDashContainer",
            "towerDefense": "tdContainer",
            "pacman": "pacmanContainer"
          };
          return map[gameId];
        }
        getButtonId(gameId) {
          const map = {
            "fourWins": "btnFourWins",
            "minesweeper": "btnMinesweeper",
            "tetris": "btnTetris",
            "snake": "btnSnake",
            "pong": "btnPong",
            "spaceInvaders": "btnSpaceInvaders",
            "breakout": "btnBreakout",
            "boulderDash": "btnBoulderDash",
            "towerDefense": "btnTowerDefense",
            "pacman": "btnPacman"
          };
          return map[gameId];
        }
        switchGame(gameId) {
          if (this.activeGameId && this.activeGameId !== gameId) {
            const currentGame = this.games.get(this.activeGameId);
            if (currentGame) {
              currentGame.cleanup();
            }
          }
          const containers = document.querySelectorAll(".game-container");
          containers.forEach((c) => c.style.display = "none");
          const buttons = document.querySelectorAll(".game-grid-btn");
          buttons.forEach((b) => b.classList.remove("active"));
          const containerId = this.getContainerId(gameId);
          const container = document.getElementById(containerId);
          if (container) {
            container.style.display = "block";
          }
          const btnId = this.getButtonId(gameId);
          const btn = document.getElementById(btnId);
          if (btn) {
            btn.classList.add("active");
          }
          this.activeGameId = gameId;
          const game = this.games.get(gameId);
          if (game) {
            game.init();
          }
        }
        setupKeyboardHandler() {
          document.addEventListener("keydown", (e) => {
            if (!this.activeGameId) return;
            const containerId = this.getContainerId(this.activeGameId);
            const container = document.getElementById(containerId);
            if (!container || container.style.display === "none") return;
            switch (this.activeGameId) {
              case "tetris":
                this.getActiveGame().handleKey(e);
                break;
              case "snake":
                this.getActiveGame().handleKey(e);
                break;
              case "pong":
                this.getActiveGame().handleKeyDown(e);
                break;
              case "spaceInvaders":
                this.getActiveGame().handleKeyDown(e);
                break;
              case "breakout":
                this.getActiveGame().handleKeyDown(e);
                break;
              case "boulderDash":
                this.getActiveGame().handleKey(e);
                break;
              case "pacman":
                this.getActiveGame().handleKey(e);
                break;
            }
          });
          document.addEventListener("keyup", (e) => {
            if (!this.activeGameId) return;
            const containerId = this.getContainerId(this.activeGameId);
            const container = document.getElementById(containerId);
            if (!container || container.style.display === "none") return;
            switch (this.activeGameId) {
              case "pong":
                this.getActiveGame().handleKeyUp(e);
                break;
              case "spaceInvaders":
                this.getActiveGame().handleKeyUp(e);
                break;
              case "breakout":
                this.getActiveGame().handleKeyUp(e);
                break;
            }
          });
        }
        initDefault() {
          this.switchGame("fourWins");
        }
      };
    }
  });

  // src/main.ts
  var require_main = __commonJS({
    "src/main.ts"() {
      init_GameRegistry();
      var registry = null;
      document.addEventListener("DOMContentLoaded", () => {
        registry = new GameRegistry();
        registry.initDefault();
      });
    }
  });
  require_main();
})();
//# sourceMappingURL=script.js.map

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
          // =============================================
          // AI Implementation (Minimax + Alpha-Beta + Heuristik)
          // =============================================
          /** Transpositionstabelle – wird pro getBestMove-Aufruf neu angelegt. */
          this.transpositionTable = /* @__PURE__ */ new Map();
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
        /**
         * Schwierigkeitsgrad → Suchtiefe.
         *  1 = Leicht (Tiefe 2, mit Zufall)
         *  2 = Mittel (Tiefe 4)
         *  3 = Schwer (Tiefe 6)
         *  4 = Extrem (Tiefe 8, mit Transpositionstabelle)
         */
        getSearchDepth() {
          switch (this.difficulty) {
            case 1:
              return 2;
            case 2:
              return 4;
            case 3:
              return 6;
            case 4:
              return 8;
            default:
              return 4;
          }
        }
        /**
         * Gibt die beste Spalte zurück.
         * Reihenfolge: Sofortgewinn → Block → Minimax.
         */
        getBestMove() {
          this.transpositionTable.clear();
          const availableCols = this.getAvailableCols(this.board);
          if (availableCols.length === 0) return -1;
          for (const col of availableCols) {
            const tempBoard = this.board.map((row) => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
            if (this.checkWin(tempBoard, this.PLAYER2)) return col;
          }
          for (const col of availableCols) {
            const tempBoard = this.board.map((row) => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER1);
            if (this.checkWin(tempBoard, this.PLAYER1)) return col;
          }
          const depth = this.getSearchDepth();
          let bestScore = -Infinity;
          let bestMoves = [];
          const orderedCols = this.orderColumns(availableCols);
          for (const col of orderedCols) {
            const tempBoard = this.board.map((row) => [...row]);
            this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
            const score = this.minimax(tempBoard, depth, -Infinity, Infinity, false);
            if (score > bestScore) {
              bestScore = score;
              bestMoves = [col];
            } else if (score === bestScore) {
              bestMoves.push(col);
            }
          }
          if (this.difficulty === 1 && Math.random() < 0.4) {
            return availableCols[Math.floor(Math.random() * availableCols.length)];
          }
          return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
        /**
         * Spalten in der Reihenfolge „Mitte zuerst" sortieren –
         * verbessert Alpha-Beta-Pruning drastisch.
         */
        orderColumns(cols) {
          const centerDistances = [3, 2, 4, 1, 5, 0, 6];
          return cols.sort((a, b) => centerDistances.indexOf(a) - centerDistances.indexOf(b));
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
        /**
         * Minimax mit Alpha-Beta-Pruning und Transpositionstabelle.
         */
        minimax(board, depth, alpha, beta, isMaximizing) {
          if (this.checkWin(board, this.PLAYER2)) return 1e5 + depth;
          if (this.checkWin(board, this.PLAYER1)) return -1e5 - depth;
          const availableCols = this.getAvailableCols(board);
          if (this.isBoardFull() || availableCols.length === 0 || depth === 0) {
            return this.evaluateBoard(board);
          }
          if (this.transpositionTable.size > 0) {
            const key = this.boardToKey(board);
            const cached = this.transpositionTable.get(key);
            if (cached !== void 0) return cached;
          }
          const orderedCols = this.orderColumns(availableCols);
          if (isMaximizing) {
            let maxEval = -Infinity;
            for (const col of orderedCols) {
              const tempBoard = board.map((row) => [...row]);
              this.makeMoveInBoard(tempBoard, col, this.PLAYER2);
              const evaluation = this.minimax(tempBoard, depth - 1, alpha, beta, false);
              maxEval = Math.max(maxEval, evaluation);
              alpha = Math.max(alpha, evaluation);
              if (beta <= alpha) break;
            }
            this.cacheBoard(board, maxEval);
            return maxEval;
          } else {
            let minEval = Infinity;
            for (const col of orderedCols) {
              const tempBoard = board.map((row) => [...row]);
              this.makeMoveInBoard(tempBoard, col, this.PLAYER1);
              const evaluation = this.minimax(tempBoard, depth - 1, alpha, beta, true);
              minEval = Math.min(minEval, evaluation);
              beta = Math.min(beta, evaluation);
              if (beta <= alpha) break;
            }
            this.cacheBoard(board, minEval);
            return minEval;
          }
        }
        /** Board als String-Key für die Transpositionstabelle. */
        boardToKey(board) {
          return board.map((row) => row.join(",")).join("|");
        }
        /** Ergebnis im Cache speichern (nur bei Extrem-Schwer). */
        cacheBoard(board, value) {
          if (this.difficulty >= 4) {
            const key = this.boardToKey(board);
            if (!this.transpositionTable.has(key)) {
              this.transpositionTable.set(key, value);
            }
          }
        }
        /**
         * Window-basierte Heuristik.
         * Bewertert alle 4er-Fenster (horizontal, vertikal, beide Diagonalen).
         */
        evaluateBoard(board) {
          let score = 0;
          for (let r = 0; r < this.ROWS; r++) {
            if (board[r][3] === this.PLAYER2) score += 4;
            else if (board[r][3] === this.PLAYER1) score -= 4;
          }
          score += this.evaluateDirection(board, 0, 1);
          score += this.evaluateDirection(board, 1, 0);
          score += this.evaluateDirection(board, 1, 1);
          score += this.evaluateDirection(board, -1, 1);
          return score;
        }
        /**
         * Bewertere alle 4er-Fenster in einer Richtung.
         * @param dr  Zeilen-Inkrement
         * @param dc  Spalten-Inkrement
         */
        evaluateDirection(board, dr, dc) {
          let score = 0;
          for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
              const window2 = [];
              let valid = true;
              for (let i = 0; i < 4; i++) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) {
                  valid = false;
                  break;
                }
                window2.push(board[nr][nc]);
              }
              if (!valid) continue;
              score += this.evaluateWindow(window2);
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
        evaluateWindow(window2) {
          const aiCount = window2.filter((v) => v === this.PLAYER2).length;
          const oppCount = window2.filter((v) => v === this.PLAYER1).length;
          const emptyCount = window2.filter((v) => v === 0).length;
          if (aiCount === 4) return 1e6;
          if (aiCount === 3 && emptyCount === 1) return 50;
          if (aiCount === 2 && emptyCount === 2) return 5;
          if (oppCount === 3 && emptyCount === 1) return -80;
          return 0;
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
  var BD_EMPTY_CHAR, BD_PLAYER_CHAR, BD_WALL_CHAR, BD_DIRT_CHAR, BD_BOULDER_CHAR, BD_DIAMOND_CHAR, BD_EXIT_CHAR, BD_LEVELS, BD_TOTAL_LEVELS, BoulderDashGame;
  var init_BoulderDashGame = __esm({
    "src/games/BoulderDashGame.ts"() {
      "use strict";
      BD_EMPTY_CHAR = 0;
      BD_PLAYER_CHAR = 1;
      BD_WALL_CHAR = 2;
      BD_DIRT_CHAR = 3;
      BD_BOULDER_CHAR = 4;
      BD_DIAMOND_CHAR = 5;
      BD_EXIT_CHAR = 7;
      BD_LEVELS = [
        { name: "\u{1F3D5}\uFE0F First Dig", target: 3, wallBlocks: 2, boulderCount: 3, diamondCount: 8 },
        { name: "\u{1F573}\uFE0F Wider Cavern", target: 5, wallBlocks: 4, boulderCount: 5, diamondCount: 10 },
        { name: "\u{1FAA8} Rock Garden", target: 7, wallBlocks: 5, boulderCount: 8, diamondCount: 12 },
        { name: "\u271D\uFE0F The Cross", target: 8, wallBlocks: 8, boulderCount: 10, diamondCount: 14 },
        { name: "\u{1F300} Labyrinth", target: 10, wallBlocks: 10, boulderCount: 12, diamondCount: 15 },
        { name: "\u{1F30A} Underground Lake", target: 10, wallBlocks: 10, boulderCount: 14, diamondCount: 16 },
        { name: "\u{1F48E} Treasure Room", target: 12, wallBlocks: 11, boulderCount: 14, diamondCount: 18 },
        { name: "\u{1F9F1} The Squeeze", target: 13, wallBlocks: 12, boulderCount: 16, diamondCount: 18 },
        { name: "\u{1F480} Cavern of Doom", target: 15, wallBlocks: 14, boulderCount: 18, diamondCount: 20 },
        { name: "\u{1F451} The Final Frontier", target: 18, wallBlocks: 16, boulderCount: 20, diamondCount: 24 }
      ];
      BD_TOTAL_LEVELS = BD_LEVELS.length;
      BoulderDashGame = class {
        constructor() {
          this.id = "boulderDash";
          this.BD_SIZE = 20;
          this.BD_CELL_SIZE = 20;
          this.board = [];
          this.playerX = 0;
          this.playerY = 0;
          this.score = 0;
          this.totalDiamonds = 0;
          this.collectedDiamonds = 0;
          this.gameOver = false;
          this.won = false;
          this.currentLevelIndex = 0;
          this.levelFinished = false;
          this.exitRevealed = false;
          this.exitX = 0;
          this.exitY = 0;
          this.resetBdBtn = null;
          this.bdCanvas = null;
          this.bdStatusElement = null;
          this.bdLevelDisplay = null;
          this.bdLevelName = null;
          this.bdPrevLevelBtn = null;
          this.bdNextLevelBtn = null;
          this.bdBtnUp = null;
          this.bdBtnDown = null;
          this.bdBtnLeft = null;
          this.bdBtnRight = null;
          this.ctx = null;
          this.resetBdBtn = document.getElementById("resetBdBtn");
          this.bdCanvas = document.getElementById("bdCanvas");
          this.bdStatusElement = document.getElementById("bdStatus");
          this.bdLevelDisplay = document.getElementById("bdLevelDisplay");
          this.bdLevelName = document.getElementById("bdLevelName");
          this.bdPrevLevelBtn = document.getElementById("bdPrevLevelBtn");
          this.bdNextLevelBtn = document.getElementById("bdNextLevelBtn");
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
            this.resetBdBtn.addEventListener("click", () => this.startLevel(this.currentLevelIndex));
          }
          if (this.bdPrevLevelBtn) {
            this.bdPrevLevelBtn.addEventListener("click", () => this.prevLevel());
          }
          if (this.bdNextLevelBtn) {
            this.bdNextLevelBtn.addEventListener("click", () => this.nextLevel());
          }
        }
        init() {
          this.score = 0;
          this.currentLevelIndex = 0;
          this.startLevel(0);
        }
        startLevel(levelIndex) {
          if (levelIndex < 0 || levelIndex >= BD_TOTAL_LEVELS) return;
          if (this.interval) clearInterval(this.interval);
          this.currentLevelIndex = levelIndex;
          this.collectedDiamonds = 0;
          this.totalDiamonds = 0;
          this.gameOver = false;
          this.won = false;
          this.levelFinished = false;
          this.exitRevealed = false;
          if (this.levelTimeout) {
            clearTimeout(this.levelTimeout);
            this.levelTimeout = void 0;
          }
          const levelDef = BD_LEVELS[levelIndex];
          this.generateCave(levelDef);
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
          if (this.totalDiamonds < levelDef.target) {
            this.totalDiamonds = levelDef.target;
          }
          this.updateLevelButtons();
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
          if (this.levelTimeout) {
            clearTimeout(this.levelTimeout);
            this.levelTimeout = void 0;
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
        generateCave(levelDef) {
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
          const wallVariation = Math.max(1, Math.floor(levelDef.wallBlocks * 0.3));
          const numWalls = levelDef.wallBlocks + Math.floor(Math.random() * wallVariation);
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
          const boulderVariation = Math.max(1, Math.floor(levelDef.boulderCount * 0.3));
          const numBoulders = levelDef.boulderCount + Math.floor(Math.random() * boulderVariation);
          for (let i = 0; i < numBoulders; i++) {
            const x = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            const y = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            if (this.board[y][x] === BD_DIRT_CHAR) {
              this.board[y][x] = BD_BOULDER_CHAR;
            }
          }
          const diamondVariation = Math.max(1, Math.floor(levelDef.diamondCount * 0.25));
          const numDiamonds = levelDef.diamondCount + Math.floor(Math.random() * diamondVariation);
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
          this.exitX = this.BD_SIZE - 3;
          this.exitY = this.BD_SIZE - 3;
          if (this.board[this.exitY][this.exitX] === BD_DIRT_CHAR) {
            this.board[this.exitY][this.exitX] = BD_EXIT_CHAR;
          } else {
            for (let dy = -2; dy <= 0; dy++) {
              for (let dx = -2; dx <= 0; dx++) {
                const tryX = this.BD_SIZE - 3 + dx;
                const tryY = this.BD_SIZE - 3 + dy;
                if (tryX > 1 && tryY > 1 && this.board[tryY][tryX] === BD_DIRT_CHAR) {
                  this.exitX = tryX;
                  this.exitY = tryY;
                  this.board[tryY][tryX] = BD_EXIT_CHAR;
                  dy = -99;
                  dx = -99;
                }
              }
            }
          }
        }
        updateStatus() {
          if (this.bdStatusElement) {
            const levelDef = BD_LEVELS[this.currentLevelIndex];
            if (this.won) {
              if (this.currentLevelIndex >= BD_TOTAL_LEVELS - 1) {
                this.bdStatusElement.textContent = `\u{1F3C6} Alle Level geschafft! \u{1F3C6}  \u{1F48E} ${this.collectedDiamonds}  Punkte: ${this.score}`;
              } else {
                this.bdStatusElement.textContent = `\u{1F6AA} Ausgang erreicht! \u{1F48E} ${this.collectedDiamonds}  Punkte: ${this.score}  \u2014  Weiter zum n\xE4chsten Level ...`;
              }
            } else if (this.gameOver) {
              this.bdStatusElement.textContent = `\u{1F480} Game Over! Level ${this.currentLevelIndex + 1}: ${levelDef.name}  \u{1F48E} ${this.collectedDiamonds}`;
            } else if (this.exitRevealed) {
              this.bdStatusElement.textContent = `\u{1F6AA} Der Ausgang ist offen! Finde ihn!  \u{1F48E} ${this.collectedDiamonds}/${levelDef.target}  Punkte: ${this.score}`;
            } else {
              this.bdStatusElement.textContent = `Level ${this.currentLevelIndex + 1}/${BD_TOTAL_LEVELS}  \u{1F48E} ${this.collectedDiamonds}/${levelDef.target}  Punkte: ${this.score}`;
            }
          }
          if (this.bdLevelDisplay) {
            this.bdLevelDisplay.textContent = `Level ${this.currentLevelIndex + 1}/${BD_TOTAL_LEVELS}`;
          }
          if (this.bdLevelName) {
            this.bdLevelName.textContent = BD_LEVELS[this.currentLevelIndex].name;
          }
        }
        updateLevelButtons() {
          if (this.bdPrevLevelBtn) {
            this.bdPrevLevelBtn.classList.toggle("disabled", this.currentLevelIndex <= 0);
          }
          if (this.bdNextLevelBtn) {
            this.bdNextLevelBtn.classList.toggle("disabled", this.currentLevelIndex >= BD_TOTAL_LEVELS - 1);
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
                case BD_EXIT_CHAR:
                  if (this.exitRevealed) {
                    this.ctx.fillStyle = "#1a1a2e";
                    this.ctx.fillRect(px, py, cs, cs);
                    this.ctx.fillStyle = "#ffd700";
                    this.ctx.fillRect(px + 3, py + 3, cs - 6, cs - 6);
                    this.ctx.fillStyle = "#fff8dc";
                    this.ctx.font = "14px monospace";
                    this.ctx.fillText("\u{1F6AA}", px + 2, py + 16);
                    this.ctx.strokeStyle = "rgba(255,215,0,0.6)";
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(px + 1, py + 1, cs - 2, cs - 2);
                    this.ctx.lineWidth = 1;
                  } else {
                    this.ctx.fillStyle = "#1a1a2e";
                    this.ctx.fillRect(px, py, cs, cs);
                    this.ctx.fillStyle = "#4a3728";
                    this.ctx.fillRect(px + 2, py + 4, cs - 4, cs - 6);
                    this.ctx.fillStyle = "#b8860b";
                    this.ctx.font = "12px monospace";
                    this.ctx.fillText("\u{1F512}", px + 3, py + 16);
                    this.ctx.strokeStyle = "#b8860b";
                    this.ctx.strokeRect(px + 2, py + 4, cs - 4, cs - 6);
                  }
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
          if (target === BD_EXIT_CHAR) {
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            this.draw();
            if (this.exitRevealed) {
              this.winLevel();
            } else {
              this.updateStatus();
            }
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
          if (this.levelFinished || this.won || this.gameOver) return;
          const levelDef = BD_LEVELS[this.currentLevelIndex];
          if (this.collectedDiamonds >= levelDef.target && !this.exitRevealed) {
            this.exitRevealed = true;
            this.score += 20;
            this.updateStatus();
            this.draw();
            if (this.playerX === this.exitX && this.playerY === this.exitY) {
              this.winLevel();
            }
          }
        }
        winLevel() {
          this.won = true;
          this.score += 50;
          this.updateStatus();
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = void 0;
          }
          this.draw();
          this.levelFinished = true;
          this.levelTimeout = setTimeout(() => {
            const nextIdx = this.currentLevelIndex + 1;
            if (nextIdx < BD_TOTAL_LEVELS) {
              this.startLevel(nextIdx);
            } else {
              this.updateStatus();
            }
          }, 2e3);
        }
        nextLevel() {
          const nextIdx = this.currentLevelIndex + 1;
          if (nextIdx < BD_TOTAL_LEVELS) {
            this.startLevel(nextIdx);
          }
        }
        prevLevel() {
          const prevIdx = this.currentLevelIndex - 1;
          if (prevIdx >= 0) {
            this.startLevel(prevIdx);
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

  // src/games/MahjongGame.ts
  function getLayerDefs() {
    return [
      { cols: 12, rows: 5, colOffset: 0, rowOffset: 0 },
      { cols: 10, rows: 4, colOffset: 1, rowOffset: 0 },
      { cols: 8, rows: 3, colOffset: 2, rowOffset: 1 },
      { cols: 6, rows: 2, colOffset: 3, rowOffset: 1 },
      { cols: 4, rows: 2, colOffset: 4, rowOffset: 1 }
    ];
  }
  function buildLayout() {
    const layers = getLayerDefs();
    const positions = [];
    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l];
      for (let r = 0; r < layer.rows; r++) {
        for (let c = 0; c < layer.cols; c++) {
          positions.push({
            col: layer.colOffset + c,
            row: layer.rowOffset + r,
            layer: l
          });
        }
      }
    }
    return positions;
  }
  var SUITS, SUIT_NAMES, MahjongGame;
  var init_MahjongGame = __esm({
    "src/games/MahjongGame.ts"() {
      "use strict";
      SUITS = [
        { name: "Kreise", color: "#e74c3c", symbol: "\u25CF", count: 9 },
        { name: "Bambus", color: "#27ae60", symbol: "\u{1F38B}", count: 9 },
        { name: "Zeichen", color: "#2980b9", symbol: "\u4E2D", count: 9 },
        { name: "Winde", color: "#8e44ad", symbol: "\u98A8", count: 4 },
        { name: "Drachen", color: "#f39c12", symbol: "\u9F8D", count: 3 },
        { name: "Bl\xFCten", color: "#e91e63", symbol: "\u{1F338}", count: 2 }
      ];
      SUIT_NAMES = [
        ["\u25CF1", "\u25CF2", "\u25CF3", "\u25CF4", "\u25CF5", "\u25CF6", "\u25CF7", "\u25CF8", "\u25CF9"],
        ["\u{1F38B}1", "\u{1F38B}2", "\u{1F38B}3", "\u{1F38B}4", "\u{1F38B}5", "\u{1F38B}6", "\u{1F38B}7", "\u{1F38B}8", "\u{1F38B}9"],
        ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D"],
        ["O", "S", "W", "N"],
        ["R", "G", "W"],
        ["\u{1F33A}", "\u{1F33B}"]
      ];
      MahjongGame = class {
        constructor() {
          this.id = "mahjong";
          // Rendering
          this.TILE_W = 52;
          this.TILE_H = 62;
          this.TILE_GAP = 4;
          this.LAYER_OFFSET_X = 14;
          // visual offset per layer (left)
          this.LAYER_OFFSET_Y = 16;
          // visual offset per layer (down)
          this.CANVAS_W = 900;
          this.CANVAS_H = 580;
          // Game state
          this.tiles = [];
          this.selectedTile = null;
          this.pairsRemoved = 0;
          this.totalPairs = 72;
          this.gameOver = false;
          this.gameWon = false;
          this.gameStarted = false;
          this.startTime = 0;
          this.elapsedTime = 0;
          // Shuffle hint animation
          this.hintFlashTiles = [];
          this.hintFlashTimer = 0;
          // DOM elements
          this.canvas = null;
          this.ctx = null;
          this.statusEl = null;
          this.resetBtn = null;
          this.hintBtn = null;
          this.shuffleBtn = null;
          this.canvas = document.getElementById("mahjongCanvas");
          this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
          this.statusEl = document.getElementById("mahjongStatus");
          this.resetBtn = document.getElementById("resetMahjongBtn");
          this.hintBtn = document.getElementById("mahjongHintBtn");
          this.shuffleBtn = document.getElementById("mahjongShuffleBtn");
          if (this.resetBtn) {
            this.resetBtn.addEventListener("click", () => this.init());
          }
          if (this.hintBtn) {
            this.hintBtn.addEventListener("click", () => this.showHint());
          }
          if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener("click", () => this.shuffleBoard());
          }
          if (this.canvas) {
            this.canvas.addEventListener("click", (e) => this.handleClick(e));
          }
        }
        // =============================================
        // Game Interface Implementation
        // =============================================
        init() {
          if (this.timerInterval) clearInterval(this.timerInterval);
          if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
          this.selectedTile = null;
          this.pairsRemoved = 0;
          this.gameOver = false;
          this.gameWon = false;
          this.gameStarted = false;
          this.elapsedTime = 0;
          this.hintFlashTiles = [];
          this.hintFlashTimer = 0;
          const positions = buildLayout();
          this.tiles = this.createTiles(positions);
          this.shuffleTiles();
          if (this.statusEl) {
            this.statusEl.textContent = "Paare: 0 / 72 | Zeit: 0s";
          }
          this.draw();
          this.timerInterval = setInterval(() => {
            if (this.gameStarted && !this.gameOver) {
              this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1e3);
              this.updateStatus();
            }
          }, 1e3);
          this.gameLoopInterval = setInterval(() => {
            if (this.hintFlashTimer > 0) {
              this.hintFlashTimer--;
              if (this.hintFlashTimer === 0) {
                this.hintFlashTiles = [];
              }
              this.draw();
            }
          }, 200);
        }
        cleanup() {
          if (this.timerInterval) clearInterval(this.timerInterval);
          if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        }
        // =============================================
        // Tile Creation
        // =============================================
        createTiles(positions) {
          const totalTypes = 36;
          const copiesPerType = 4;
          const typeList = [];
          for (let t = 0; t < totalTypes; t++) {
            for (let c = 0; c < copiesPerType; c++) {
              typeList.push(t);
            }
          }
          const tiles = [];
          let id = 0;
          for (const pos of positions) {
            const type = typeList[id];
            const suit = this.getSuit(type);
            const value = this.getSuitValue(type);
            tiles.push({
              id,
              type,
              suit,
              value,
              pos,
              removed: false
            });
            id++;
          }
          return tiles;
        }
        getSuit(type) {
          if (type < 9) return 0;
          if (type < 18) return 1;
          if (type < 27) return 2;
          if (type < 31) return 3;
          if (type < 34) return 4;
          return 5;
        }
        getSuitValue(type) {
          if (type < 9) return type + 1;
          if (type < 18) return type - 9 + 1;
          if (type < 27) return type - 18 + 1;
          if (type < 31) return type - 27 + 1;
          if (type < 34) return type - 31 + 1;
          return type - 34 + 1;
        }
        getTypeName(type) {
          const suit = this.getSuit(type);
          const val = this.getSuitValue(type);
          return SUIT_NAMES[suit][val - 1] || `?${type}`;
        }
        shuffleTiles() {
          for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.tiles[i].type;
            this.tiles[i].type = this.tiles[j].type;
            this.tiles[j].type = temp;
            this.tiles[i].suit = this.getSuit(this.tiles[i].type);
            this.tiles[i].value = this.getSuitValue(this.tiles[i].type);
            this.tiles[j].suit = this.getSuit(this.tiles[j].type);
            this.tiles[j].value = this.getSuitValue(this.tiles[j].type);
          }
        }
        // =============================================
        // Tile Freedom Checks
        // =============================================
        isTileCovered(tile) {
          for (const other of this.tiles) {
            if (other.removed || other.id === tile.id) continue;
            if (other.pos.layer <= tile.pos.layer) continue;
            const dx = Math.abs(other.pos.col - tile.pos.col);
            const dy = Math.abs(other.pos.row - tile.pos.row);
            if (dx <= 1 && dy <= 1) {
              return true;
            }
          }
          return false;
        }
        isTileFreeOnLeft(tile) {
          for (const other of this.tiles) {
            if (other.removed || other.id === tile.id) continue;
            if (other.pos.layer !== tile.pos.layer) continue;
            if (other.pos.row !== tile.pos.row) continue;
            if (other.pos.col === tile.pos.col - 1) {
              return false;
            }
          }
          return true;
        }
        isTileFreeOnRight(tile) {
          for (const other of this.tiles) {
            if (other.removed || other.id === tile.id) continue;
            if (other.pos.layer !== tile.pos.layer) continue;
            if (other.pos.row !== tile.pos.row) continue;
            if (other.pos.col === tile.pos.col + 1) {
              return false;
            }
          }
          return true;
        }
        isTileFree(tile) {
          if (tile.removed) return false;
          if (this.isTileCovered(tile)) return false;
          return this.isTileFreeOnLeft(tile) || this.isTileFreeOnRight(tile);
        }
        // =============================================
        // Click Handling
        // =============================================
        handleClick(event) {
          if (this.gameOver) return;
          if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
          }
          const rect = this.canvas.getBoundingClientRect();
          const scaleX = this.canvas.width / rect.width;
          const scaleY = this.canvas.height / rect.height;
          const mx = (event.clientX - rect.left) * scaleX;
          const my = (event.clientY - rect.top) * scaleY;
          const clickedTiles = [];
          for (const tile of this.tiles) {
            if (!this.isTileFree(tile)) continue;
            const { x, y } = this.getTileScreenPos(tile);
            if (mx >= x && mx < x + this.TILE_W && my >= y && my < y + this.TILE_H) {
              clickedTiles.push(tile);
            }
          }
          if (clickedTiles.length === 0) return;
          clickedTiles.sort((a, b) => b.pos.layer - a.pos.layer);
          const clicked = clickedTiles[0];
          if (this.selectedTile === null) {
            this.selectedTile = clicked;
            this.draw();
            return;
          }
          if (clicked.id === this.selectedTile.id) {
            this.selectedTile = null;
            this.draw();
            return;
          }
          if (this.tilesMatch(this.selectedTile, clicked)) {
            this.selectedTile.removed = true;
            clicked.removed = true;
            this.pairsRemoved++;
            this.selectedTile = null;
            this.updateStatus();
            this.draw();
            this.checkGameEnd();
          } else {
            this.selectedTile = null;
            this.draw();
          }
        }
        tilesMatch(a, b) {
          return a.type === b.type;
        }
        checkGameEnd() {
          if (this.pairsRemoved >= this.totalPairs) {
            this.gameOver = true;
            this.gameWon = true;
            if (this.statusEl) {
              this.statusEl.textContent += " \u{1F389} Gewonnen!";
            }
            this.draw();
            return;
          }
          const freeTiles = this.tiles.filter((t) => this.isTileFree(t));
          const typeCounts = /* @__PURE__ */ new Map();
          for (const tile of freeTiles) {
            typeCounts.set(tile.type, (typeCounts.get(tile.type) || 0) + 1);
          }
          let hasMove = false;
          for (const count of typeCounts.values()) {
            if (count >= 2) {
              hasMove = true;
              break;
            }
          }
          if (!hasMove) {
            this.gameOver = true;
            this.gameWon = false;
            if (this.statusEl) {
              this.statusEl.textContent += " \u{1F635} Keine Z\xFCge mehr! Neues Spiel starten.";
            }
            this.draw();
          }
        }
        // =============================================
        // Screen Position Calculation
        // =============================================
        getTileScreenPos(tile) {
          const layers = getLayerDefs();
          const bottomLayer = layers[0];
          const maxCols = bottomLayer.cols;
          const maxRows = bottomLayer.rows;
          const gridW = maxCols * (this.TILE_W + this.TILE_GAP) + this.TILE_W;
          const gridH = maxRows * (this.TILE_H + this.TILE_GAP) + this.TILE_H;
          const offsetX = (this.CANVAS_W - gridW) / 2;
          const offsetY = (this.CANVAS_H - gridH) / 2;
          const x = offsetX + tile.pos.col * (this.TILE_W + this.TILE_GAP) + tile.pos.layer * this.LAYER_OFFSET_X;
          const y = offsetY + tile.pos.row * (this.TILE_H + this.TILE_GAP) - tile.pos.layer * this.LAYER_OFFSET_Y;
          return { x, y };
        }
        // =============================================
        // Drawing
        // =============================================
        draw() {
          if (!this.ctx || !this.canvas) return;
          const ctx = this.ctx;
          ctx.clearRect(0, 0, this.CANVAS_W, this.CANVAS_H);
          ctx.fillStyle = "#1a5c2a";
          ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
          ctx.fillStyle = "rgba(255,255,255,0.03)";
          for (let i = 0; i < this.CANVAS_W; i += 8) {
            for (let j = 0; j < this.CANVAS_H; j += 8) {
              if ((i + j) % 16 === 0) {
                ctx.fillRect(i, j, 4, 4);
              }
            }
          }
          const visibleTiles = this.tiles.filter((t) => !t.removed);
          visibleTiles.sort((a, b) => a.pos.layer - b.pos.layer || a.pos.row - b.pos.row || a.pos.col - b.pos.col);
          for (const tile of visibleTiles) {
            this.drawTile(tile);
          }
          if (this.gameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
            ctx.fillStyle = this.gameWon ? "#f1c40f" : "#e74c3c";
            ctx.font = "bold 48px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const msg = this.gameWon ? "\u{1F389} GEWONNEN! \u{1F389}" : "KEINE Z\xDCGE MEHR!";
            ctx.fillText(msg, this.CANVAS_W / 2, this.CANVAS_H / 2 - 20);
            ctx.font = "24px Segoe UI, sans-serif";
            ctx.fillStyle = "#fff";
            ctx.fillText(`Paare entfernt: ${this.pairsRemoved} / ${this.totalPairs}`, this.CANVAS_W / 2, this.CANVAS_H / 2 + 40);
          }
        }
        drawTile(tile) {
          var _a, _b, _c, _d;
          const ctx = this.ctx;
          const { x, y } = this.getTileScreenPos(tile);
          const w = this.TILE_W;
          const h = this.TILE_H;
          const isFree = this.isTileFree(tile);
          const isSelected = ((_a = this.selectedTile) == null ? void 0 : _a.id) === tile.id;
          const isHinted = this.hintFlashTiles.some((t) => t.id === tile.id);
          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 3;
          const r = 6;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          const grad = ctx.createLinearGradient(x, y, x, y + h);
          if (isSelected) {
            grad.addColorStop(0, "#fffde7");
            grad.addColorStop(1, "#fff9c4");
          } else if (isHinted) {
            grad.addColorStop(0, "#e0f7fa");
            grad.addColorStop(1, "#b2ebf2");
          } else if (isFree) {
            grad.addColorStop(0, "#fff8e1");
            grad.addColorStop(1, "#ffecb3");
          } else {
            grad.addColorStop(0, "#ccc");
            grad.addColorStop(1, "#aaa");
          }
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.strokeStyle = isSelected ? "#f39c12" : isHinted ? "#00bcd4" : isFree ? "#8d6e63" : "#888";
          ctx.lineWidth = isSelected ? 3 : isHinted ? 3 : isFree ? 1.5 : 1;
          ctx.stroke();
          ctx.lineWidth = 1;
          if (!isFree) {
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.font = "20px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\u{1F512}", x + w / 2, y + h / 2);
            return;
          }
          const suitColor = ((_b = SUITS[tile.suit]) == null ? void 0 : _b.color) || "#333";
          const name = this.getTypeName(tile.type);
          ctx.fillStyle = suitColor;
          ctx.font = "bold 16px Segoe UI, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(((_c = SUITS[tile.suit]) == null ? void 0 : _c.symbol) || "?", x + 5, y + 4);
          ctx.fillStyle = suitColor;
          ctx.font = "bold 24px Segoe UI, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(name, x + w / 2, y + h / 2);
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.font = "11px Segoe UI, sans-serif";
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.fillText(((_d = SUITS[tile.suit]) == null ? void 0 : _d.name) || "", x + w - 4, y + h - 4);
          if (isSelected) {
            ctx.strokeStyle = "#f39c12";
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
          }
        }
        // =============================================
        // Status Update
        // =============================================
        updateStatus() {
          if (!this.statusEl) return;
          const time = this.elapsedTime;
          const mins = Math.floor(time / 60);
          const secs = time % 60;
          const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
          this.statusEl.textContent = `Paare: ${this.pairsRemoved} / ${this.totalPairs} | Zeit: ${timeStr}`;
        }
        // =============================================
        // Hint: Find a matching pair and flash them
        // =============================================
        showHint() {
          if (this.gameOver) return;
          const freeTiles = this.tiles.filter((t) => this.isTileFree(t));
          for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
              if (this.tilesMatch(freeTiles[i], freeTiles[j])) {
                this.hintFlashTiles = [freeTiles[i], freeTiles[j]];
                this.hintFlashTimer = 8;
                this.draw();
                return;
              }
            }
          }
        }
        // =============================================
        // Shuffle remaining tiles (when stuck)
        // =============================================
        shuffleBoard() {
          if (this.gameOver) return;
          const remaining = this.tiles.filter((t) => !t.removed);
          const types = remaining.map((t) => t.type);
          for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
          }
          for (let i = 0; i < remaining.length; i++) {
            remaining[i].type = types[i];
            remaining[i].suit = this.getSuit(types[i]);
            remaining[i].value = this.getSuitValue(types[i]);
          }
          this.selectedTile = null;
          this.draw();
          this.checkGameEnd();
        }
      };
    }
  });

  // src/games/KatakisGame.ts
  var KatakisGame;
  var init_KatakisGame = __esm({
    "src/games/KatakisGame.ts"() {
      "use strict";
      KatakisGame = class {
        constructor() {
          this.id = "katakis";
          this.CANVAS_W = 640;
          this.CANVAS_H = 400;
          this.PLAYER_W = 36;
          this.PLAYER_H = 28;
          this.canvas = null;
          this.ctx = null;
          this.statusEl = null;
          // Player
          this.px = 80;
          this.py = 180;
          this.pSpeed = 4;
          this.pHp = 5;
          this.pMaxHp = 5;
          this.pInvincible = 0;
          this.pWeapon = "basic";
          this.pWeaponLevel = 1;
          this.pScore = 0;
          this.pLives = 3;
          this.pShootTimer = 0;
          this.pShootInterval = 12;
          // Input
          this.keys = /* @__PURE__ */ new Set();
          // Game objects
          this.stars = [];
          this.bullets = [];
          this.enemies = [];
          this.powerUps = [];
          this.particles = [];
          // Level
          this.level = 0;
          this.levelTimer = 0;
          this.levelEnemyTimer = 0;
          this.scrollX = 0;
          this.gameOver = false;
          this.gameWon = false;
          this.bossActive = false;
          this.levelTransition = 0;
          // Buttons
          this.resetBtn = null;
          this.btnLeft = null;
          this.btnRight = null;
          this.btnUp = null;
          this.btnDown = null;
          this.btnShoot = null;
          this.btnForce = null;
          this.canvas = document.getElementById("katakisCanvas");
          this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
          this.statusEl = document.getElementById("katakisStatus");
          this.resetBtn = document.getElementById("resetKatakisBtn");
          this.btnLeft = document.getElementById("katakisBtnLeft");
          this.btnRight = document.getElementById("katakisBtnRight");
          this.btnUp = document.getElementById("katakisBtnUp");
          this.btnDown = document.getElementById("katakisBtnDown");
          this.btnShoot = document.getElementById("katakisBtnShoot");
          this.btnForce = document.getElementById("katakisBtnForce");
          this.force = { x: 0, y: 0, active: true, attached: true, angle: 0, side: 1 };
          this.setupEventListeners();
          this.setupMobileControls();
        }
        // =============================================
        // Setup
        // =============================================
        setupEventListeners() {
          if (this.resetBtn) {
            this.resetBtn.addEventListener("click", () => this.init());
          }
        }
        setupMobileControls() {
          const addCtrl = (btn, action) => {
            if (!btn) return;
            btn.addEventListener("touchstart", (e) => {
              e.preventDefault();
              action();
            });
            btn.addEventListener("mousedown", (e) => {
              e.preventDefault();
              action();
            });
          };
          addCtrl(this.btnLeft, () => {
            if (!this.gameOver) this.px = Math.max(10, this.px - 12);
          });
          addCtrl(this.btnRight, () => {
            if (!this.gameOver) this.px = Math.min(this.CANVAS_W - this.PLAYER_W - 10, this.px + 12);
          });
          addCtrl(this.btnUp, () => {
            if (!this.gameOver) this.py = Math.max(10, this.py - 12);
          });
          addCtrl(this.btnDown, () => {
            if (!this.gameOver) this.py = Math.min(this.CANVAS_H - this.PLAYER_H - 10, this.py + 12);
          });
          addCtrl(this.btnShoot, () => {
            if (!this.gameOver) this.playerShoot();
          });
          addCtrl(this.btnForce, () => {
            if (!this.gameOver) this.toggleForce();
          });
        }
        // =============================================
        // Game Interface
        // =============================================
        init() {
          if (this.gameInterval) clearInterval(this.gameInterval);
          this.px = 80;
          this.py = this.CANVAS_H / 2 - this.PLAYER_H / 2;
          this.pHp = 5;
          this.pMaxHp = 5;
          this.pInvincible = 0;
          this.pWeapon = "basic";
          this.pWeaponLevel = 1;
          this.pScore = 0;
          this.pLives = 3;
          this.pShootTimer = 0;
          this.gameOver = false;
          this.gameWon = false;
          this.level = 0;
          this.levelTimer = 0;
          this.levelEnemyTimer = 0;
          this.scrollX = 0;
          this.bossActive = false;
          this.levelTransition = 0;
          this.bullets = [];
          this.enemies = [];
          this.powerUps = [];
          this.particles = [];
          this.keys.clear();
          this.force = { x: 0, y: 0, active: true, attached: true, angle: 0, side: 1 };
          this.generateStars();
          this.updateStatus();
          this.draw();
          this.gameInterval = setInterval(() => {
            this.update();
            this.draw();
          }, 16);
        }
        cleanup() {
          if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = void 0;
          }
          this.keys.clear();
        }
        // =============================================
        // Starfield
        // =============================================
        generateStars() {
          this.stars = [];
          for (let i = 0; i < 120; i++) {
            this.stars.push({
              x: Math.random() * this.CANVAS_W,
              y: Math.random() * this.CANVAS_H,
              speed: 0.5 + Math.random() * 2.5,
              brightness: 0.3 + Math.random() * 0.7
            });
          }
        }
        // =============================================
        // Input Handling
        // =============================================
        handleKeyDown(e) {
          this.keys.add(e.key);
          if (e.key === " " || e.key === "Space") {
            this.playerShoot();
          }
          if (e.key === "f" || e.key === "F") {
            this.toggleForce();
          }
          e.preventDefault();
        }
        handleKeyUp(e) {
          this.keys.delete(e.key);
        }
        toggleForce() {
          if (this.force.active) {
            this.force.attached = !this.force.attached;
          }
        }
        // =============================================
        // Player Shooting
        // =============================================
        playerShoot() {
          if (this.pShootTimer > 0) return;
          this.pShootTimer = this.pShootInterval;
          const cx = this.px + this.PLAYER_W / 2;
          const cy = this.py + this.PLAYER_H / 2;
          switch (this.pWeapon) {
            case "basic":
              this.bullets.push({ x: this.px + this.PLAYER_W, y: cy - 2, w: 12, h: 4, speed: 8, type: "player", damage: 1 });
              break;
            case "laser":
              this.bullets.push({ x: this.px + this.PLAYER_W, y: cy - 1, w: 20, h: 3, speed: 12, type: "player", damage: 2 });
              break;
            case "spread":
              this.bullets.push({ x: this.px + this.PLAYER_W, y: cy - 6, w: 10, h: 3, speed: 7, type: "player", damage: 1 });
              this.bullets.push({ x: this.px + this.PLAYER_W, y: cy + 3, w: 10, h: 3, speed: 7, type: "player", damage: 1 });
              this.bullets.push({ x: this.px + this.PLAYER_W, y: cy, w: 12, h: 3, speed: 9, type: "player", damage: 1 });
              break;
          }
        }
        // =============================================
        // Update
        // =============================================
        update() {
          if (this.gameOver) return;
          this.handleInput();
          this.updateStars();
          this.updateForce();
          this.updateBullets();
          this.updateEnemies();
          this.updatePowerUps();
          this.updateParticles();
          this.updateLevel();
          this.checkCollisions();
          this.updateInvincibility();
          this.pShootTimer = Math.max(0, this.pShootTimer - 1);
          if (this.pHp <= 0) {
            this.playerDeath();
          }
        }
        handleInput() {
          if (this.gameOver) return;
          if (this.keys.has("ArrowLeft") || this.keys.has("a") || this.keys.has("A")) {
            this.px = Math.max(10, this.px - this.pSpeed);
          }
          if (this.keys.has("ArrowRight") || this.keys.has("d") || this.keys.has("D")) {
            this.px = Math.min(this.CANVAS_W - this.PLAYER_W - 10, this.px + this.pSpeed);
          }
          if (this.keys.has("ArrowUp") || this.keys.has("w") || this.keys.has("W")) {
            this.py = Math.max(10, this.py - this.pSpeed);
          }
          if (this.keys.has("ArrowDown") || this.keys.has("s") || this.keys.has("S")) {
            this.py = Math.min(this.CANVAS_H - this.PLAYER_H - 10, this.py + this.pSpeed);
          }
          if (this.keys.has(" ") || this.keys.has("Space")) {
            this.playerShoot();
          }
          if (this.keys.has("f") || this.keys.has("F")) {
            this.toggleForce();
          }
        }
        updateStars() {
          for (const star of this.stars) {
            star.x -= star.speed;
            if (star.x < 0) {
              star.x = this.CANVAS_W;
              star.y = Math.random() * this.CANVAS_H;
            }
          }
        }
        updateForce() {
          if (!this.force.active) return;
          if (this.force.attached) {
            this.force.angle += 0.04;
            this.force.side = Math.cos(this.force.angle) > 0 ? 1 : -1;
            const orbitR = 30;
            const fx = this.px + this.PLAYER_W / 2 + Math.cos(this.force.angle) * orbitR;
            const fy = this.py + this.PLAYER_H / 2 + Math.sin(this.force.angle) * orbitR;
            this.force.x = fx - 12;
            this.force.y = fy - 10;
            if (Math.abs(Math.cos(this.force.angle)) > 0.7) {
              const dir = this.force.side > 0 ? 1 : -1;
              this.bullets.push({
                x: this.force.x + (dir > 0 ? 24 : -4),
                y: this.force.y + 8,
                w: 10,
                h: 3,
                speed: 6 * dir,
                type: "force",
                damage: 1
              });
            }
          } else {
          }
        }
        updateBullets() {
          for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.speed;
            if (b.x < -20 || b.x > this.CANVAS_W + 20 || b.y < -20 || b.y > this.CANVAS_H + 20) {
              this.bullets.splice(i, 1);
            }
          }
        }
        updateEnemies() {
          for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            switch (e.type) {
              case "fighter":
                e.x -= 2;
                e.y += Math.sin(e.moveTimer * 0.05) * 1.5;
                break;
              case "bomber":
                e.x -= 1.5;
                e.y += e.speedY;
                if (e.y <= 20 || e.y >= this.CANVAS_H - e.h - 20) e.speedY *= -1;
                break;
              case "turret":
                break;
              case "runner":
                e.x -= 3.5;
                break;
              case "boss":
                if (e.x > this.CANVAS_W - 150) e.x -= 1;
                e.y += Math.sin(e.moveTimer * 0.03) * 1.2;
                break;
            }
            e.moveTimer++;
            e.shootTimer--;
            if (e.shootTimer <= 0 && e.x > 0 && e.x < this.CANVAS_W + 20 && e.type !== "runner") {
              e.shootTimer = 60 + Math.floor(Math.random() * 60);
              if (e.type === "boss") e.shootTimer = 20 + Math.floor(Math.random() * 30);
              this.bullets.push({
                x: e.x - 5,
                y: e.y + e.h / 2 - 3,
                w: 8,
                h: 6,
                speed: -3 - Math.random() * 2,
                type: "enemy",
                damage: 1
              });
              if (e.type === "boss") {
                this.bullets.push({
                  x: e.x - 5,
                  y: e.y + 5,
                  w: 6,
                  h: 6,
                  speed: -3,
                  type: "enemy",
                  damage: 1
                });
                this.bullets.push({
                  x: e.x - 5,
                  y: e.y + e.h - 5,
                  w: 6,
                  h: 6,
                  speed: -3,
                  type: "enemy",
                  damage: 1
                });
              }
            }
            if (e.x < -100) {
              this.enemies.splice(i, 1);
            }
          }
        }
        updatePowerUps() {
          for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            p.x -= 1.5;
            if (p.x < -30) {
              this.powerUps.splice(i, 1);
            }
          }
        }
        updateParticles() {
          for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
              this.particles.splice(i, 1);
            }
          }
        }
        updateInvincibility() {
          if (this.pInvincible > 0) this.pInvincible--;
        }
        // =============================================
        // Level System
        // =============================================
        updateLevel() {
          this.levelTimer++;
          this.levelEnemyTimer++;
          const spawnEnemy = (type, x, y, hp) => {
            const sizes = {
              fighter: { w: 28, h: 22 },
              bomber: { w: 34, h: 26 },
              turret: { w: 24, h: 30 },
              runner: { w: 20, h: 16 },
              boss: { w: 80, h: 60 }
            };
            const size = sizes[type];
            this.enemies.push({
              x,
              y,
              w: size.w,
              h: size.h,
              hp,
              maxHp: hp,
              type,
              moveTimer: 0,
              shootTimer: 30 + Math.floor(Math.random() * 60),
              speedY: type === "bomber" ? Math.random() > 0.5 ? 1 : -1 : 0,
              phase: 0
            });
          };
          const spawnPowerUp = (x, y) => {
            this.spawnPowerUpAt(x, y);
          };
          if (this.level === 0) {
            if (this.levelEnemyTimer % 90 === 0 && !this.bossActive) {
              const y = 30 + Math.random() * (this.CANVAS_H - 80);
              spawnEnemy("fighter", this.CANVAS_W + 10, y, 2);
            }
            if (this.levelEnemyTimer % 180 === 0 && !this.bossActive) {
              spawnEnemy("bomber", this.CANVAS_W + 10, 40, 3);
            }
            if (this.levelTimer > 1200 && !this.bossActive) {
              this.bossActive = true;
              spawnEnemy("boss", this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 25);
            }
            if (this.bossActive && this.enemies.filter((e) => e.type === "boss").length === 0 && this.levelTimer > 1300) {
              this.nextLevel();
            }
          } else if (this.level === 1) {
            if (this.levelEnemyTimer % 60 === 0 && !this.bossActive) {
              const y = 20 + Math.random() * (this.CANVAS_H - 60);
              spawnEnemy("fighter", this.CANVAS_W + 10, y, 3);
            }
            if (this.levelEnemyTimer % 120 === 0 && !this.bossActive) {
              spawnEnemy("bomber", this.CANVAS_W + 10, 30, 4);
            }
            if (this.levelEnemyTimer % 200 === 0 && !this.bossActive) {
              spawnEnemy("runner", this.CANVAS_W + 10, 50 + Math.random() * 250, 2);
            }
            if (this.levelEnemyTimer % 150 === 0 && !this.bossActive) {
              spawnEnemy("turret", this.CANVAS_W + 10, 50 + Math.random() * 250, 5);
            }
            if (this.levelTimer > 1400 && !this.bossActive) {
              this.bossActive = true;
              spawnEnemy("boss", this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 40);
            }
            if (this.bossActive && this.enemies.filter((e) => e.type === "boss").length === 0 && this.levelTimer > 1500) {
              this.nextLevel();
            }
          } else if (this.level === 2) {
            if (this.levelEnemyTimer % 40 === 0 && !this.bossActive) {
              const y = 20 + Math.random() * (this.CANVAS_H - 60);
              spawnEnemy("fighter", this.CANVAS_W + 10, y, 4);
            }
            if (this.levelEnemyTimer % 100 === 0 && !this.bossActive) {
              spawnEnemy("bomber", this.CANVAS_W + 10, 50, 5);
            }
            if (this.levelEnemyTimer % 150 === 0 && !this.bossActive) {
              spawnEnemy("runner", this.CANVAS_W + 10, 60 + Math.random() * 220, 3);
            }
            if (this.levelEnemyTimer % 130 === 0 && !this.bossActive) {
              spawnEnemy("turret", this.CANVAS_W + 10, 100 + Math.random() * 200, 6);
            }
            if (this.levelTimer > 1500 && !this.bossActive) {
              this.bossActive = true;
              spawnEnemy("boss", this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 60);
            }
            if (this.bossActive && this.enemies.filter((e) => e.type === "boss").length === 0 && this.levelTimer > 1600) {
              this.nextLevel();
            }
          } else if (this.level === 3) {
            if (this.levelEnemyTimer % 50 === 0 && !this.bossActive) {
              const y = 20 + Math.random() * (this.CANVAS_H - 60);
              spawnEnemy("fighter", this.CANVAS_W + 10, y, 5);
            }
            if (this.levelEnemyTimer % 200 === 0 && !this.bossActive) {
              spawnEnemy("bomber", this.CANVAS_W + 10, 30, 6);
              spawnEnemy("bomber", this.CANVAS_W + 30, this.CANVAS_H - 30, 6);
            }
            if (this.levelEnemyTimer % 180 === 0 && !this.bossActive) {
              spawnEnemy("turret", this.CANVAS_W + 10, 120, 8);
              spawnEnemy("turret", this.CANVAS_W + 10, this.CANVAS_H - 120, 8);
            }
            if (this.levelTimer > 1e3 && !this.bossActive) {
              this.bossActive = true;
              spawnEnemy("boss", this.CANVAS_W + 20, this.CANVAS_H / 2 - 30, 100);
            }
            if (this.bossActive && this.enemies.filter((e) => e.type === "boss").length === 0 && this.levelTimer > 1100) {
              this.gameOver = true;
              this.gameWon = true;
              if (this.statusEl) this.statusEl.textContent = `\u{1F389} KATAKIS BESIEGT! Punkte: ${this.pScore}`;
            }
          }
        }
        nextLevel() {
          this.level++;
          this.levelTimer = 0;
          this.levelEnemyTimer = 0;
          this.bossActive = false;
          this.levelTransition = 60;
          this.updateStatus();
          this.pHp = Math.min(this.pMaxHp, this.pHp + 2);
        }
        // =============================================
        // Collision Detection
        // =============================================
        checkCollisions() {
          for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
            const b = this.bullets[bi];
            if (b.type === "enemy") continue;
            for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
              const e = this.enemies[ei];
              if (this.rectsOverlap(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
                e.hp -= b.damage;
                this.bullets.splice(bi, 1);
                this.spawnExplosion(b.x, b.y, 5, "#ff0");
                if (e.hp <= 0) {
                  this.enemies.splice(ei, 1);
                  const pts = e.type === "boss" ? 200 : e.type === "turret" ? 50 : e.type === "bomber" ? 40 : 20;
                  this.pScore += pts;
                  this.spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, 20, "#f80");
                  this.spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, 15, "#ff0");
                  if (Math.random() < 0.15 || e.type === "boss") {
                    this.spawnPowerUpAt(e.x + e.w / 2, e.y + e.h / 2);
                  }
                  this.updateStatus();
                }
                break;
              }
            }
          }
          if (this.pInvincible <= 0) {
            for (const b of this.bullets) {
              if (b.type !== "enemy") continue;
              if (this.rectsOverlap(b.x, b.y, b.w, b.h, this.px, this.py, this.PLAYER_W, this.PLAYER_H)) {
                this.hitPlayer(b.damage);
                b.x = -100;
                break;
              }
            }
            for (const e of this.enemies) {
              if (this.rectsOverlap(e.x, e.y, e.w, e.h, this.px, this.py, this.PLAYER_W, this.PLAYER_H)) {
                this.hitPlayer(1);
                break;
              }
            }
            if (this.force.active) {
              for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
                const b = this.bullets[bi];
                if (b.type !== "enemy") continue;
                if (this.rectsOverlap(b.x, b.y, b.w, b.h, this.force.x, this.force.y, 24, 20)) {
                  this.bullets.splice(bi, 1);
                  this.spawnExplosion(b.x, b.y, 3, "#0af");
                }
              }
            }
          }
          for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            if (this.rectsOverlap(p.x, p.y, 20, 16, this.px, this.py, this.PLAYER_W, this.PLAYER_H)) {
              this.applyPowerUp(p.type);
              this.powerUps.splice(i, 1);
            }
          }
        }
        rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
          return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
        }
        hitPlayer(damage) {
          if (this.pInvincible > 0) return;
          this.pHp -= damage;
          this.pInvincible = 40;
          this.spawnExplosion(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2, 10, "#f00");
          this.updateStatus();
        }
        playerDeath() {
          this.pLives--;
          if (this.pLives <= 0) {
            this.gameOver = true;
            this.gameWon = false;
            this.spawnExplosion(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2, 40, "#f80");
            this.spawnExplosion(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2, 30, "#ff0");
            if (this.statusEl) {
              this.statusEl.textContent = `\u{1F480} GAME OVER! Punkte: ${this.pScore}`;
            }
          } else {
            this.px = 80;
            this.py = this.CANVAS_H / 2 - this.PLAYER_H / 2;
            this.pHp = this.pMaxHp;
            this.pInvincible = 90;
            this.updateStatus();
          }
        }
        applyPowerUp(type) {
          switch (type) {
            case "laser":
              this.pWeapon = "laser";
              break;
            case "spread":
              this.pWeapon = "spread";
              break;
            case "force":
              if (!this.force.active) {
                this.force.active = true;
                this.force.attached = true;
              }
              break;
            case "speed":
              this.pSpeed = Math.min(7, this.pSpeed + 1);
              break;
            case "health":
              this.pHp = Math.min(this.pMaxHp, this.pHp + 2);
              break;
          }
          this.updateStatus();
        }
        spawnPowerUpAt(x, y) {
          const types = ["laser", "spread", "force", "speed", "health"];
          this.powerUps.push({ x, y, type: types[Math.floor(Math.random() * types.length)] });
        }
        spawnExplosion(x, y, count, color) {
          for (let i = 0; i < count; i++) {
            this.particles.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 15 + Math.floor(Math.random() * 20),
              maxLife: 35,
              color,
              size: 2 + Math.random() * 4
            });
          }
        }
        // =============================================
        // Drawing
        // =============================================
        draw() {
          if (!this.ctx || !this.canvas) return;
          const ctx = this.ctx;
          const grad = ctx.createLinearGradient(0, 0, this.CANVAS_W, 0);
          if (this.level === 0) {
            grad.addColorStop(0, "#0a0a1a");
            grad.addColorStop(1, "#1a0a2a");
          } else if (this.level === 1) {
            grad.addColorStop(0, "#0a0a0a");
            grad.addColorStop(1, "#0a1a2a");
          } else if (this.level === 2) {
            grad.addColorStop(0, "#1a0a0a");
            grad.addColorStop(1, "#2a0a1a");
          } else {
            grad.addColorStop(0, "#0a0000");
            grad.addColorStop(1, "#1a0000");
          }
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
          for (const star of this.stars) {
            ctx.fillStyle = `rgba(255,255,255,${star.brightness * 0.6})`;
            ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1.5, 1.5);
          }
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.lineWidth = 1;
          for (let x = this.scrollX % 60; x < this.CANVAS_W; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.CANVAS_H);
            ctx.stroke();
          }
          for (const p of this.powerUps) {
            this.drawPowerUp(p);
          }
          for (const e of this.enemies) {
            this.drawEnemy(e);
          }
          if (this.force.active) {
            this.drawForce();
          }
          for (const b of this.bullets) {
            if (b.type === "enemy") continue;
            ctx.fillStyle = b.type === "force" ? "#0af" : "#0f0";
            ctx.shadowColor = b.type === "force" ? "#0af" : "#0f0";
            ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.shadowBlur = 0;
          }
          for (const b of this.bullets) {
            if (b.type !== "enemy") continue;
            ctx.fillStyle = "#f44";
            ctx.shadowColor = "#f44";
            ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.shadowBlur = 0;
          }
          if (!this.gameOver || this.pLives > 0) {
            this.drawPlayer();
          }
          for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          }
          ctx.globalAlpha = 1;
          if (this.levelTransition > 0) {
            this.levelTransition--;
            ctx.fillStyle = `rgba(255,255,255,${this.levelTransition / 60 * 0.3})`;
            ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 32px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`LEVEL ${this.level + 1}`, this.CANVAS_W / 2, this.CANVAS_H / 2);
          }
          if (this.gameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
            ctx.fillStyle = this.gameWon ? "#f1c40f" : "#e74c3c";
            ctx.font = "bold 40px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const msg = this.gameWon ? "\u{1F389} KATAKIS BESIEGT!" : "\u{1F480} GAME OVER";
            ctx.fillText(msg, this.CANVAS_W / 2, this.CANVAS_H / 2 - 20);
            ctx.font = "24px Segoe UI, sans-serif";
            ctx.fillStyle = "#fff";
            ctx.fillText(`Punkte: ${this.pScore}`, this.CANVAS_W / 2, this.CANVAS_H / 2 + 30);
          }
        }
        drawPlayer() {
          const ctx = this.ctx;
          if (this.pInvincible > 0 && Math.floor(this.pInvincible / 4) % 2 === 0) return;
          const x = this.px;
          const y = this.py;
          ctx.shadowColor = "#0af";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#0af";
          ctx.beginPath();
          ctx.moveTo(x - 8, y + this.PLAYER_H / 2 - 4);
          ctx.lineTo(x - 16, y + this.PLAYER_H / 2);
          ctx.lineTo(x - 8, y + this.PLAYER_H / 2 + 4);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#4a9eff";
          ctx.shadowColor = "#4a9eff";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.moveTo(x + this.PLAYER_W, y + this.PLAYER_H / 2);
          ctx.lineTo(x + this.PLAYER_W - 10, y + 2);
          ctx.lineTo(x + 4, y + 4);
          ctx.lineTo(x, y + this.PLAYER_H / 2 - 2);
          ctx.lineTo(x, y + this.PLAYER_H / 2 + 2);
          ctx.lineTo(x + 4, y + this.PLAYER_H - 4);
          ctx.lineTo(x + this.PLAYER_W - 10, y + this.PLAYER_H - 2);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#8cf";
          ctx.beginPath();
          ctx.ellipse(x + this.PLAYER_W - 14, y + this.PLAYER_H / 2, 5, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#6ab0ff";
          ctx.fillRect(x + 4, y + 4, 8, 3);
          ctx.fillRect(x + 4, y + this.PLAYER_H - 7, 8, 3);
          const hpW = this.PLAYER_W;
          const hpH = 3;
          ctx.fillStyle = "#333";
          ctx.fillRect(x, y - 8, hpW, hpH);
          ctx.fillStyle = this.pHp > 2 ? "#0f0" : "#f00";
          ctx.fillRect(x, y - 8, hpW * (this.pHp / this.pMaxHp), hpH);
        }
        drawEnemy(e) {
          const ctx = this.ctx;
          switch (e.type) {
            case "fighter": {
              ctx.fillStyle = "#e74c3c";
              ctx.shadowColor = "#e74c3c";
              ctx.shadowBlur = 4;
              ctx.beginPath();
              ctx.moveTo(e.x, e.y + e.h / 2);
              ctx.lineTo(e.x + e.w - 6, e.y + 2);
              ctx.lineTo(e.x + e.w, e.y + e.h / 2);
              ctx.lineTo(e.x + e.w - 6, e.y + e.h - 2);
              ctx.closePath();
              ctx.fill();
              ctx.fillStyle = "#ff8";
              ctx.fillRect(e.x + e.w - 10, e.y + e.h / 2 - 3, 5, 6);
              ctx.shadowBlur = 0;
              break;
            }
            case "bomber": {
              ctx.fillStyle = "#9b59b6";
              ctx.shadowColor = "#9b59b6";
              ctx.shadowBlur = 4;
              ctx.fillRect(e.x, e.y, e.w, e.h);
              ctx.fillStyle = "#c39bd3";
              ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
              ctx.fillStyle = "#8e44ad";
              ctx.fillRect(e.x + e.w / 2 - 8, e.y - 6, 16, 6);
              ctx.fillRect(e.x + e.w / 2 - 8, e.y + e.h, 16, 6);
              ctx.shadowBlur = 0;
              break;
            }
            case "turret": {
              ctx.fillStyle = "#2ecc71";
              ctx.shadowColor = "#2ecc71";
              ctx.shadowBlur = 4;
              ctx.fillRect(e.x + 2, e.y + e.h / 2 - 12, e.w - 4, 24);
              ctx.fillStyle = "#27ae60";
              ctx.fillRect(e.x - 8, e.y + e.h / 2 - 3, 12, 6);
              ctx.shadowBlur = 0;
              break;
            }
            case "runner": {
              ctx.fillStyle = "#e67e22";
              ctx.shadowColor = "#e67e22";
              ctx.shadowBlur = 4;
              ctx.beginPath();
              ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#f39c12";
              ctx.beginPath();
              ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              break;
            }
            case "boss": {
              ctx.shadowColor = "#e74c3c";
              ctx.shadowBlur = 10;
              ctx.fillStyle = "#4a0a0a";
              ctx.fillRect(e.x, e.y, e.w, e.h);
              ctx.fillStyle = "#6a1a1a";
              ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, 12);
              ctx.fillRect(e.x + 4, e.y + e.h - 16, e.w - 8, 12);
              ctx.fillRect(e.x + 4, e.y + e.h / 2 - 4, e.w - 8, 8);
              ctx.fillStyle = "#f00";
              ctx.shadowColor = "#f00";
              ctx.shadowBlur = 15;
              ctx.beginPath();
              ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 12, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 4;
              ctx.fillStyle = "#888";
              ctx.fillRect(e.x - 8, e.y + 8, 12, 6);
              ctx.fillRect(e.x - 8, e.y + e.h - 14, 12, 6);
              ctx.shadowBlur = 0;
              const hpW = e.w;
              const hpH = 4;
              ctx.fillStyle = "#333";
              ctx.fillRect(e.x, e.y - 10, hpW, hpH);
              ctx.fillStyle = e.hp > e.maxHp * 0.5 ? "#0f0" : e.hp > e.maxHp * 0.25 ? "#ff0" : "#f00";
              ctx.fillRect(e.x, e.y - 10, hpW * (e.hp / e.maxHp), hpH);
              ctx.shadowBlur = 0;
              break;
            }
          }
          if (e.type !== "boss" && e.hp < e.maxHp) {
            ctx.fillStyle = "#333";
            ctx.fillRect(e.x, e.y - 5, e.w, 3);
            ctx.fillStyle = "#0f0";
            ctx.fillRect(e.x, e.y - 5, e.w * (e.hp / e.maxHp), 3);
          }
          ctx.shadowBlur = 0;
        }
        drawForce() {
          const ctx = this.ctx;
          const fx = this.force.x;
          const fy = this.force.y;
          const fw = 24;
          const fh = 20;
          if (this.force.attached) {
            ctx.fillStyle = "#0af";
            ctx.shadowColor = "#0af";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(fx + fw / 2, fy);
            ctx.lineTo(fx + fw, fy + fh / 2);
            ctx.lineTo(fx + fw / 2, fy + fh);
            ctx.lineTo(fx, fy + fh / 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#8df";
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(fx + fw / 2, fy + fh / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0,170,255,0.3)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(fx + fw / 2, fy + fh / 2);
            ctx.lineTo(this.px + this.PLAYER_W / 2, this.py + this.PLAYER_H / 2);
            ctx.stroke();
            ctx.setLineDash([]);
          } else {
            ctx.fillStyle = "#f80";
            ctx.shadowColor = "#f80";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(fx + fw / 2, fy);
            ctx.lineTo(fx + fw, fy + fh / 2);
            ctx.lineTo(fx + fw / 2, fy + fh);
            ctx.lineTo(fx, fy + fh / 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#fd8";
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(fx + fw / 2, fy + fh / 2, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
        drawPowerUp(p) {
          const ctx = this.ctx;
          const x = p.x;
          const y = p.y;
          const bob = Math.sin(Date.now() * 5e-3) * 2;
          ctx.shadowBlur = 10;
          const colors = {
            laser: "#ff0",
            spread: "#0f0",
            force: "#0af",
            speed: "#f0f",
            health: "#f00"
          };
          const labels = {
            laser: "L",
            spread: "S",
            force: "F",
            speed: ">",
            health: "+"
          };
          ctx.fillStyle = colors[p.type];
          ctx.shadowColor = colors[p.type];
          ctx.fillRect(x, y + bob, 18, 14);
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#000";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labels[p.type], x + 9, y + 7 + bob);
        }
        // =============================================
        // Status
        // =============================================
        updateStatus() {
          if (!this.statusEl) return;
          const weaponNames = { basic: "Basic", laser: "Laser", spread: "Spread" };
          this.statusEl.textContent = `\u2764\uFE0F ${"\u2665".repeat(this.pHp)}${"\u2661".repeat(Math.max(0, this.pMaxHp - this.pHp))} | Leben: ${"\u{1F6F8}".repeat(this.pLives)} | Waffe: ${weaponNames[this.pWeapon]} | Punkte: ${this.pScore} | Level ${this.level + 1}/4`;
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
      init_MahjongGame();
      init_KatakisGame();
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
            ["pacman", new PacmanGame()],
            ["mahjong", new MahjongGame()],
            ["katakis", new KatakisGame()]
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
            "pacman",
            "mahjong",
            "katakis"
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
            "pacman": "Pacman",
            "mahjong": "Mahjong",
            "katakis": "Katakis"
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
            "pacman": "pacmanContainer",
            "mahjong": "mahjongContainer",
            "katakis": "katakisContainer"
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
            "pacman": "btnPacman",
            "mahjong": "btnMahjong",
            "katakis": "btnKatakis"
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
              case "katakis":
                this.getActiveGame().handleKeyDown(e);
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
              case "katakis":
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
        window.__gameRegistry = registry;
        registry.initDefault();
      });
    }
  });
  require_main();
})();
//# sourceMappingURL=script.js.map

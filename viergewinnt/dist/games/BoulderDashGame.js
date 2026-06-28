// Boulder Dash cell types
const BD_EMPTY_CHAR = 0;
const BD_PLAYER_CHAR = 1;
const BD_WALL_CHAR = 2;
const BD_DIRT_CHAR = 3;
const BD_BOULDER_CHAR = 4;
const BD_DIAMOND_CHAR = 5;
const BD_EXIT_CHAR = 7;
const BD_LEVELS = [
    { name: '🏕️ First Dig', target: 3, wallBlocks: 2, boulderCount: 3, diamondCount: 8 },
    { name: '🕳️ Wider Cavern', target: 5, wallBlocks: 4, boulderCount: 5, diamondCount: 10 },
    { name: '🪨 Rock Garden', target: 7, wallBlocks: 5, boulderCount: 8, diamondCount: 12 },
    { name: '✝️ The Cross', target: 8, wallBlocks: 8, boulderCount: 10, diamondCount: 14 },
    { name: '🌀 Labyrinth', target: 10, wallBlocks: 10, boulderCount: 12, diamondCount: 15 },
    { name: '🌊 Underground Lake', target: 10, wallBlocks: 10, boulderCount: 14, diamondCount: 16 },
    { name: '💎 Treasure Room', target: 12, wallBlocks: 11, boulderCount: 14, diamondCount: 18 },
    { name: '🧱 The Squeeze', target: 13, wallBlocks: 12, boulderCount: 16, diamondCount: 18 },
    { name: '💀 Cavern of Doom', target: 15, wallBlocks: 14, boulderCount: 18, diamondCount: 20 },
    { name: '👑 The Final Frontier', target: 18, wallBlocks: 16, boulderCount: 20, diamondCount: 24 },
];
const BD_TOTAL_LEVELS = BD_LEVELS.length;
export class BoulderDashGame {
    constructor() {
        this.id = 'boulderDash';
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
        this.resetBdBtn = document.getElementById('resetBdBtn');
        this.bdCanvas = document.getElementById('bdCanvas');
        this.bdStatusElement = document.getElementById('bdStatus');
        this.bdLevelDisplay = document.getElementById('bdLevelDisplay');
        this.bdLevelName = document.getElementById('bdLevelName');
        this.bdPrevLevelBtn = document.getElementById('bdPrevLevelBtn');
        this.bdNextLevelBtn = document.getElementById('bdNextLevelBtn');
        this.bdBtnUp = document.getElementById('bdBtnUp');
        this.bdBtnDown = document.getElementById('bdBtnDown');
        this.bdBtnLeft = document.getElementById('bdBtnLeft');
        this.bdBtnRight = document.getElementById('bdBtnRight');
        this.ctx = this.bdCanvas ? this.bdCanvas.getContext('2d') : null;
        this.setupEventListeners();
        this.setupMobileControls();
    }
    setupEventListeners() {
        if (this.resetBdBtn) {
            this.resetBdBtn.addEventListener('click', () => this.startLevel(this.currentLevelIndex));
        }
        if (this.bdPrevLevelBtn) {
            this.bdPrevLevelBtn.addEventListener('click', () => this.prevLevel());
        }
        if (this.bdNextLevelBtn) {
            this.bdNextLevelBtn.addEventListener('click', () => this.nextLevel());
        }
    }
    init() {
        this.score = 0;
        this.currentLevelIndex = 0;
        this.startLevel(0);
    }
    startLevel(levelIndex) {
        if (levelIndex < 0 || levelIndex >= BD_TOTAL_LEVELS)
            return;
        if (this.interval)
            clearInterval(this.interval);
        this.currentLevelIndex = levelIndex;
        this.collectedDiamonds = 0;
        this.totalDiamonds = 0;
        this.gameOver = false;
        this.won = false;
        this.levelFinished = false;
        this.exitRevealed = false;
        if (this.levelTimeout) {
            clearTimeout(this.levelTimeout);
            this.levelTimeout = undefined;
        }
        const levelDef = BD_LEVELS[levelIndex];
        this.generateCave(levelDef);
        // Find player position
        for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
                if (this.board[y][x] === BD_PLAYER_CHAR) {
                    this.playerX = x;
                    this.playerY = y;
                }
            }
        }
        // Count total diamonds
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
            this.interval = undefined;
        }
        if (this.levelTimeout) {
            clearTimeout(this.levelTimeout);
            this.levelTimeout = undefined;
        }
    }
    handleKey(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.movePlayer(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.movePlayer(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.movePlayer(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
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
        // Border walls
        for (let x = 0; x < this.BD_SIZE; x++) {
            this.board[0][x] = BD_WALL_CHAR;
            this.board[this.BD_SIZE - 1][x] = BD_WALL_CHAR;
        }
        for (let y = 0; y < this.BD_SIZE; y++) {
            this.board[y][0] = BD_WALL_CHAR;
            this.board[y][this.BD_SIZE - 1] = BD_WALL_CHAR;
        }
        // Wall blocks (2x2 clusters) – more = harder
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
        // Boulders – more = harder
        const boulderVariation = Math.max(1, Math.floor(levelDef.boulderCount * 0.3));
        const numBoulders = levelDef.boulderCount + Math.floor(Math.random() * boulderVariation);
        for (let i = 0; i < numBoulders; i++) {
            const x = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            const y = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            if (this.board[y][x] === BD_DIRT_CHAR) {
                this.board[y][x] = BD_BOULDER_CHAR;
            }
        }
        // Diamonds – more available than needed
        const diamondVariation = Math.max(1, Math.floor(levelDef.diamondCount * 0.25));
        const numDiamonds = levelDef.diamondCount + Math.floor(Math.random() * diamondVariation);
        for (let i = 0; i < numDiamonds; i++) {
            const x = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            const y = 1 + Math.floor(Math.random() * (this.BD_SIZE - 2));
            if (this.board[y][x] === BD_DIRT_CHAR) {
                this.board[y][x] = BD_DIAMOND_CHAR;
            }
        }
        // Player starts at a safe corner position
        this.board[2][2] = BD_PLAYER_CHAR;
        this.playerX = 2;
        this.playerY = 2;
        // Exit in the opposite corner – the door the player must reach
        this.exitX = this.BD_SIZE - 3;
        this.exitY = this.BD_SIZE - 3;
        if (this.board[this.exitY][this.exitX] === BD_DIRT_CHAR) {
            this.board[this.exitY][this.exitX] = BD_EXIT_CHAR;
        }
        else {
            // If the spot is occupied, search for a free spot near the corner
            for (let dy = -2; dy <= 0; dy++) {
                for (let dx = -2; dx <= 0; dx++) {
                    const tryX = this.BD_SIZE - 3 + dx;
                    const tryY = this.BD_SIZE - 3 + dy;
                    if (tryX > 1 && tryY > 1 && this.board[tryY][tryX] === BD_DIRT_CHAR) {
                        this.exitX = tryX;
                        this.exitY = tryY;
                        this.board[tryY][tryX] = BD_EXIT_CHAR;
                        dy = -99;
                        dx = -99; // break both loops
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
                    this.bdStatusElement.textContent = `🏆 Alle Level geschafft! 🏆  💎 ${this.collectedDiamonds}  Punkte: ${this.score}`;
                }
                else {
                    this.bdStatusElement.textContent = `🚪 Ausgang erreicht! 💎 ${this.collectedDiamonds}  Punkte: ${this.score}  —  Weiter zum nächsten Level ...`;
                }
            }
            else if (this.gameOver) {
                this.bdStatusElement.textContent = `💀 Game Over! Level ${this.currentLevelIndex + 1}: ${levelDef.name}  💎 ${this.collectedDiamonds}`;
            }
            else if (this.exitRevealed) {
                this.bdStatusElement.textContent = `🚪 Der Ausgang ist offen! Finde ihn!  💎 ${this.collectedDiamonds}/${levelDef.target}  Punkte: ${this.score}`;
            }
            else {
                this.bdStatusElement.textContent = `Level ${this.currentLevelIndex + 1}/${BD_TOTAL_LEVELS}  💎 ${this.collectedDiamonds}/${levelDef.target}  Punkte: ${this.score}`;
            }
        }
        // Update level display
        if (this.bdLevelDisplay) {
            this.bdLevelDisplay.textContent = `Level ${this.currentLevelIndex + 1}/${BD_TOTAL_LEVELS}`;
        }
        if (this.bdLevelName) {
            this.bdLevelName.textContent = BD_LEVELS[this.currentLevelIndex].name;
        }
    }
    updateLevelButtons() {
        if (this.bdPrevLevelBtn) {
            this.bdPrevLevelBtn.classList.toggle('disabled', this.currentLevelIndex <= 0);
        }
        if (this.bdNextLevelBtn) {
            this.bdNextLevelBtn.classList.toggle('disabled', this.currentLevelIndex >= BD_TOTAL_LEVELS - 1);
        }
    }
    draw() {
        if (!this.ctx || !this.bdCanvas)
            return;
        const cs = this.BD_CELL_SIZE;
        this.ctx.clearRect(0, 0, this.bdCanvas.width, this.bdCanvas.height);
        for (let y = 0; y < this.BD_SIZE; y++) {
            for (let x = 0; x < this.BD_SIZE; x++) {
                const cell = this.board[y][x];
                const px = x * cs;
                const py = y * cs;
                switch (cell) {
                    case BD_EMPTY_CHAR:
                        this.ctx.fillStyle = '#1a1a2e';
                        this.ctx.fillRect(px, py, cs, cs);
                        break;
                    case BD_WALL_CHAR:
                        this.ctx.fillStyle = '#555';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.strokeStyle = '#777';
                        this.ctx.strokeRect(px, py, cs, cs);
                        break;
                    case BD_DIRT_CHAR:
                        this.ctx.fillStyle = '#8B4513';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#A0522D';
                        this.ctx.fillRect(px + 4, py + 4, 3, 3);
                        this.ctx.fillRect(px + 12, py + 10, 3, 3);
                        this.ctx.fillRect(px + 7, py + 15, 3, 3);
                        break;
                    case BD_BOULDER_CHAR:
                        this.ctx.fillStyle = '#888';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#aaa';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 6, py + 6, 5, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillStyle = '#666';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 14, py + 14, 5, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case BD_DIAMOND_CHAR:
                        this.ctx.fillStyle = '#00ffff';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#00ced1';
                        this.ctx.beginPath();
                        this.ctx.moveTo(px + 10, py + 2);
                        this.ctx.lineTo(px + 18, py + 10);
                        this.ctx.lineTo(px + 10, py + 18);
                        this.ctx.lineTo(px + 2, py + 10);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.strokeStyle = '#fff';
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                        this.ctx.lineWidth = 1;
                        break;
                    case BD_PLAYER_CHAR:
                        this.ctx.fillStyle = '#1a1a2e';
                        this.ctx.fillRect(px, py, cs, cs);
                        this.ctx.fillStyle = '#ffd700';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 10, py + 10, 7, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillStyle = '#000';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 8, py + 8, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.beginPath();
                        this.ctx.arc(px + 12, py + 8, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.strokeStyle = '#000';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 10, py + 12, 3, 0, Math.PI);
                        this.ctx.stroke();
                        break;
                    case BD_EXIT_CHAR:
                        if (this.exitRevealed) {
                            // Open door – bright golden glow
                            this.ctx.fillStyle = '#1a1a2e';
                            this.ctx.fillRect(px, py, cs, cs);
                            this.ctx.fillStyle = '#ffd700';
                            this.ctx.fillRect(px + 3, py + 3, cs - 6, cs - 6);
                            this.ctx.fillStyle = '#fff8dc';
                            this.ctx.font = '14px monospace';
                            this.ctx.fillText('🚪', px + 2, py + 16);
                            // Glow pulse effect
                            this.ctx.strokeStyle = 'rgba(255,215,0,0.6)';
                            this.ctx.lineWidth = 2;
                            this.ctx.strokeRect(px + 1, py + 1, cs - 2, cs - 2);
                            this.ctx.lineWidth = 1;
                        }
                        else {
                            // Locked door – dark with lock
                            this.ctx.fillStyle = '#1a1a2e';
                            this.ctx.fillRect(px, py, cs, cs);
                            this.ctx.fillStyle = '#4a3728';
                            this.ctx.fillRect(px + 2, py + 4, cs - 4, cs - 6);
                            this.ctx.fillStyle = '#b8860b';
                            this.ctx.font = '12px monospace';
                            this.ctx.fillText('🔒', px + 3, py + 16);
                            this.ctx.strokeStyle = '#b8860b';
                            this.ctx.strokeRect(px + 2, py + 4, cs - 4, cs - 6);
                        }
                        break;
                }
            }
        }
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
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
        if (this.gameOver || this.won)
            return;
        const nx = this.playerX + dx;
        const ny = this.playerY + dy;
        if (nx < 1 || nx >= this.BD_SIZE - 1 || ny < 1 || ny >= this.BD_SIZE - 1)
            return;
        const target = this.board[ny][nx];
        if (target === BD_WALL_CHAR || target === BD_BOULDER_CHAR)
            return;
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
            // Walk onto the exit tile
            this.board[this.playerY][this.playerX] = BD_EMPTY_CHAR;
            this.playerX = nx;
            this.playerY = ny;
            this.board[ny][nx] = BD_PLAYER_CHAR;
            this.draw();
            if (this.exitRevealed) {
                // Enough diamonds collected and exit is open → WIN!
                this.winLevel();
            }
            else {
                this.updateStatus();
            }
            return;
        }
    }
    updatePhysics() {
        if (this.gameOver || this.won)
            return;
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
                            if (this.interval)
                                clearInterval(this.interval);
                            this.draw();
                            return;
                        }
                        this.board[y + 1][x] = BD_BOULDER_CHAR;
                        this.board[y][x] = BD_EMPTY_CHAR;
                    }
                    else if (below === BD_WALL_CHAR || below === BD_BOULDER_CHAR) {
                        const canRollLeft = (x > 1 && (this.board[y + 1][x - 1] === BD_WALL_CHAR || this.board[y + 1][x - 1] === BD_BOULDER_CHAR) && (this.board[y][x - 1] === BD_EMPTY_CHAR || this.board[y][x - 1] === BD_PLAYER_CHAR));
                        const canRollRight = (x < this.BD_SIZE - 2 && (this.board[y + 1][x + 1] === BD_WALL_CHAR || this.board[y + 1][x + 1] === BD_BOULDER_CHAR) && (this.board[y][x + 1] === BD_EMPTY_CHAR || this.board[y][x + 1] === BD_PLAYER_CHAR));
                        if (canRollLeft) {
                            if (y === this.playerY && x - 1 === this.playerX) {
                                this.board[y][x] = BD_EMPTY_CHAR;
                                this.board[y][x - 1] = BD_BOULDER_CHAR;
                                this.gameOver = true;
                                this.updateStatus();
                                if (this.interval)
                                    clearInterval(this.interval);
                                this.draw();
                                return;
                            }
                            this.board[y][x - 1] = BD_BOULDER_CHAR;
                            this.board[y][x] = BD_EMPTY_CHAR;
                        }
                        else if (canRollRight) {
                            if (y === this.playerY && x + 1 === this.playerX) {
                                this.board[y][x] = BD_EMPTY_CHAR;
                                this.board[y][x + 1] = BD_BOULDER_CHAR;
                                this.gameOver = true;
                                this.updateStatus();
                                if (this.interval)
                                    clearInterval(this.interval);
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
        if (this.levelFinished || this.won || this.gameOver)
            return;
        const levelDef = BD_LEVELS[this.currentLevelIndex];
        if (this.collectedDiamonds >= levelDef.target && !this.exitRevealed) {
            // Enough diamonds collected → reveal the exit!
            this.exitRevealed = true;
            this.score += 20;
            this.updateStatus();
            this.draw();
            // If player is already standing on the exit, win immediately
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
            this.interval = undefined;
        }
        this.draw();
        this.levelFinished = true;
        this.levelTimeout = setTimeout(() => {
            const nextIdx = this.currentLevelIndex + 1;
            if (nextIdx < BD_TOTAL_LEVELS) {
                this.startLevel(nextIdx);
            }
            else {
                this.updateStatus();
            }
        }, 2000);
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
            if (!btn)
                return;
            const action = () => {
                this.movePlayer(dx, dy);
                this.draw();
                this.checkWinCondition();
            };
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); });
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); action(); });
        };
        addBdControl(this.bdBtnUp, 0, -1);
        addBdControl(this.bdBtnDown, 0, 1);
        addBdControl(this.bdBtnLeft, -1, 0);
        addBdControl(this.bdBtnRight, 1, 0);
    }
}
//# sourceMappingURL=BoulderDashGame.js.map
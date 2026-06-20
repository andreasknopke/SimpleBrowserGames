import { Game, GameId, Position } from '../types/common';

interface PacmanState {
    x: number;
    y: number;
    dir: { x: number; y: number };
    nextDir: { x: number; y: number };
    mouthAngle: number;
    mouthOpening: boolean;
}

interface GhostState {
    x: number;
    y: number;
    dir: { x: number; y: number };
    color: string;
    mode: 'scatter' | 'chase' | 'frightened' | 'eaten';
    target: { x: number; y: number };
    inHouse: boolean;
    houseTimer: number;
}

export class PacmanGame implements Game {
    public readonly id: GameId = 'pacman';

    private readonly PM_COLS: number = 28;
    private readonly PM_ROWS: number = 31;
    private readonly PM_CELL: number = 16;
    private readonly PM_SPEED: number = 2;
    private readonly PM_GHOST_SPEED: number = 1;
    private readonly PM_FRIGHTENED_DURATION: number = 8000;
    private readonly PM_FRIGHTENED_SPEED: number = 1;

    private readonly PM_MAZE_TEMPLATE: number[][] = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
        [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
        [1,2,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,2,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1],
        [1,3,2,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,3,1],
        [1,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,1],
        [1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    private pmMaze: number[][] = [];
    private pmPacman: PacmanState = { x: 0, y: 0, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouthAngle: 0, mouthOpening: true };
    private pmGhosts: GhostState[] = [];
    private pmScore: number = 0;
    private pmLives: number = 3;
    private pmGameOver: boolean = false;
    private pmWon: boolean = false;
    private pmFrightenedTimer: number = 0;
    private pmTotalPellets: number = 0;
    private pmAnimFrame: number = 0;

    private pacmanInterval: ReturnType<typeof setInterval> | undefined;
    private resetPacmanBtn: HTMLElement | null = null;
    private pacmanCanvas: HTMLCanvasElement | null = null;
    private pacmanStatus: HTMLElement | null = null;

    constructor() {
        this.resetPacmanBtn = document.getElementById('resetPacmanBtn');
        this.pacmanCanvas = document.getElementById('pacmanCanvas') as HTMLCanvasElement | null;
        this.pacmanStatus = document.getElementById('pacmanStatus');

        this.setupEventListeners();
        this.setupMobileControls();
    }

    private setupEventListeners(): void {
        if (this.resetPacmanBtn) {
            this.resetPacmanBtn.addEventListener('click', () => this.init());
        }
    }

    public init(): void {
        if (this.pacmanInterval) clearInterval(this.pacmanInterval);

        this.pmMaze = this.PM_MAZE_TEMPLATE.map(row => [...row]);
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

        this.pacmanInterval = setInterval(() => this.update(), 1000 / 60);
    }

    public cleanup(): void {
        if (this.pacmanInterval) {
            clearInterval(this.pacmanInterval);
            this.pacmanInterval = undefined;
        }
    }

    public handleKey(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                this.pmPacman.nextDir = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'ArrowDown': case 's': case 'S':
                this.pmPacman.nextDir = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'ArrowLeft': case 'a': case 'A':
                this.pmPacman.nextDir = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'ArrowRight': case 'd': case 'D':
                this.pmPacman.nextDir = { x: 1, y: 0 };
                e.preventDefault();
                break;
        }
    }

    private resetPositions(): void {
        this.pmPacman = {
            x: 14 * this.PM_CELL,
            y: 23 * this.PM_CELL,
            dir: { x: 0, y: 0 },
            nextDir: { x: 0, y: 0 },
            mouthAngle: 0,
            mouthOpening: true
        };

        const ghostColors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
        const ghostStartPositions = [
            { x: 14, y: 11 },
            { x: 13, y: 14 },
            { x: 14, y: 14 },
            { x: 15, y: 14 },
        ];

        this.pmGhosts = ghostColors.map((color, i) => ({
            x: ghostStartPositions[i].x * this.PM_CELL,
            y: ghostStartPositions[i].y * this.PM_CELL,
            dir: { x: 0, y: -1 },
            color: color,
            mode: i === 0 ? 'chase' : 'scatter',
            target: { x: 0, y: 0 },
            inHouse: i > 0,
            houseTimer: i * 120,
        }));
    }

    private update(): void {
        if (this.pmGameOver || this.pmWon) return;

        this.pmAnimFrame++;
        this.updatePacmanPosition();
        this.pmGhosts.forEach((ghost, i) => this.updateGhost(ghost, i));
        this.checkCollisions();

        if (this.pmFrightenedTimer > 0) {
            this.pmFrightenedTimer--;
            if (this.pmFrightenedTimer <= 0) {
                this.pmGhosts.forEach(g => {
                    if (g.mode === 'frightened') g.mode = 'chase';
                });
            }
        }

        this.draw();
    }

    private updatePacmanPosition(): void {
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
                    p.dir = { ...p.nextDir };
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
                this.pmFrightenedTimer = this.PM_FRIGHTENED_DURATION / (1000 / 60);
                this.pmGhosts.forEach(g => {
                    if (g.mode !== 'eaten') {
                        g.mode = 'frightened';
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
            if (this.pacmanStatus) this.pacmanStatus.textContent = '🎉 Gewonnen! Alle Pellets gesammelt!';
        }

        if (this.pmAnimFrame % 4 === 0) {
            p.mouthOpening = !p.mouthOpening;
        }

        this.updateStatus();
    }

    private updateGhost(ghost: GhostState, _index: number): void {
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

        const speed = ghost.mode === 'frightened' ? this.PM_FRIGHTENED_SPEED : this.PM_GHOST_SPEED;

        const gridX = Math.round(ghost.x / this.PM_CELL) * this.PM_CELL;
        const gridY = Math.round(ghost.y / this.PM_CELL) * this.PM_CELL;
        const aligned = Math.abs(ghost.x - gridX) < speed && Math.abs(ghost.y - gridY) < speed;

        if (aligned) {
            ghost.x = gridX;
            ghost.y = gridY;

            const col = Math.round(ghost.x / this.PM_CELL);
            const row = Math.round(ghost.y / this.PM_CELL);

            const dirs = [
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: -1, y: 0 }, { x: 1, y: 0 }
            ];

            const validDirs = dirs.filter(d => {
                if (d.x === -ghost.dir.x && d.y === -ghost.dir.y && ghost.mode !== 'frightened') return false;

                const nc = col + d.x;
                const nr = row + d.y;
                if (nc < 0 || nc >= this.PM_COLS || nr < 0 || nr >= this.PM_ROWS) return true;
                return this.pmMaze[nr][nc] !== 1;
            });

            if (validDirs.length > 0) {
                if (ghost.mode === 'frightened') {
                    ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                } else {
                    let bestDir = validDirs[0];
                    let bestDist = Infinity;

                    validDirs.forEach(d => {
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

    private checkCollisions(): void {
        const p = this.pmPacman;

        this.pmGhosts.forEach(ghost => {
            if (ghost.inHouse) return;

            const dist = Math.sqrt(Math.pow(p.x - ghost.x, 2) + Math.pow(p.y - ghost.y, 2));

            if (dist < this.PM_CELL) {
                if (ghost.mode === 'frightened') {
                    ghost.mode = 'eaten';
                    ghost.x = 14 * this.PM_CELL;
                    ghost.y = 14 * this.PM_CELL;
                    ghost.inHouse = true;
                    ghost.houseTimer = 60;
                    this.pmScore += 200;
                } else if (ghost.mode !== 'eaten') {
                    this.pmLives--;
                    if (this.pmLives <= 0) {
                        this.pmGameOver = true;
                        if (this.pacmanStatus) this.pacmanStatus.textContent = `💀 Game Over! Punkte: ${this.pmScore}`;
                    } else {
                        this.resetPositions();
                        if (this.pacmanStatus) this.pacmanStatus.textContent = `Punkte: ${this.pmScore} | Leben: ${this.pmLives}`;
                    }
                }
            }
        });
    }

    private draw(): void {
        if (!this.pacmanCanvas || !this.pacmanCanvas.getContext) return;
        const ctx = this.pacmanCanvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.pacmanCanvas.width, this.pacmanCanvas.height);

        for (let r = 0; r < this.PM_ROWS; r++) {
            for (let c = 0; c < this.PM_COLS; c++) {
                const tile = this.pmMaze[r][c];
                const x = c * this.PM_CELL;
                const y = r * this.PM_CELL;

                if (tile === 1) {
                    ctx.fillStyle = '#2121de';
                    ctx.fillRect(x, y, this.PM_CELL, this.PM_CELL);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(x + 2, y + 2, this.PM_CELL - 4, this.PM_CELL - 4);
                    ctx.strokeStyle = '#2121de';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x + 2, y + 2, this.PM_CELL - 4, this.PM_CELL - 4);
                } else if (tile === 2) {
                    ctx.fillStyle = '#ffb8ae';
                    ctx.beginPath();
                    ctx.arc(x + this.PM_CELL / 2, y + this.PM_CELL / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === 3) {
                    if (this.pmAnimFrame % 20 < 10) {
                        ctx.fillStyle = '#ffb8ae';
                        ctx.beginPath();
                        ctx.arc(x + this.PM_CELL / 2, y + this.PM_CELL / 2, 6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (tile === 4) {
                    ctx.fillStyle = '#000';
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
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(0, 0, this.PM_CELL / 2 - 1, mouthAngle, Math.PI * 2 - mouthAngle);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.restore();

        this.pmGhosts.forEach(ghost => {
            const gx = ghost.x + this.PM_CELL / 2;
            const gy = ghost.y + this.PM_CELL / 2;

            let color = ghost.color;
            if (ghost.mode === 'frightened') {
                color = this.pmFrightenedTimer < 120 && this.pmAnimFrame % 10 < 5 ? '#fff' : '#2121de';
            } else if (ghost.mode === 'eaten') {
                color = '#333';
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

            if (ghost.mode !== 'eaten') {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(gx - 3, gy - 3, 3, 0, Math.PI * 2);
                ctx.arc(gx + 3, gy - 3, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#00f';
                ctx.beginPath();
                ctx.arc(gx - 2 + ghost.dir.x * 1.5, gy - 3 + ghost.dir.y * 1.5, 1.5, 0, Math.PI * 2);
                ctx.arc(gx + 4 + ghost.dir.x * 1.5, gy - 3 + ghost.dir.y * 1.5, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    private updateStatus(): void {
        if (this.pacmanStatus && !this.pmGameOver && !this.pmWon) {
            this.pacmanStatus.textContent = `Punkte: ${this.pmScore} | Leben: ${this.pmLives}`;
        }
    }

    private setupMobileControls(): void {
        const btnUp = document.getElementById('pacmanBtnUp');
        const btnDown = document.getElementById('pacmanBtnDown');
        const btnLeft = document.getElementById('pacmanBtnLeft');
        const btnRight = document.getElementById('pacmanBtnRight');

        if (btnUp) btnUp.addEventListener('click', () => { this.pmPacman.nextDir = { x: 0, y: -1 }; });
        if (btnDown) btnDown.addEventListener('click', () => { this.pmPacman.nextDir = { x: 0, y: 1 }; });
        if (btnLeft) btnLeft.addEventListener('click', () => { this.pmPacman.nextDir = { x: -1, y: 0 }; });
        if (btnRight) btnRight.addEventListener('click', () => { this.pmPacman.nextDir = { x: 1, y: 0 }; });
    }
}

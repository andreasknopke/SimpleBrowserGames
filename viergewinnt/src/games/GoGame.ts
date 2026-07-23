import { Game, GameId, GameMode } from '../types/common';

// =============================================
// Types
// =============================================

type StoneColor = 'black' | 'white' | 'empty';
type Board = StoneColor[][];

interface GoMove {
    row: number;
    col: number;
    color: StoneColor;
}

// =============================================
// MCTS Node
// =============================================

interface MctsNode {
    row: number;
    col: number;
    player: StoneColor;
    visits: number;
    wins: number;
    children: MctsNode[];
    parent: MctsNode | null;
    board: Board;
    ko: { row: number; col: number } | null;
    unvisited: { row: number; col: number }[];
}

// =============================================
// Main Game Class
// =============================================

export class GoGame implements Game {
    public readonly id: GameId = 'go';

    private readonly BOARD_SIZE: number = 9;
    private readonly CELL_SIZE: number = 40;
    private readonly MARGIN: number = 20;
    private readonly LINE_COUNT: number = this.BOARD_SIZE - 1;

    private board: Board = [];
    private currentPlayer: StoneColor = 'black';
    private gameOver: boolean = false;
    private moveHistory: GoMove[] = [];
    private koPoint: { row: number; col: number } | null = null;
    private lastBoard: Board | null = null;
    private gameMode: GameMode = '2p';

    private blackCaptured: number = 0;
    private whiteCaptured: number = 0;
    private blackTerritory: number = 0;
    private whiteTerritory: number = 0;

    private resetGoBtn: HTMLElement | null = null;
    private goStatusElement: HTMLElement | null = null;
    private goBoardElement: HTMLElement | null = null;
    private goCanvas: HTMLCanvasElement | null = null;
    private goPassBtn: HTMLElement | null = null;
    private goUndoBtn: HTMLElement | null = null;
    private goModeSelect: HTMLSelectElement | null = null;

    private ctx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.resetGoBtn = document.getElementById('resetGoBtn');
        this.goStatusElement = document.getElementById('goStatus');
        this.goBoardElement = document.getElementById('goBoard');
        this.goCanvas = document.getElementById('goCanvas') as HTMLCanvasElement | null;
        this.goPassBtn = document.getElementById('goPassBtn');
        this.goUndoBtn = document.getElementById('goUndoBtn');
        this.goModeSelect = document.getElementById('goMode') as HTMLSelectElement | null;

        this.ctx = this.goCanvas ? this.goCanvas.getContext('2d') : null;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (this.resetGoBtn) {
            this.resetGoBtn.addEventListener('click', () => this.init());
        }
        if (this.goPassBtn) {
            this.goPassBtn.addEventListener('click', () => this.pass());
        }
        if (this.goUndoBtn) {
            this.goUndoBtn.addEventListener('click', () => this.undo());
        }
        if (this.goModeSelect) {
            this.goModeSelect.addEventListener('change', () => {
                this.gameMode = this.goModeSelect!.value as GameMode;
                this.init();
            });
        }
        if (this.goCanvas) {
            this.goCanvas.addEventListener('click', (e: MouseEvent) => this.handleCanvasClick(e));
        }
    }

    public init(): void {
        this.board = Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill('empty') as StoneColor[]
        );
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.koPoint = null;
        this.lastBoard = null;
        this.blackCaptured = 0;
        this.whiteCaptured = 0;
        this.blackTerritory = 0;
        this.whiteTerritory = 0;
        this.updateStatus();
        this.draw();
    }

    public cleanup(): void {
        // Nothing to clean up for Go (no intervals)
    }

    private handleCanvasClick(e: MouseEvent): void {
        if (this.gameOver || !this.goCanvas) return;

        // In 1p mode, only allow human (black) to click
        if (this.gameMode === '1p' && this.currentPlayer === 'white') return;

        const rect: DOMRect = this.goCanvas.getBoundingClientRect();
        const x: number = e.clientX - rect.left;
        const y: number = e.clientY - rect.top;

        // Adjust for margin to center the grid
        const adjustedX: number = x - this.MARGIN;
        const adjustedY: number = y - this.MARGIN;

        const col: number = Math.round(adjustedX / this.CELL_SIZE);
        const row: number = Math.round(adjustedY / this.CELL_SIZE);

        if (row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE) return;
        if (this.board[row][col] !== 'empty') return;

        if (this.makeMove(row, col)) {
            // If 1p mode and it's now the AI's turn, make AI move
            if (this.gameMode === '1p' && this.currentPlayer === 'white' && !this.gameOver) {
                setTimeout(() => this.makeAiMove(), 300);
            }
        }
    }

    private makeMove(row: number, col: number): boolean {
        if (this.gameOver) return false;

        // Check ko rule
        if (this.koPoint && this.koPoint.row === row && this.koPoint.col === col) {
            this.updateStatus('Ko-Verletzung! Wähle einen anderen Zug.');
            return false;
        }

        // Save board state for undo
        this.lastBoard = this.board.map(r => [...r]);

        // Place stone
        this.board[row][col] = this.currentPlayer;

        // Check for captures
        const opponent: StoneColor = this.currentPlayer === 'black' ? 'white' : 'black';
        const captured: { row: number; col: number }[] = [];

        // Check all adjacent opponent groups
        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const nr: number = row + dr;
            const nc: number = col + dc;
            if (nr >= 0 && nr < this.BOARD_SIZE && nc >= 0 && nc < this.BOARD_SIZE &&
                this.board[nr][nc] === opponent) {
                const group = this.getGroup(nr, nc);
                if (this.getLiberties(group) === 0) {
                    for (const stone of group.stones) {
                        this.board[stone.row][stone.col] = 'empty';
                        captured.push(stone);
                    }
                }
            }
        }

        // Update captured count
        if (this.currentPlayer === 'black') {
            this.whiteCaptured += captured.length;
        } else {
            this.blackCaptured += captured.length;
        }

        // Check for suicide (illegal move)
        const myGroup = this.getGroup(row, col);
        if (this.getLiberties(myGroup) === 0) {
            // Undo the move
            this.board = this.lastBoard.map(r => [...r]);
            this.updateStatus('Selbstmord ist illegal!');
            return false;
        }

        // Check for ko
        this.koPoint = null;
        if (captured.length === 1) {
            const capturedStone = captured[0];
            // Ko: single stone capture where the capturing stone would recreate the previous position
            const myLiberties = this.getLiberties(this.getGroup(row, col));
            if (myLiberties === 1) {
                this.koPoint = { row: capturedStone.row, col: capturedStone.col };
            }
        }

        // Record move
        this.moveHistory.push({ row, col, color: this.currentPlayer });

        // Switch player
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';

        this.updateStatus();
        this.draw();
        return true;
    }

    private getGroup(row: number, col: number): { stones: { row: number; col: number }[]; liberties: number } {
        const color: StoneColor = this.board[row][col];
        if (color === 'empty') return { stones: [], liberties: 0 };

        const visited: boolean[][] = Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill(false)
        );
        const stones: { row: number; col: number }[] = [];
        const libertiesSet: Set<string> = new Set();

        const queue: { row: number; col: number }[] = [{ row, col }];
        visited[row][col] = true;

        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length > 0) {
            const current = queue.shift()!;
            stones.push(current);

            for (const [dr, dc] of directions) {
                const nr: number = current.row + dr;
                const nc: number = current.col + dc;
                if (nr < 0 || nr >= this.BOARD_SIZE || nc < 0 || nc >= this.BOARD_SIZE) continue;

                if (this.board[nr][nc] === color && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    queue.push({ row: nr, col: nc });
                } else if (this.board[nr][nc] === 'empty') {
                    libertiesSet.add(`${nr},${nc}`);
                }
            }
        }

        return { stones, liberties: libertiesSet.size };
    }

    private getLiberties(group: { stones: { row: number; col: number }[]; liberties: number }): number {
        return group.liberties;
    }

    private pass(): void {
        if (this.gameOver) return;

        // Record pass
        this.moveHistory.push({ row: -1, col: -1, color: this.currentPlayer });

        // Check if both players passed consecutively
        const lastTwo: GoMove[] = this.moveHistory.slice(-2);
        if (lastTwo.length === 2 && lastTwo[0].row === -1 && lastTwo[1].row === -1) {
            this.endGame();
        } else {
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            this.updateStatus();

            // If 1p mode and it's now the AI's turn, make AI move
            if (this.gameMode === '1p' && this.currentPlayer === 'white' && !this.gameOver) {
                setTimeout(() => this.makeAiMove(), 300);
            }
        }
    }

    private undo(): void {
        if (this.moveHistory.length === 0) return;

        // Find the last actual move (not a pass)
        let lastMoveIdx: number = -1;
        for (let i = this.moveHistory.length - 1; i >= 0; i--) {
            if (this.moveHistory[i].row !== -1) {
                lastMoveIdx = i;
                break;
            }
        }

        if (lastMoveIdx === -1) return;

        // Restore board
        if (this.lastBoard) {
            this.board = this.lastBoard.map(r => [...r]);
        }

        // Remove the move and any passes after it
        this.moveHistory = this.moveHistory.slice(0, lastMoveIdx);

        // Switch back player
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';

        // Reset ko
        this.koPoint = null;
        this.lastBoard = null;

        // Recalculate captured stones
        this.recalculateCaptured();

        this.updateStatus();
        this.draw();
    }

    private recalculateCaptured(): void {
        this.blackCaptured = 0;
        this.whiteCaptured = 0;
        // Count stones on board
        let blackStones: number = 0;
        let whiteStones: number = 0;
        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                if (this.board[r][c] === 'black') blackStones++;
                else if (this.board[r][c] === 'white') whiteStones++;
            }
        }
        // Captured = (total moves by that color) - (stones currently on board)
        const blackMoves: number = this.moveHistory.filter(m => m.color === 'black' && m.row !== -1).length;
        const whiteMoves: number = this.moveHistory.filter(m => m.color === 'white' && m.row !== -1).length;
        this.blackCaptured = blackMoves - blackStones;
        this.whiteCaptured = whiteMoves - whiteStones;
    }

    private endGame(): void {
        this.gameOver = true;
        this.calculateTerritory();
        this.updateStatus();
        this.draw();
    }

    private calculateTerritory(): void {
        // Simple territory calculation: empty regions surrounded by one color
        const visited: boolean[][] = Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill(false)
        );

        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                if (this.board[r][c] !== 'empty' || visited[r][c]) continue;

                // BFS to find empty region
                const region: { row: number; col: number }[] = [];
                const borderColors: Set<StoneColor> = new Set();
                const queue: { row: number; col: number }[] = [{ row: r, col: c }];
                visited[r][c] = true;

                while (queue.length > 0) {
                    const current = queue.shift()!;
                    region.push(current);

                    for (const [dr, dc] of directions) {
                        const nr: number = current.row + dr;
                        const nc: number = current.col + dc;
                        if (nr < 0 || nr >= this.BOARD_SIZE || nc < 0 || nc >= this.BOARD_SIZE) continue;

                        if (this.board[nr][nc] === 'empty' && !visited[nr][nc]) {
                            visited[nr][nc] = true;
                            queue.push({ row: nr, col: nc });
                        } else if (this.board[nr][nc] !== 'empty') {
                            borderColors.add(this.board[nr][nc]);
                        }
                    }
                }

                // If region borders only one color, that color gets the territory
                if (borderColors.size === 1) {
                    const owner: StoneColor | undefined = borderColors.values().next().value;
                    if (owner === 'black') {
                        this.blackTerritory += region.length;
                    } else if (owner === 'white') {
                        this.whiteTerritory += region.length;
                    }
                }
            }
        }
    }

    private updateStatus(message?: string): void {
        if (!this.goStatusElement) return;

        if (message) {
            this.goStatusElement.textContent = message;
            return;
        }

        if (this.gameOver) {
            const blackScore: number = this.blackTerritory + this.whiteCaptured;
            const whiteScore: number = this.whiteTerritory + this.blackCaptured;
            const winner: string = blackScore > whiteScore ? 'Schwarz' :
                                   whiteScore > blackScore ? 'Weiß' : 'Unentschieden';
            this.goStatusElement.textContent = `Spiel vorbei! ${winner} gewinnt. Schwarz: ${blackScore} | Weiß: ${whiteScore}`;
        } else {
            const playerName: string = this.currentPlayer === 'black' ? 'Schwarz' : 'Weiß';
            this.goStatusElement.textContent = `${playerName} ist am Zug | Schwarz fängt: ${this.whiteCaptured} | Weiß fängt: ${this.blackCaptured}`;
        }
    }

    // =============================================
    // MCTS AI
    // =============================================

    private makeAiMove(): void {
        if (this.gameOver) return;

        const aiPlayer: StoneColor = 'white';
        const bestMove: { row: number; col: number } | null = this.mctsSearch(aiPlayer);

        if (bestMove) {
            this.makeMove(bestMove.row, bestMove.col);
        } else {
            // No valid move found, pass
            this.pass();
        }
    }

    /**
     * Monte Carlo Tree Search for Go.
     * Uses UCB1 for tree policy and random playouts for simulation.
     */
    private mctsSearch(aiPlayer: StoneColor): { row: number; col: number } | null {
        const ITERATIONS: number = 500;
        const startTime: number = Date.now();
        const TIME_LIMIT: number = 2500; // 2.5 seconds max

        // Create root node
        const root: MctsNode = {
            row: -1,
            col: -1,
            player: aiPlayer,
            visits: 0,
            wins: 0,
            children: [],
            parent: null,
            board: this.board.map(r => [...r]),
            ko: this.koPoint,
            unvisited: this.getValidMoves(this.board, this.koPoint),
        };

        for (let i = 0; i < ITERATIONS; i++) {
            // Time check
            if (Date.now() - startTime > TIME_LIMIT) break;

            // Selection
            const node: MctsNode = this.selectNode(root);

            // Expansion
            if (node.unvisited.length > 0) {
                this.expandNode(node);
            }

            // Simulation
            const winner: StoneColor | null = this.simulate(node);

            // Backpropagation
            this.backpropagate(node, winner, aiPlayer);
        }

        // Choose best move by visit count
        if (root.children.length === 0) return null;

        let bestChild: MctsNode = root.children[0];
        for (const child of root.children) {
            if (child.visits > bestChild.visits) {
                bestChild = child;
            }
        }

        return { row: bestChild.row, col: bestChild.col };
    }

    private selectNode(node: MctsNode): MctsNode {
        while (node.children.length > 0 && node.unvisited.length === 0) {
            // UCB1 selection
            let bestChild: MctsNode = node.children[0];
            let bestValue: number = -Infinity;

            for (const child of node.children) {
                const ucb: number = this.ucb1(child, node.visits);
                if (ucb > bestValue) {
                    bestValue = ucb;
                    bestChild = child;
                }
            }

            node = bestChild;
        }
        return node;
    }

    private ucb1(node: MctsNode, parentVisits: number): number {
        if (node.visits === 0) return Infinity;
        const exploit: number = node.wins / node.visits;
        const explore: number = Math.sqrt(2 * Math.log(parentVisits) / node.visits);
        return exploit + explore;
    }

    private expandNode(node: MctsNode): void {
        if (node.unvisited.length === 0) return;

        // Pick a random unvisited move
        const idx: number = Math.floor(Math.random() * node.unvisited.length);
        const move: { row: number; col: number } = node.unvisited.splice(idx, 1)[0];

        // Apply move to board
        const newBoard: Board = node.board.map(r => [...r]);
        const player: StoneColor = node.player === 'black' ? 'white' : 'black';
        this.applyMove(newBoard, move.row, move.col, player);

        const child: MctsNode = {
            row: move.row,
            col: move.col,
            player: player,
            visits: 0,
            wins: 0,
            children: [],
            parent: node,
            board: newBoard,
            ko: null,
            unvisited: this.getValidMoves(newBoard, null),
        };

        node.children.push(child);
    }

    private simulate(node: MctsNode): StoneColor | null {
        // Random playout from this node's board state
        const board: Board = node.board.map(r => [...r]);
        let currentPlayer: StoneColor = node.player === 'black' ? 'white' : 'black';
        let ko: { row: number; col: number } | null = null;

        const MAX_MOVES: number = 40;
        let moves: number = 0;

        while (moves < MAX_MOVES) {
            const validMoves: { row: number; col: number }[] = this.getValidMoves(board, ko);
            if (validMoves.length === 0) {
                // Pass
                currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
                moves++;
                continue;
            }

            // Pick a random move (with some bias toward center)
            const move: { row: number; col: number } = this.pickBiasedRandomMove(validMoves);
            this.applyMove(board, move.row, move.col, currentPlayer);
            currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
            moves++;
        }

        // Evaluate: count stones as a simple heuristic
        return this.evaluateWinner(board);
    }

    private pickBiasedRandomMove(moves: { row: number; col: number }[]): { row: number; col: number } {
        // Bias toward center for better playouts
        const center: number = Math.floor(this.BOARD_SIZE / 2);
        let bestMove: { row: number; col: number } = moves[0];
        let bestDist: number = Infinity;

        // 70% of the time, pick a center-biased move
        if (Math.random() < 0.7) {
            for (const move of moves) {
                const dist: number = Math.abs(move.row - center) + Math.abs(move.col - center);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestMove = move;
                }
            }
        } else {
            bestMove = moves[Math.floor(Math.random() * moves.length)];
        }

        return bestMove;
    }

    private evaluateWinner(board: Board): StoneColor | null {
        // Simple evaluation: count stones on board
        let blackCount: number = 0;
        let whiteCount: number = 0;

        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                if (board[r][c] === 'black') blackCount++;
                else if (board[r][c] === 'white') whiteCount++;
            }
        }

        if (blackCount > whiteCount) return 'black';
        if (whiteCount > blackCount) return 'white';
        return null;
    }

    private backpropagate(node: MctsNode | null, winner: StoneColor | null, aiPlayer: StoneColor): void {
        while (node !== null) {
            node.visits++;
            if (winner === aiPlayer) {
                node.wins++;
            }
            node = node.parent;
        }
    }

    private getValidMoves(board: Board, ko: { row: number; col: number } | null): { row: number; col: number }[] {
        const moves: { row: number; col: number }[] = [];

        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                if (board[r][c] !== 'empty') continue;

                // Check ko
                if (ko && ko.row === r && ko.col === c) continue;

                // Check suicide
                if (this.isSuicide(board, r, c)) continue;

                moves.push({ row: r, col: c });
            }
        }

        return moves;
    }

    private isSuicide(board: Board, row: number, col: number): boolean {
        const color: StoneColor = board[row][col];
        if (color === 'empty') return false;

        // Temporarily place stone
        board[row][col] = color;

        // Check if the placed stone's group has liberties
        const group = this.getGroupFromBoard(board, row, col);
        const hasLiberties: boolean = group.liberties > 0;

        // Check if any adjacent opponent groups are captured (which would give liberties)
        const opponent: StoneColor = color === 'black' ? 'white' : 'black';
        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let captured: boolean = false;

        for (const [dr, dc] of directions) {
            const nr: number = row + dr;
            const nc: number = col + dc;
            if (nr >= 0 && nr < this.BOARD_SIZE && nc >= 0 && nc < this.BOARD_SIZE &&
                board[nr][nc] === opponent) {
                const oppGroup = this.getGroupFromBoard(board, nr, nc);
                if (oppGroup.liberties === 0) {
                    captured = true;
                    break;
                }
            }
        }

        // Undo
        board[row][col] = 'empty';

        return !hasLiberties && !captured;
    }

    private getGroupFromBoard(board: Board, row: number, col: number): { stones: { row: number; col: number }[]; liberties: number } {
        const color: StoneColor = board[row][col];
        if (color === 'empty') return { stones: [], liberties: 0 };

        const visited: boolean[][] = Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill(false)
        );
        const stones: { row: number; col: number }[] = [];
        const libertiesSet: Set<string> = new Set();

        const queue: { row: number; col: number }[] = [{ row, col }];
        visited[row][col] = true;

        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        while (queue.length > 0) {
            const current = queue.shift()!;
            stones.push(current);

            for (const [dr, dc] of directions) {
                const nr: number = current.row + dr;
                const nc: number = current.col + dc;
                if (nr < 0 || nr >= this.BOARD_SIZE || nc < 0 || nc >= this.BOARD_SIZE) continue;

                if (board[nr][nc] === color && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    queue.push({ row: nr, col: nc });
                } else if (board[nr][nc] === 'empty') {
                    libertiesSet.add(`${nr},${nc}`);
                }
            }
        }

        return { stones, liberties: libertiesSet.size };
    }

    private applyMove(board: Board, row: number, col: number, player: StoneColor): void {
        board[row][col] = player;

        // Check captures
        const opponent: StoneColor = player === 'black' ? 'white' : 'black';
        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dr, dc] of directions) {
            const nr: number = row + dr;
            const nc: number = col + dc;
            if (nr >= 0 && nr < this.BOARD_SIZE && nc >= 0 && nc < this.BOARD_SIZE &&
                board[nr][nc] === opponent) {
                const group = this.getGroupFromBoard(board, nr, nc);
                if (group.liberties === 0) {
                    for (const stone of group.stones) {
                        board[stone.row][stone.col] = 'empty';
                    }
                }
            }
        }
    }

    private draw(): void {
        if (!this.ctx || !this.goCanvas) return;

        const size: number = this.CELL_SIZE;
        const halfSize: number = Math.floor(size / 2);
        const margin: number = this.MARGIN;

        // Clear canvas
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.goCanvas.width, this.goCanvas.height);

        // Draw grid lines (centered with margin)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.BOARD_SIZE; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(margin + i * size, margin);
            this.ctx.lineTo(margin + i * size, margin + this.LINE_COUNT * size);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(margin, margin + i * size);
            this.ctx.lineTo(margin + this.LINE_COUNT * size, margin + i * size);
            this.ctx.stroke();
        }

        // Draw star points (for 9x9: center + 4 corners)
        const starPoints: [number, number][] = [
            [0, 0], [0, 4], [0, 8],
            [4, 0], [4, 4], [4, 8],
            [8, 0], [8, 4], [8, 8]
        ];

        this.ctx.fillStyle = '#333';
        for (const [r, c] of starPoints) {
            const x: number = margin + c * size;
            const y: number = margin + r * size;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw stones
        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                if (this.board[r][c] === 'empty') continue;

                const x: number = margin + c * size;
                const y: number = margin + r * size;

                if (this.board[r][c] === 'black') {
                    this.ctx.fillStyle = '#222';
                } else {
                    this.ctx.fillStyle = '#fff';
                }

                this.ctx.beginPath();
                this.ctx.arc(x, y, halfSize - 2, 0, Math.PI * 2);
                this.ctx.fill();

                // Add shadow/highlight
                this.ctx.strokeStyle = this.board[r][c] === 'black' ? '#000' : '#ccc';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }

        // Draw territory if game is over
        if (this.gameOver) {
            this.drawTerritory();
        }
    }

    private drawTerritory(): void {
        if (!this.ctx || !this.goCanvas) return;

        const size: number = this.CELL_SIZE;
        const margin: number = this.MARGIN;

        const visited: boolean[][] = Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill(false)
        );

        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                if (this.board[r][c] !== 'empty' || visited[r][c]) continue;

                const region: { row: number; col: number }[] = [];
                const borderColors: Set<StoneColor> = new Set();
                const queue: { row: number; col: number }[] = [{ row: r, col: c }];
                visited[r][c] = true;

                while (queue.length > 0) {
                    const current = queue.shift()!;
                    region.push(current);

                    for (const [dr, dc] of directions) {
                        const nr: number = current.row + dr;
                        const nc: number = current.col + dc;
                        if (nr < 0 || nr >= this.BOARD_SIZE || nc < 0 || nc >= this.BOARD_SIZE) continue;

                        if (this.board[nr][nc] === 'empty' && !visited[nr][nc]) {
                            visited[nr][nc] = true;
                            queue.push({ row: nr, col: nc });
                        } else if (this.board[nr][nc] !== 'empty') {
                            borderColors.add(this.board[nr][nc]);
                        }
                    }
                }

                if (borderColors.size === 1) {
                    const owner: StoneColor | undefined = borderColors.values().next().value;
                    if (owner === 'black') {
                        this.ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                    } else if (owner === 'white') {
                        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    }
                    for (const stone of region) {
                        this.ctx.fillRect(margin + stone.col * size, margin + stone.row * size, size, size);
                    }
                }
            }
        }
    }
}
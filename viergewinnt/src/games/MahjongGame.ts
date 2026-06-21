import { Game, GameId } from '../types/common';

// =============================================
// Types for Mahjong Solitaire
// =============================================

interface TilePosition {
    col: number;
    row: number;
    layer: number;
}

interface Tile {
    id: number;
    type: number;       // 0-35 tile type (4 copies of each = 144 tiles)
    suit: number;       // 0=red/circles 1=green/bamboo 2=blue/chars 3=purple/winds 4=gold/dragons 5=special
    value: number;      // 1-9 for suits, 1-4 for winds, 1-3 for dragons, 1-2 for special
    pos: TilePosition;
    removed: boolean;
}

// =============================================
// Suit configuration
// =============================================

interface SuitConfig {
    name: string;
    color: string;
    symbol: string;
    count: number;   // number of types in this suit
}

const SUITS: SuitConfig[] = [
    { name: 'Kreise', color: '#e74c3c', symbol: '●', count: 9 },
    { name: 'Bambus', color: '#27ae60', symbol: '🎋', count: 9 },
    { name: 'Zeichen', color: '#2980b9', symbol: '中', count: 9 },
    { name: 'Winde', color: '#8e44ad', symbol: '風', count: 4 },
    { name: 'Drachen', color: '#f39c12', symbol: '龍', count: 3 },
    { name: 'Blüten', color: '#e91e63', symbol: '🌸', count: 2 },
];

const SUIT_NAMES: string[][] = [
    ['●1','●2','●3','●4','●5','●6','●7','●8','●9'],
    ['🎋1','🎋2','🎋3','🎋4','🎋5','🎋6','🎋7','🎋8','🎋9'],
    ['一','二','三','四','五','六','七','八','九'],
    ['O','S','W','N'],
    ['R','G','W'],
    ['🌺','🌻'],
];

// =============================================
// Layout definition – classic pyramid shape
// =============================================

// Each layer is a rectangle that shrinks as we go up.
// Layer 0 (bottom): 12w x 5h = 60
// Layer 1:          10w x 4h = 40
// Layer 2:           8w x 3h = 24
// Layer 3:           6w x 2h = 12
// Layer 4:           4w x 2h =  8
// Total = 144 tiles

interface LayerDef {
    cols: number;
    rows: number;
    colOffset: number;
    rowOffset: number;
}

function getLayerDefs(): LayerDef[] {
    return [
        { cols: 12, rows: 5, colOffset: 0, rowOffset: 0 },
        { cols: 10, rows: 4, colOffset: 1, rowOffset: 0 },
        { cols:  8, rows: 3, colOffset: 2, rowOffset: 1 },
        { cols:  6, rows: 2, colOffset: 3, rowOffset: 1 },
        { cols:  4, rows: 2, colOffset: 4, rowOffset: 1 },
    ];
}

function buildLayout(): TilePosition[] {
    const layers = getLayerDefs();
    const positions: TilePosition[] = [];
    for (let l = 0; l < layers.length; l++) {
        const layer = layers[l];
        for (let r = 0; r < layer.rows; r++) {
            for (let c = 0; c < layer.cols; c++) {
                positions.push({
                    col: layer.colOffset + c,
                    row: layer.rowOffset + r,
                    layer: l,
                });
            }
        }
    }
    return positions;
}

// =============================================
// Main Game Class
// =============================================

export class MahjongGame implements Game {
    public readonly id: GameId = 'mahjong';

    // Rendering
    private readonly TILE_W = 52;
    private readonly TILE_H = 62;
    private readonly TILE_GAP = 4;
    private readonly LAYER_OFFSET_X = 14;   // visual offset per layer (left)
    private readonly LAYER_OFFSET_Y = 16;   // visual offset per layer (down)
    private readonly CANVAS_W = 900;
    private readonly CANVAS_H = 580;

    // Game state
    private tiles: Tile[] = [];
    private selectedTile: Tile | null = null;
    private pairsRemoved: number = 0;
    private totalPairs: number = 72;
    private gameOver: boolean = false;
    private gameWon: boolean = false;
    private gameStarted: boolean = false;
    private startTime: number = 0;
    private elapsedTime: number = 0;
    private timerInterval: ReturnType<typeof setInterval> | undefined;
    private gameLoopInterval: ReturnType<typeof setInterval> | undefined;

    // Shuffle hint animation
    private hintFlashTiles: Tile[] = [];
    private hintFlashTimer: number = 0;

    // DOM elements
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private statusEl: HTMLElement | null = null;
    private resetBtn: HTMLElement | null = null;
    private hintBtn: HTMLElement | null = null;
    private shuffleBtn: HTMLElement | null = null;

    constructor() {
        this.canvas = document.getElementById('mahjongCanvas') as HTMLCanvasElement | null;
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.statusEl = document.getElementById('mahjongStatus');
        this.resetBtn = document.getElementById('resetMahjongBtn');
        this.hintBtn = document.getElementById('mahjongHintBtn');
        this.shuffleBtn = document.getElementById('mahjongShuffleBtn');

        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.init());
        }

        if (this.hintBtn) {
            this.hintBtn.addEventListener('click', () => this.showHint());
        }

        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener('click', () => this.shuffleBoard());
        }

        if (this.canvas) {
            this.canvas.addEventListener('click', (e: MouseEvent) => this.handleClick(e));
        }
    }

    // =============================================
    // Game Interface Implementation
    // =============================================

    public init(): void {
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
            this.statusEl.textContent = 'Paare: 0 / 72 | Zeit: 0s';
        }

        this.draw();

        // Timer
        this.timerInterval = setInterval(() => {
            if (this.gameStarted && !this.gameOver) {
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.updateStatus();
            }
        }, 1000);

        // Game loop for animations
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

    public cleanup(): void {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
    }

    // =============================================
    // Tile Creation
    // =============================================

    private createTiles(positions: TilePosition[]): Tile[] {
        // Determine how many copies of each type
        // 36 types × 4 copies = 144
        const totalTypes = 36;
        const copiesPerType = 4;
        const typeList: number[] = [];
        for (let t = 0; t < totalTypes; t++) {
            for (let c = 0; c < copiesPerType; c++) {
                typeList.push(t);
            }
        }

        const tiles: Tile[] = [];
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
                removed: false,
            });
            id++;
        }
        return tiles;
    }

    private getSuit(type: number): number {
        if (type < 9) return 0;        // circles
        if (type < 18) return 1;       // bamboos
        if (type < 27) return 2;       // characters
        if (type < 31) return 3;       // winds
        if (type < 34) return 4;       // dragons
        return 5;                       // special
    }

    private getSuitValue(type: number): number {
        if (type < 9) return type + 1;
        if (type < 18) return type - 9 + 1;
        if (type < 27) return type - 18 + 1;
        if (type < 31) return type - 27 + 1;
        if (type < 34) return type - 31 + 1;
        return type - 34 + 1;
    }

    private getTypeName(type: number): string {
        const suit = this.getSuit(type);
        const val = this.getSuitValue(type);
        return SUIT_NAMES[suit][val - 1] || `?${type}`;
    }

    private shuffleTiles(): void {
        // Fisher-Yates shuffle (only non-removed tiles)
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.tiles[i].type;
            this.tiles[i].type = this.tiles[j].type;
            this.tiles[j].type = temp;
            // Update suit/value
            this.tiles[i].suit = this.getSuit(this.tiles[i].type);
            this.tiles[i].value = this.getSuitValue(this.tiles[i].type);
            this.tiles[j].suit = this.getSuit(this.tiles[j].type);
            this.tiles[j].value = this.getSuitValue(this.tiles[j].type);
        }
    }

    // =============================================
    // Tile Freedom Checks
    // =============================================

    private isTileCovered(tile: Tile): boolean {
        // A tile is covered if there's any tile on a higher layer
        // that overlaps in the grid (accounting for centering offset)
        for (const other of this.tiles) {
            if (other.removed || other.id === tile.id) continue;
            if (other.pos.layer <= tile.pos.layer) continue;

            // Check overlap: the tile above must cover this position
            const dx = Math.abs(other.pos.col - tile.pos.col);
            const dy = Math.abs(other.pos.row - tile.pos.row);
            // A higher layer tile at (oc, or) covers row r if or === r or or === r+1, etc.
            // This is a simplification: a tile covers tiles that are within 1 column and 1 row
            // in the layer below it (because higher layers are narrower and offset)
            if (dx <= 1 && dy <= 1) {
                return true;
            }
        }
        return false;
    }

    private isTileFreeOnLeft(tile: Tile): boolean {
        // A tile is free on the left if there's no tile immediately to its left on the same layer
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

    private isTileFreeOnRight(tile: Tile): boolean {
        // A tile is free on the right if there's no tile immediately to its right on the same layer
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

    private isTileFree(tile: Tile): boolean {
        if (tile.removed) return false;
        if (this.isTileCovered(tile)) return false;
        return this.isTileFreeOnLeft(tile) || this.isTileFreeOnRight(tile);
    }

    // =============================================
    // Click Handling
    // =============================================

    private handleClick(event: MouseEvent): void {
        if (this.gameOver) return;

        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
        }

        const rect = this.canvas!.getBoundingClientRect();
        const scaleX = this.canvas!.width / rect.width;
        const scaleY = this.canvas!.height / rect.height;
        const mx = (event.clientX - rect.left) * scaleX;
        const my = (event.clientY - rect.top) * scaleY;

        // Find the topmost free tile under the click point
        const clickedTiles: Tile[] = [];
        for (const tile of this.tiles) {
            if (!this.isTileFree(tile)) continue;
            const { x, y } = this.getTileScreenPos(tile);
            if (mx >= x && mx < x + this.TILE_W && my >= y && my < y + this.TILE_H) {
                clickedTiles.push(tile);
            }
        }

        if (clickedTiles.length === 0) return;

        // Get the one on the highest layer
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

        // Check if they match
        if (this.tilesMatch(this.selectedTile, clicked)) {
            this.selectedTile.removed = true;
            clicked.removed = true;
            this.pairsRemoved++;
            this.selectedTile = null;
            this.updateStatus();
            this.draw();
            this.checkGameEnd();
        } else {
            // No match - deselect
            this.selectedTile = null;
            this.draw();
        }
    }

    private tilesMatch(a: Tile, b: Tile): boolean {
        return a.type === b.type;
    }

    private checkGameEnd(): void {
        if (this.pairsRemoved >= this.totalPairs) {
            this.gameOver = true;
            this.gameWon = true;
            if (this.statusEl) {
                this.statusEl.textContent += ' 🎉 Gewonnen!';
            }
            this.draw();
            return;
        }

        // Check if any moves remain
        const freeTiles = this.tiles.filter(t => this.isTileFree(t));
        const typeCounts = new Map<number, number>();
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
                this.statusEl.textContent += ' 😵 Keine Züge mehr! Neues Spiel starten.';
            }
            this.draw();
        }
    }

    // =============================================
    // Screen Position Calculation
    // =============================================

    private getTileScreenPos(tile: Tile): { x: number; y: number } {
        const layers = getLayerDefs();
        const bottomLayer = layers[0];
        const maxCols = bottomLayer.cols;
        const maxRows = bottomLayer.rows;

        // The whole grid spans a certain size, centered on the canvas
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

    private draw(): void {
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.CANVAS_W, this.CANVAS_H);

        // Background
        ctx.fillStyle = '#1a5c2a';
        ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);

        // Draw a subtle felt pattern
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i < this.CANVAS_W; i += 8) {
            for (let j = 0; j < this.CANVAS_H; j += 8) {
                if ((i + j) % 16 === 0) {
                    ctx.fillRect(i, j, 4, 4);
                }
            }
        }

        // Draw all non-removed tiles, sorted by layer (bottom first)
        const visibleTiles = this.tiles.filter(t => !t.removed);
        visibleTiles.sort((a, b) => a.pos.layer - b.pos.layer || a.pos.row - b.pos.row || a.pos.col - b.pos.col);

        for (const tile of visibleTiles) {
            this.drawTile(tile);
        }

        // Draw game over overlay
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, this.CANVAS_W, this.CANVAS_H);
            ctx.fillStyle = this.gameWon ? '#f1c40f' : '#e74c3c';
            ctx.font = 'bold 48px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const msg = this.gameWon ? '🎉 GEWONNEN! 🎉' : 'KEINE ZÜGE MEHR!';
            ctx.fillText(msg, this.CANVAS_W / 2, this.CANVAS_H / 2 - 20);
            ctx.font = '24px Segoe UI, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText(`Paare entfernt: ${this.pairsRemoved} / ${this.totalPairs}`, this.CANVAS_W / 2, this.CANVAS_H / 2 + 40);
        }
    }

    private drawTile(tile: Tile): void {
        const ctx = this.ctx!;
        const { x, y } = this.getTileScreenPos(tile);
        const w = this.TILE_W;
        const h = this.TILE_H;

        const isFree = this.isTileFree(tile);
        const isSelected = this.selectedTile?.id === tile.id;
        const isHinted = this.hintFlashTiles.some(t => t.id === tile.id);

        // Drop shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        // Tile body
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

        // Tile fill
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        if (isSelected) {
            grad.addColorStop(0, '#fffde7');
            grad.addColorStop(1, '#fff9c4');
        } else if (isHinted) {
            grad.addColorStop(0, '#e0f7fa');
            grad.addColorStop(1, '#b2ebf2');
        } else if (isFree) {
            grad.addColorStop(0, '#fff8e1');
            grad.addColorStop(1, '#ffecb3');
        } else {
            grad.addColorStop(0, '#ccc');
            grad.addColorStop(1, '#aaa');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Border
        ctx.strokeStyle = isSelected ? '#f39c12' : (isHinted ? '#00bcd4' : (isFree ? '#8d6e63' : '#888'));
        ctx.lineWidth = isSelected ? 3 : (isHinted ? 3 : (isFree ? 1.5 : 1));
        ctx.stroke();
        ctx.lineWidth = 1;

        if (!isFree) {
            // Draw a lock icon for blocked tiles
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', x + w / 2, y + h / 2);
            return;
        }

        // Draw tile content
        const suitColor = SUITS[tile.suit]?.color || '#333';
        const name = this.getTypeName(tile.type);

        // Suit symbol (top left)
        ctx.fillStyle = suitColor;
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(SUITS[tile.suit]?.symbol || '?', x + 5, y + 4);

        // Value (center large)
        ctx.fillStyle = suitColor;
        ctx.font = 'bold 24px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, x + w / 2, y + h / 2);

        // Suit indicator bottom right
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.font = '11px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(SUITS[tile.suit]?.name || '', x + w - 4, y + h - 4);

        // Selected indicator
        if (isSelected) {
            ctx.strokeStyle = '#f39c12';
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

    private updateStatus(): void {
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

    public showHint(): void {
        if (this.gameOver) return;

        const freeTiles = this.tiles.filter(t => this.isTileFree(t));
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (this.tilesMatch(freeTiles[i], freeTiles[j])) {
                    this.hintFlashTiles = [freeTiles[i], freeTiles[j]];
                    this.hintFlashTimer = 8; // flash for ~1.6 seconds
                    this.draw();
                    return;
                }
            }
        }
    }

    // =============================================
    // Shuffle remaining tiles (when stuck)
    // =============================================

    public shuffleBoard(): void {
        if (this.gameOver) return;

        const remaining = this.tiles.filter(t => !t.removed);
        // Collect their types
        const types = remaining.map(t => t.type);
        // Shuffle types
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        // Reassign
        for (let i = 0; i < remaining.length; i++) {
            remaining[i].type = types[i];
            remaining[i].suit = this.getSuit(types[i]);
            remaining[i].value = this.getSuitValue(types[i]);
        }

        this.selectedTile = null;
        this.draw();

        // Re-check game end
        this.checkGameEnd();
    }
}

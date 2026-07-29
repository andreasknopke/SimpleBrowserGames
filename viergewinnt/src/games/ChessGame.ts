import { Game, GameId, GameMode } from '../types/common';

// =============================================
// Types
// =============================================

type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface ChessPiece {
    type: PieceType;
    color: PieceColor;
}

type ChessBoard = (ChessPiece | null)[][];

interface ChessMove {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    piece: ChessPiece;
    captured: ChessPiece | null;
    isCastling?: boolean;
    isEnPassant?: boolean;
    promotion?: PieceType;
}

// =============================================
// Main Game Class
// =============================================

export class ChessGame implements Game {
    public readonly id: GameId = 'chess';

    private readonly BOARD_SIZE: number = 8;
    private readonly CELL_SIZE: number = 50;
    private readonly MARGIN: number = 20;

    private board: ChessBoard = [];
    private currentPlayer: PieceColor = 'white';
    private gameOver: boolean = false;
    private gameMode: GameMode = '2p';
    private moveHistory: ChessMove[] = [];
    private enPassantTarget: { row: number; col: number } | null = null;
    private whiteKingMoved: boolean = false;
    private blackKingMoved: boolean = false;
    private whiteRookAMoved: boolean = false;
    private whiteRookHMoved: boolean = false;
    private blackRookAMoved: boolean = false;
    private blackRookHMoved: boolean = false;

    private chessStatusElement: HTMLElement | null = null;
    private chessBoardElement: HTMLElement | null = null;
    private chessCanvas: HTMLCanvasElement | null = null;
    private resetChessBtn: HTMLElement | null = null;
    private chessModeSelect: HTMLSelectElement | null = null;
    private chessDifficultyContainer: HTMLElement | null = null;
    private chessDifficultySelect: HTMLSelectElement | null = null;

    private ctx: CanvasRenderingContext2D | null = null;

    // Drag & Drop
    private selectedPiece: { row: number; col: number } | null = null;
    private validMoves: { row: number; col: number }[] = [];
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

    // Piece symbols
    private pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
        white: {
            pawn: '♙', knight: '♘', bishop: '♗', rook: '♖', queen: '♕', king: '♔'
        },
        black: {
            pawn: '♟', knight: '♞', bishop: '♝', rook: '♜', queen: '♛', king: '♚'
        }
    };

    constructor() {
        this.chessStatusElement = document.getElementById('chessStatus');
        this.chessBoardElement = document.getElementById('chessBoard');
        this.chessCanvas = document.getElementById('chessCanvas') as HTMLCanvasElement | null;
        this.resetChessBtn = document.getElementById('resetChessBtn');
        this.chessModeSelect = document.getElementById('chessMode') as HTMLSelectElement | null;
        this.chessDifficultyContainer = document.getElementById('chessDifficultyContainer');
        this.chessDifficultySelect = document.getElementById('chessDifficulty') as HTMLSelectElement | null;

        this.ctx = this.chessCanvas ? this.chessCanvas.getContext('2d') : null;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (this.resetChessBtn) {
            this.resetChessBtn.addEventListener('click', () => this.init());
        }
        if (this.chessModeSelect) {
            this.chessModeSelect.addEventListener('change', () => {
                this.gameMode = this.chessModeSelect!.value as GameMode;
                if (this.chessDifficultyContainer) {
                    this.chessDifficultyContainer.style.display = this.gameMode === '1p' ? 'flex' : 'none';
                }
                this.init();
            });
        }
        if (this.chessDifficultySelect) {
            this.chessDifficultySelect.addEventListener('change', () => {
                this.init();
            });
        }
        if (this.chessCanvas) {
            this.chessCanvas.addEventListener('mousedown', (e: MouseEvent) => this.handleMouseDown(e));
            this.chessCanvas.addEventListener('mousemove', (e: MouseEvent) => this.handleMouseMove(e));
            this.chessCanvas.addEventListener('mouseup', (e: MouseEvent) => this.handleMouseUp(e));
            this.chessCanvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        }
    }

    public init(): void {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.enPassantTarget = null;
        this.whiteKingMoved = false;
        this.blackKingMoved = false;
        this.whiteRookAMoved = false;
        this.whiteRookHMoved = false;
        this.blackRookAMoved = false;
        this.blackRookHMoved = false;
        this.selectedPiece = null;
        this.validMoves = [];
        this.updateStatus();
        this.draw();
    }

    public cleanup(): void {
        // Nothing to clean up for Chess (no intervals)
    }

    private createInitialBoard(): ChessBoard {
        const board: ChessBoard = Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill(null)
        );

        // Place pawns
        for (let c = 0; c < this.BOARD_SIZE; c++) {
            board[1][c] = { type: 'pawn', color: 'black' };
            board[6][c] = { type: 'pawn', color: 'white' };
        }

        // Place other pieces
        const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let c = 0; c < this.BOARD_SIZE; c++) {
            board[0][c] = { type: backRank[c], color: 'black' };
            board[7][c] = { type: backRank[c], color: 'white' };
        }

        return board;
    }

    private updateStatus(message?: string): void {
        if (!this.chessStatusElement) return;

        if (message) {
            this.chessStatusElement.textContent = message;
            return;
        }

        if (this.gameOver) {
            return;
        }

        const playerName: string = this.currentPlayer === 'white' ? 'Weiß' : 'Schwarz';
        this.chessStatusElement.textContent = `${playerName} ist am Zug`;
    }

    // =============================================
    // Input Handling
    // =============================================

    private handleMouseDown(e: MouseEvent): void {
        if (this.gameOver || !this.chessCanvas) return;
        if (this.gameMode === '1p' && this.currentPlayer === 'black') return;

        const { row, col } = this.getBoardPosition(e);
        if (row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE) return;

        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentPlayer) return;

        this.selectedPiece = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        this.draw();
    }

    private handleMouseMove(e: MouseEvent): void {
        if (!this.selectedPiece || !this.chessCanvas) return;
        // Could add drag preview here
    }

    private handleMouseUp(e: MouseEvent): void {
        if (!this.selectedPiece || this.gameOver || !this.chessCanvas) return;

        const { row, col } = this.getBoardPosition(e);

        // Check if the drop is on a valid move
        const validMove = this.validMoves.find(m => m.row === row && m.col === col);
        if (validMove) {
            this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
        }

        this.selectedPiece = null;
        this.validMoves = [];
        this.draw();
    }

    private handleMouseLeave(): void {
        this.selectedPiece = null;
        this.validMoves = [];
        this.draw();
    }

    private getBoardPosition(e: MouseEvent): { row: number; col: number } {
        if (!this.chessCanvas) return { row: -1, col: -1 };
        const rect: DOMRect = this.chessCanvas.getBoundingClientRect();
        const x: number = e.clientX - rect.left;
        const y: number = e.clientY - rect.top;
        const col: number = Math.floor(x / this.CELL_SIZE);
        const row: number = Math.floor(y / this.CELL_SIZE);
        return { row, col };
    }

    // =============================================
    // Move Logic
    // =============================================

    private makeMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
        if (this.gameOver) return false;

        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        const captured = this.board[toRow][toCol];
        const move: ChessMove = {
            fromRow, fromCol, toRow, toCol, piece, captured
        };

        // Check for castling
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            move.isCastling = true;
            const rookCol = toCol > fromCol ? 7 : 0;
            const rookNewCol = toCol > fromCol ? toCol - 1 : toCol + 1;
            const rook = this.board[fromRow][rookCol];
            if (rook) {
                this.board[fromRow][rookNewCol] = rook;
                this.board[fromRow][rookCol] = null;
            }
        }

        // Check for en passant
        if (piece.type === 'pawn' && fromCol !== toCol && !captured && this.enPassantTarget &&
            toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
            move.isEnPassant = true;
            const captureRow = fromRow;
            this.board[captureRow][toCol] = null;
        }

        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            move.promotion = 'queen';
            this.board[toRow][toCol] = { type: 'queen', color: piece.color };
        }

        // Update en passant target
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
        }

        // Update castling rights
        if (piece.type === 'king') {
            if (piece.color === 'white') this.whiteKingMoved = true;
            else this.blackKingMoved = true;
        }
        if (piece.type === 'rook') {
            if (piece.color === 'white') {
                if (fromCol === 0) this.whiteRookAMoved = true;
                if (fromCol === 7) this.whiteRookHMoved = true;
            } else {
                if (fromCol === 0) this.blackRookAMoved = true;
                if (fromCol === 7) this.blackRookHMoved = true;
            }
        }

        this.moveHistory.push(move);

        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check for checkmate or stalemate
        const opponentInCheck = this.isInCheck(this.currentPlayer);
        const hasLegalMoves = this.hasLegalMoves(this.currentPlayer);

        if (opponentInCheck && !hasLegalMoves) {
            this.gameOver = true;
            const winner = this.currentPlayer === 'white' ? 'black' : 'white';
            this.updateStatus(`${winner === 'white' ? 'Weiß' : 'Schwarz'} hat Schachmatt!`);
        } else if (!opponentInCheck && !hasLegalMoves) {
            this.gameOver = true;
            this.updateStatus('Unentschieden (Patt)!');
        } else {
            this.updateStatus();
        }

        this.draw();

        // If 1p mode and it's now the AI's turn, make AI move
        if (this.gameMode === '1p' && this.currentPlayer === 'black' && !this.gameOver) {
            setTimeout(() => this.makeAiMove(), 300);
        }

        return true;
    }

    private getValidMoves(row: number, col: number): { row: number; col: number }[] {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = this.getPseudoLegalMoves(row, col);
        const validMoves: { row: number; col: number }[] = [];

        for (const move of moves) {
            // Make the move temporarily
            const originalPiece = this.board[move.row][move.col];
            const originalEnPassant = this.enPassantTarget;
            const originalWhiteKingMoved = this.whiteKingMoved;
            const originalBlackKingMoved = this.blackKingMoved;
            const originalWhiteRookAMoved = this.whiteRookAMoved;
            const originalWhiteRookHMoved = this.whiteRookHMoved;
            const originalBlackRookAMoved = this.blackRookAMoved;
            const originalBlackRookHMoved = this.blackRookHMoved;

            this.board[move.row][move.col] = piece;
            this.board[row][col] = null;

            // Check if own king is in check after the move
            if (!this.isInCheck(piece.color)) {
                validMoves.push(move);
            }

            // Undo
            this.board[row][col] = piece;
            this.board[move.row][move.col] = originalPiece;
            this.enPassantTarget = originalEnPassant;
            this.whiteKingMoved = originalWhiteKingMoved;
            this.blackKingMoved = originalBlackKingMoved;
            this.whiteRookAMoved = originalWhiteRookAMoved;
            this.whiteRookHMoved = originalWhiteRookHMoved;
            this.blackRookAMoved = originalBlackRookAMoved;
            this.blackRookHMoved = originalBlackRookHMoved;
        }

        return validMoves;
    }

    private getPseudoLegalMoves(row: number, col: number, includeCastling: boolean = true): { row: number; col: number }[] {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves: { row: number; col: number }[] = [];

        switch (piece.type) {
            case 'pawn':
                this.getPawnMoves(row, col, piece, moves);
                break;
            case 'knight':
                this.getKnightMoves(row, col, piece, moves);
                break;
            case 'bishop':
                this.getBishopMoves(row, col, piece, moves);
                break;
            case 'rook':
                this.getRookMoves(row, col, piece, moves);
                break;
            case 'queen':
                this.getQueenMoves(row, col, piece, moves);
                break;
            case 'king':
                this.getKingMoves(row, col, piece, moves, includeCastling);
                break;
        }

        return moves;
    }

    private getPawnMoves(row: number, col: number, piece: ChessPiece, moves: { row: number; col: number }[]): void {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Forward one square
        const oneRow = row + direction;
        if (oneRow >= 0 && oneRow < this.BOARD_SIZE && !this.board[oneRow][col]) {
            moves.push({ row: oneRow, col });

            // Forward two squares from starting position
            if (row === startRow) {
                const twoRow = row + 2 * direction;
                if (!this.board[twoRow][col]) {
                    moves.push({ row: twoRow, col });
                }
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const captureCol = col + dc;
            const captureRow = row + direction;
            if (captureRow >= 0 && captureRow < this.BOARD_SIZE && captureCol >= 0 && captureCol < this.BOARD_SIZE) {
                const target = this.board[captureRow][captureCol];
                if (target && target.color !== piece.color) {
                    moves.push({ row: captureRow, col: captureCol });
                }
                // En passant
                if (this.enPassantTarget && captureRow === this.enPassantTarget.row && captureCol === this.enPassantTarget.col) {
                    moves.push({ row: captureRow, col: captureCol });
                }
            }
        }
    }

    private getKnightMoves(row: number, col: number, piece: ChessPiece, moves: { row: number; col: number }[]): void {
        const offsets: [number, number][] = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of offsets) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < this.BOARD_SIZE && c >= 0 && c < this.BOARD_SIZE) {
                const target = this.board[r][c];
                if (!target || target.color !== piece.color) {
                    moves.push({ row: r, col: c });
                }
            }
        }
    }

    private getBishopMoves(row: number, col: number, piece: ChessPiece, moves: { row: number; col: number }[]): void {
        const directions: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        this.getSlidingMoves(row, col, piece, directions, moves);
    }

    private getRookMoves(row: number, col: number, piece: ChessPiece, moves: { row: number; col: number }[]): void {
        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        this.getSlidingMoves(row, col, piece, directions, moves);
    }

    private getQueenMoves(row: number, col: number, piece: ChessPiece, moves: { row: number; col: number }[]): void {
        const directions: [number, number][] = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        this.getSlidingMoves(row, col, piece, directions, moves);
    }

    private getSlidingMoves(row: number, col: number, piece: ChessPiece, directions: [number, number][], moves: { row: number; col: number }[]): void {
        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < this.BOARD_SIZE && c >= 0 && c < this.BOARD_SIZE) {
                const target = this.board[r][c];
                if (!target) {
                    moves.push({ row: r, col: c });
                } else {
                    if (target.color !== piece.color) {
                        moves.push({ row: r, col: c });
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }
    }

    private getKingMoves(row: number, col: number, piece: ChessPiece, moves: { row: number; col: number }[], includeCastling: boolean = true): void {
        const directions: [number, number][] = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < this.BOARD_SIZE && c >= 0 && c < this.BOARD_SIZE) {
                const target = this.board[r][c];
                if (!target || target.color !== piece.color) {
                    moves.push({ row: r, col: c });
                }
            }
        }

        // Castling (skip when called from isSquareAttacked to avoid infinite recursion)
        if (!includeCastling) return;

        if (piece.color === 'white' && !this.whiteKingMoved && row === 7 && col === 4) {
            // Kingside
            if (!this.whiteRookHMoved && this.board[7][5] === null && this.board[7][6] === null && this.board[7][7] !== null) {
                if (!this.isSquareAttacked(7, 4, 'black') &&
                    !this.isSquareAttacked(7, 5, 'black') &&
                    !this.isSquareAttacked(7, 6, 'black')) {
                    moves.push({ row: 7, col: 6 });
                }
            }
            // Queenside
            if (!this.whiteRookAMoved && this.board[7][3] === null && this.board[7][2] === null && this.board[7][1] === null && this.board[7][0] !== null) {
                if (!this.isSquareAttacked(7, 4, 'black') &&
                    !this.isSquareAttacked(7, 3, 'black') &&
                    !this.isSquareAttacked(7, 2, 'black')) {
                    moves.push({ row: 7, col: 2 });
                }
            }
        }

        if (piece.color === 'black' && !this.blackKingMoved && row === 0 && col === 4) {
            // Kingside
            if (!this.blackRookHMoved && this.board[0][5] === null && this.board[0][6] === null && this.board[0][7] !== null) {
                if (!this.isSquareAttacked(0, 4, 'white') &&
                    !this.isSquareAttacked(0, 5, 'white') &&
                    !this.isSquareAttacked(0, 6, 'white')) {
                    moves.push({ row: 0, col: 6 });
                }
            }
            // Queenside
            if (!this.blackRookAMoved && this.board[0][3] === null && this.board[0][2] === null && this.board[0][1] === null && this.board[0][0] !== null) {
                if (!this.isSquareAttacked(0, 4, 'white') &&
                    !this.isSquareAttacked(0, 3, 'white') &&
                    !this.isSquareAttacked(0, 2, 'white')) {
                    moves.push({ row: 0, col: 2 });
                }
            }
        }
    }

    private isSquareAttacked(row: number, col: number, byColor: PieceColor): boolean {
        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === byColor) {
                    const moves = this.getPseudoLegalMoves(r, c, false);
                    if (moves.some(m => m.row === row && m.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private isInCheck(color: PieceColor): boolean {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;
        const opponent: PieceColor = color === 'white' ? 'black' : 'white';
        return this.isSquareAttacked(kingPos.row, kingPos.col, opponent);
    }

    private findKing(color: PieceColor): { row: number; col: number } | null {
        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                const piece = this.board[r][c];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row: r, col: c };
                }
            }
        }
        return null;
    }

    private hasLegalMoves(color: PieceColor): boolean {
        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(r, c);
                    if (moves.length > 0) return true;
                }
            }
        }
        return false;
    }

    // =============================================
    // Drawing
    // =============================================

    private draw(): void {
        if (!this.ctx || !this.chessCanvas) return;

        const size: number = this.CELL_SIZE;
        const ctx = this.ctx;

        // Clear canvas
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, 0, this.chessCanvas.width, this.chessCanvas.height);

        // Draw board
        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                const x = c * size;
                const y = r * size;

                // Board square color
                const isLight = (r + c) % 2 === 0;
                ctx.fillStyle = isLight ? '#F0D9B5' : '#B58886';
                ctx.fillRect(x, y, size, size);

                // Draw piece
                const piece = this.board[r][c];
                if (piece) {
                    ctx.fillStyle = piece.color === 'white' ? '#FFFFFF' : '#000000';
                    ctx.font = `${size * 0.7}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this.pieceSymbols[piece.color][piece.type], x + size / 2, y + size / 2);
                }
            }
        }

        // Highlight selected piece
        if (this.selectedPiece) {
            const { row, col } = this.selectedPiece;
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 3;
            ctx.strokeRect(col * size, row * size, size, size);

            // Highlight valid moves
            for (const move of this.validMoves) {
                ctx.fillStyle = 'rgba(0, 123, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(move.col * size + size / 2, move.row * size + size / 2, size * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Highlight last move
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(lastMove.fromCol * size, lastMove.fromRow * size, size, size);
            ctx.strokeRect(lastMove.toCol * size, lastMove.toRow * size, size, size);
        }
    }

    // =============================================
    // AI Implementation (Minimax with Alpha-Beta)
    // =============================================

    private getDifficulty(): number {
        if (!this.chessDifficultySelect) return 1;
        return parseInt(this.chessDifficultySelect.value) || 1;
    }

    private makeAiMove(): void {
        if (this.gameOver) return;

        const depth = this.getDifficulty() === 1 ? 2 : this.getDifficulty() === 2 ? 3 : 4;
        const bestMove = this.findBestMove(depth);

        if (bestMove) {
            this.makeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
        }
    }

    private findBestMove(depth: number): ChessMove | null {
        let bestScore = -Infinity;
        let bestMove: ChessMove | null = null;

        const moves = this.getAllLegalMoves('black');

        for (const move of moves) {
            const score = this.minimax(move, depth, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    private getAllLegalMoves(color: PieceColor): ChessMove[] {
        const moves: ChessMove[] = [];

        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMoves(r, c);
                    for (const move of validMoves) {
                        moves.push({
                            fromRow: r, fromCol: c, toRow: move.row, toCol: move.col,
                            piece, captured: this.board[move.row][move.col]
                        });
                    }
                }
            }
        }

        return moves;
    }

    private minimax(move: ChessMove, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
        // Apply move
        const originalBoard = this.board.map(r => [...r]);
        const originalEnPassant = this.enPassantTarget;
        const originalWhiteKingMoved = this.whiteKingMoved;
        const originalBlackKingMoved = this.blackKingMoved;
        const originalWhiteRookAMoved = this.whiteRookAMoved;
        const originalWhiteRookHMoved = this.whiteRookHMoved;
        const originalBlackRookAMoved = this.blackRookAMoved;
        const originalBlackRookHMoved = this.blackRookHMoved;

        this.applyMove(move);

        let score: number;

        if (depth === 0) {
            score = this.evaluateBoard();
        } else {
            const currentPlayer: PieceColor = isMaximizing ? 'white' : 'black';
            const moves = this.getAllLegalMoves(currentPlayer);

            if (moves.length === 0) {
                // Checkmate or stalemate
                if (this.isInCheck(currentPlayer)) {
                    score = isMaximizing ? -10000 : 10000;
                } else {
                    score = 0; // Stalemate
                }
            } else {
                if (isMaximizing) {
                    let maxEval = -Infinity;
                    for (const m of moves) {
                        const evalScore = this.minimax(m, depth - 1, alpha, beta, false);
                        maxEval = Math.max(maxEval, evalScore);
                        alpha = Math.max(alpha, evalScore);
                        if (beta <= alpha) break;
                    }
                    score = maxEval;
                } else {
                    let minEval = Infinity;
                    for (const m of moves) {
                        const evalScore = this.minimax(m, depth - 1, alpha, beta, true);
                        minEval = Math.min(minEval, evalScore);
                        beta = Math.min(beta, evalScore);
                        if (beta <= alpha) break;
                    }
                    score = minEval;
                }
            }
        }

        // Undo move
        this.board = originalBoard;
        this.enPassantTarget = originalEnPassant;
        this.whiteKingMoved = originalWhiteKingMoved;
        this.blackKingMoved = originalBlackKingMoved;
        this.whiteRookAMoved = originalWhiteRookAMoved;
        this.whiteRookHMoved = originalWhiteRookHMoved;
        this.blackRookAMoved = originalBlackRookAMoved;
        this.blackRookHMoved = originalBlackRookHMoved;

        return score;
    }

    private applyMove(move: ChessMove): void {
        const { fromRow, fromCol, toRow, toCol, piece } = move;

        // Handle castling
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            const rookCol = toCol > fromCol ? 7 : 0;
            const rookNewCol = toCol > fromCol ? toCol - 1 : toCol + 1;
            const rook = this.board[fromRow][rookCol];
            if (rook) {
                this.board[fromRow][rookNewCol] = rook;
                this.board[fromRow][rookCol] = null;
            }
        }

        // Handle en passant
        if (piece.type === 'pawn' && fromCol !== toCol && !this.board[toRow][toCol] && this.enPassantTarget &&
            toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
            const captureRow = fromRow;
            this.board[captureRow][toCol] = null;
        }

        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: 'queen', color: piece.color };
        }

        // Update en passant target
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
        }

        // Update castling rights
        if (piece.type === 'king') {
            if (piece.color === 'white') this.whiteKingMoved = true;
            else this.blackKingMoved = true;
        }
        if (piece.type === 'rook') {
            if (piece.color === 'white') {
                if (fromCol === 0) this.whiteRookAMoved = true;
                if (fromCol === 7) this.whiteRookHMoved = true;
            } else {
                if (fromCol === 0) this.blackRookAMoved = true;
                if (fromCol === 7) this.blackRookHMoved = true;
            }
        }
    }

    private evaluateBoard(): number {
        let score = 0;

        const pieceValues: Record<PieceType, number> = {
            pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000
        };

        for (let r = 0; r < this.BOARD_SIZE; r++) {
            for (let c = 0; c < this.BOARD_SIZE; c++) {
                const piece = this.board[r][c];
                if (piece) {
                    const value = pieceValues[piece.type];
                    score += piece.color === 'white' ? value : -value;

                    // Positional bonus
                    score += this.getPositionBonus(piece, r, c);
                }
            }
        }

        return score;
    }

    private getPositionBonus(piece: ChessPiece, row: number, col: number): number {
        // Simple positional bonus - center control
        const centerDist = Math.abs(row - 3.5) + Math.abs(col - 3.5);
        let bonus = (4 - centerDist) * 5;

        // Pawn bonus for advancing
        if (piece.type === 'pawn') {
            bonus += piece.color === 'white' ? (7 - row) * 10 : row * 10;
        }

        return piece.color === 'white' ? bonus : -bonus;
    }
}

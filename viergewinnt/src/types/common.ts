// =============================================
// Shared Type Definitions
// =============================================

export type Player = 1 | 2;
export type CellValue = 0 | Player;
export type Board = CellValue[][];
export type GameMode = '1p' | '2p';
export type GameId = 'fourWins' | 'minesweeper' | 'tetris' | 'snake' | 'pong' | 'spaceInvaders' | 'breakout' | 'boulderDash' | 'towerDefense' | 'pacman' | 'mahjong' | 'katakis';

export type MsCellValue = number | 'M';
export type MsBoard = MsCellValue[][];

export interface PieceData {
    shape: number[][];
    color: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface SnakeSegment {
    x: number;
    y: number;
}

export interface Alien {
    x: number;
    y: number;
    alive: boolean;
    row: number;
}

export interface Bullet {
    x: number;
    y: number;
    speed?: number;
}

export interface Brick {
    x: number;
    y: number;
    color: string;
    alive: boolean;
}

// =============================================
// Game Interface
// =============================================

export interface Game {
    id: GameId;
    init(): void;
    cleanup(): void;
}

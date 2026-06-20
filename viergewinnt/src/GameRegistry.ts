import { Game, GameId } from './types/common';
import { ConnectFourGame } from './games/ConnectFourGame';
import { MinesweeperGame } from './games/MinesweeperGame';
import { TetrisGame } from './games/TetrisGame';
import { SnakeGame } from './games/SnakeGame';
import { PongGame } from './games/PongGame';
import { SpaceInvadersGame } from './games/SpaceInvadersGame';
import { BreakoutGame } from './games/BreakoutGame';
import { BoulderDashGame } from './games/BoulderDashGame';
import { TowerDefenseGame } from './games/TowerDefenseGame';
import { PacmanGame } from './games/PacmanGame';

export class GameRegistry {
    private games: Map<GameId, Game>;
    private activeGameId: GameId | null = null;

    constructor() {
        this.games = new Map<GameId, Game>([
            ['fourWins', new ConnectFourGame()],
            ['minesweeper', new MinesweeperGame()],
            ['tetris', new TetrisGame()],
            ['snake', new SnakeGame()],
            ['pong', new PongGame()],
            ['spaceInvaders', new SpaceInvadersGame()],
            ['breakout', new BreakoutGame()],
            ['boulderDash', new BoulderDashGame()],
            ['towerDefense', new TowerDefenseGame()],
            ['pacman', new PacmanGame()],
        ]);

        this.setupGameSwitching();
        this.setupKeyboardHandler();
    }

    private getActiveGame(): Game | null {
        if (!this.activeGameId) return null;
        return this.games.get(this.activeGameId) || null;
    }

    private setupGameSwitching(): void {
        const gameIds: GameId[] = [
            'fourWins', 'minesweeper', 'tetris', 'snake', 'pong',
            'spaceInvaders', 'breakout', 'boulderDash', 'towerDefense', 'pacman'
        ];

        for (const gameId of gameIds) {
            const btn = document.getElementById(`btn${this.getPascalCase(gameId)}`);
            if (btn) {
                btn.addEventListener('click', () => this.switchGame(gameId));
            }
        }
    }

    private getPascalCase(gameId: GameId): string {
        const map: Record<GameId, string> = {
            'fourWins': 'FourWins',
            'minesweeper': 'Minesweeper',
            'tetris': 'Tetris',
            'snake': 'Snake',
            'pong': 'Pong',
            'spaceInvaders': 'SpaceInvaders',
            'breakout': 'Breakout',
            'boulderDash': 'BoulderDash',
            'towerDefense': 'TowerDefense',
            'pacman': 'Pacman'
        };
        return map[gameId];
    }

    private getContainerId(gameId: GameId): string {
        const map: Record<GameId, string> = {
            'fourWins': 'fourWinsContainer',
            'minesweeper': 'minesweeperContainer',
            'tetris': 'tetrisContainer',
            'snake': 'snakeContainer',
            'pong': 'pongContainer',
            'spaceInvaders': 'spaceInvadersContainer',
            'breakout': 'breakoutContainer',
            'boulderDash': 'boulderDashContainer',
            'towerDefense': 'tdContainer',
            'pacman': 'pacmanContainer'
        };
        return map[gameId];
    }

    private getButtonId(gameId: GameId): string {
        const map: Record<GameId, string> = {
            'fourWins': 'btnFourWins',
            'minesweeper': 'btnMinesweeper',
            'tetris': 'btnTetris',
            'snake': 'btnSnake',
            'pong': 'btnPong',
            'spaceInvaders': 'btnSpaceInvaders',
            'breakout': 'btnBreakout',
            'boulderDash': 'btnBoulderDash',
            'towerDefense': 'btnTowerDefense',
            'pacman': 'btnPacman'
        };
        return map[gameId];
    }

    public switchGame(gameId: GameId): void {
        // Cleanup active game
        if (this.activeGameId && this.activeGameId !== gameId) {
            const currentGame = this.games.get(this.activeGameId);
            if (currentGame) {
                currentGame.cleanup();
            }
        }

        // Hide all containers
        const containers = document.querySelectorAll<HTMLElement>('.game-container');
        containers.forEach(c => c.style.display = 'none');

        // Remove active class from all buttons
        const buttons = document.querySelectorAll<HTMLElement>('.game-grid-btn');
        buttons.forEach(b => b.classList.remove('active'));

        // Show selected container
        const containerId = this.getContainerId(gameId);
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'block';
        }

        // Set active button
        const btnId = this.getButtonId(gameId);
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.add('active');
        }

        // Init selected game
        this.activeGameId = gameId;
        const game = this.games.get(gameId);
        if (game) {
            game.init();
        }
    }

    private setupKeyboardHandler(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.activeGameId) return;

            const containerId = this.getContainerId(this.activeGameId);
            const container = document.getElementById(containerId);
            if (!container || container.style.display === 'none') return;

            switch (this.activeGameId) {
                case 'tetris':
                    (this.getActiveGame() as TetrisGame).handleKey(e);
                    break;
                case 'snake':
                    (this.getActiveGame() as SnakeGame).handleKey(e);
                    break;
                case 'pong':
                    (this.getActiveGame() as PongGame).handleKeyDown(e);
                    break;
                case 'spaceInvaders':
                    (this.getActiveGame() as SpaceInvadersGame).handleKeyDown(e);
                    break;
                case 'breakout':
                    (this.getActiveGame() as BreakoutGame).handleKeyDown(e);
                    break;
                case 'boulderDash':
                    (this.getActiveGame() as BoulderDashGame).handleKey(e);
                    break;
                case 'pacman':
                    (this.getActiveGame() as PacmanGame).handleKey(e);
                    break;
            }
        });

        document.addEventListener('keyup', (e: KeyboardEvent) => {
            if (!this.activeGameId) return;

            const containerId = this.getContainerId(this.activeGameId);
            const container = document.getElementById(containerId);
            if (!container || container.style.display === 'none') return;

            switch (this.activeGameId) {
                case 'pong':
                    (this.getActiveGame() as PongGame).handleKeyUp(e);
                    break;
                case 'spaceInvaders':
                    (this.getActiveGame() as SpaceInvadersGame).handleKeyUp(e);
                    break;
                case 'breakout':
                    (this.getActiveGame() as BreakoutGame).handleKeyUp(e);
                    break;
            }
        });
    }

    public initDefault(): void {
        this.switchGame('fourWins');
    }
}

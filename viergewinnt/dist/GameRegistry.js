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
import { MahjongGame } from './games/MahjongGame';
import { KatakisGame } from './games/KatakisGame';
export class GameRegistry {
    constructor() {
        this.activeGameId = null;
        this.games = new Map([
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
            ['mahjong', new MahjongGame()],
            ['katakis', new KatakisGame()],
        ]);
        this.setupGameSwitching();
        this.setupKeyboardHandler();
    }
    getActiveGame() {
        if (!this.activeGameId)
            return null;
        return this.games.get(this.activeGameId) || null;
    }
    setupGameSwitching() {
        const gameIds = [
            'fourWins', 'minesweeper', 'tetris', 'snake', 'pong',
            'spaceInvaders', 'breakout', 'boulderDash', 'towerDefense', 'pacman',
            'mahjong', 'katakis'
        ];
        for (const gameId of gameIds) {
            const btn = document.getElementById(`btn${this.getPascalCase(gameId)}`);
            if (btn) {
                btn.addEventListener('click', () => this.switchGame(gameId));
            }
        }
    }
    getPascalCase(gameId) {
        const map = {
            'fourWins': 'FourWins',
            'minesweeper': 'Minesweeper',
            'tetris': 'Tetris',
            'snake': 'Snake',
            'pong': 'Pong',
            'spaceInvaders': 'SpaceInvaders',
            'breakout': 'Breakout',
            'boulderDash': 'BoulderDash',
            'towerDefense': 'TowerDefense',
            'pacman': 'Pacman',
            'mahjong': 'Mahjong',
            'katakis': 'Katakis'
        };
        return map[gameId];
    }
    getContainerId(gameId) {
        const map = {
            'fourWins': 'fourWinsContainer',
            'minesweeper': 'minesweeperContainer',
            'tetris': 'tetrisContainer',
            'snake': 'snakeContainer',
            'pong': 'pongContainer',
            'spaceInvaders': 'spaceInvadersContainer',
            'breakout': 'breakoutContainer',
            'boulderDash': 'boulderDashContainer',
            'towerDefense': 'tdContainer',
            'pacman': 'pacmanContainer',
            'mahjong': 'mahjongContainer',
            'katakis': 'katakisContainer'
        };
        return map[gameId];
    }
    getButtonId(gameId) {
        const map = {
            'fourWins': 'btnFourWins',
            'minesweeper': 'btnMinesweeper',
            'tetris': 'btnTetris',
            'snake': 'btnSnake',
            'pong': 'btnPong',
            'spaceInvaders': 'btnSpaceInvaders',
            'breakout': 'btnBreakout',
            'boulderDash': 'btnBoulderDash',
            'towerDefense': 'btnTowerDefense',
            'pacman': 'btnPacman',
            'mahjong': 'btnMahjong',
            'katakis': 'btnKatakis'
        };
        return map[gameId];
    }
    switchGame(gameId) {
        // Cleanup active game
        if (this.activeGameId && this.activeGameId !== gameId) {
            const currentGame = this.games.get(this.activeGameId);
            if (currentGame) {
                currentGame.cleanup();
            }
        }
        // Hide all containers
        const containers = document.querySelectorAll('.game-container');
        containers.forEach(c => c.style.display = 'none');
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.game-grid-btn');
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
    setupKeyboardHandler() {
        document.addEventListener('keydown', (e) => {
            if (!this.activeGameId)
                return;
            const containerId = this.getContainerId(this.activeGameId);
            const container = document.getElementById(containerId);
            if (!container || container.style.display === 'none')
                return;
            switch (this.activeGameId) {
                case 'tetris':
                    this.getActiveGame().handleKey(e);
                    break;
                case 'snake':
                    this.getActiveGame().handleKey(e);
                    break;
                case 'pong':
                    this.getActiveGame().handleKeyDown(e);
                    break;
                case 'spaceInvaders':
                    this.getActiveGame().handleKeyDown(e);
                    break;
                case 'breakout':
                    this.getActiveGame().handleKeyDown(e);
                    break;
                case 'boulderDash':
                    this.getActiveGame().handleKey(e);
                    break;
                case 'pacman':
                    this.getActiveGame().handleKey(e);
                    break;
                case 'katakis':
                    this.getActiveGame().handleKeyDown(e);
                    break;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (!this.activeGameId)
                return;
            const containerId = this.getContainerId(this.activeGameId);
            const container = document.getElementById(containerId);
            if (!container || container.style.display === 'none')
                return;
            switch (this.activeGameId) {
                case 'pong':
                    this.getActiveGame().handleKeyUp(e);
                    break;
                case 'spaceInvaders':
                    this.getActiveGame().handleKeyUp(e);
                    break;
                case 'breakout':
                    this.getActiveGame().handleKeyUp(e);
                    break;
                case 'katakis':
                    this.getActiveGame().handleKeyUp(e);
                    break;
            }
        });
    }
    initDefault() {
        this.switchGame('fourWins');
    }
}
//# sourceMappingURL=GameRegistry.js.map
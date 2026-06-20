import { GameRegistry } from './GameRegistry';

let registry: GameRegistry | null = null;

document.addEventListener('DOMContentLoaded', () => {
    registry = new GameRegistry();
    registry.initDefault();
});

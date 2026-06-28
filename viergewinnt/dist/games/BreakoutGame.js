export class BreakoutGame {
    constructor() {
        this.id = 'breakout';
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
        this.resetBreakoutBtn = document.getElementById('resetBreakoutBtn');
        this.breakoutCanvas = document.getElementById('breakoutCanvas');
        this.breakoutStatusElement = document.getElementById('breakoutStatus');
        this.breakoutBtnLeft = document.getElementById('breakoutBtnLeft');
        this.breakoutBtnRight = document.getElementById('breakoutBtnRight');
        this.breakoutCtx = this.breakoutCanvas ? this.breakoutCanvas.getContext('2d') : null;
        this.setupEventListeners();
        this.setupMobileControls();
    }
    setupEventListeners() {
        if (this.resetBreakoutBtn) {
            this.resetBreakoutBtn.addEventListener('click', () => this.init());
        }
    }
    init() {
        if (this.breakoutInterval)
            clearInterval(this.breakoutInterval);
        if (!this.breakoutCanvas)
            return;
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
        const brickColors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff'];
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
        if (this.breakoutStatusElement)
            this.breakoutStatusElement.textContent = `Punkte: 0 | Leben: ${this.breakoutLives}`;
        this.breakoutInterval = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }
    cleanup() {
        if (this.breakoutInterval) {
            clearInterval(this.breakoutInterval);
            this.breakoutInterval = undefined;
        }
    }
    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.breakoutPaddleMoving = -1;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.breakoutPaddleMoving = 1;
        }
        e.preventDefault();
    }
    handleKeyUp(e) {
        if ((e.key === 'ArrowLeft' || e.key === 'a') && this.breakoutPaddleMoving === -1) {
            this.breakoutPaddleMoving = 0;
        }
        if ((e.key === 'ArrowRight' || e.key === 'd') && this.breakoutPaddleMoving === 1) {
            this.breakoutPaddleMoving = 0;
        }
        e.preventDefault();
    }
    update() {
        if (this.breakoutGameOver)
            return;
        this.breakoutPaddleX += this.breakoutPaddleMoving * this.BREAKOUT_PADDLE_SPEED;
        if (this.breakoutCanvas)
            this.breakoutPaddleX = Math.max(0, Math.min(this.breakoutCanvas.width - this.BREAKOUT_PADDLE_WIDTH, this.breakoutPaddleX));
        this.breakoutBallX += this.breakoutBallDX;
        this.breakoutBallY += this.breakoutBallDY;
        if (!this.breakoutCanvas)
            return;
        if (this.breakoutBallX - this.BREAKOUT_BALL_RADIUS <= 0 || this.breakoutBallX + this.BREAKOUT_BALL_RADIUS >= this.breakoutCanvas.width) {
            this.breakoutBallDX = -this.breakoutBallDX;
        }
        if (this.breakoutBallY - this.BREAKOUT_BALL_RADIUS <= 0) {
            this.breakoutBallDY = -this.breakoutBallDY;
        }
        if (this.breakoutBallY + this.BREAKOUT_BALL_RADIUS >= this.breakoutCanvas.height - 30 &&
            this.breakoutBallY + this.BREAKOUT_BALL_RADIUS <= this.breakoutCanvas.height - 15 &&
            this.breakoutBallX >= this.breakoutPaddleX &&
            this.breakoutBallX <= this.breakoutPaddleX + this.BREAKOUT_PADDLE_WIDTH) {
            this.breakoutBallDY = -Math.abs(this.breakoutBallDY);
            const hitPos = (this.breakoutBallX - this.breakoutPaddleX) / this.BREAKOUT_PADDLE_WIDTH;
            this.breakoutBallDX = 6 * (hitPos - 0.5);
        }
        if (this.breakoutBallY + this.BREAKOUT_BALL_RADIUS > this.breakoutCanvas.height) {
            this.breakoutLives--;
            if (this.breakoutLives <= 0) {
                this.breakoutGameOver = true;
                if (this.breakoutStatusElement)
                    this.breakoutStatusElement.textContent = `Game Over! Punkte: ${this.breakoutScore}`;
                if (this.breakoutInterval)
                    clearInterval(this.breakoutInterval);
                return;
            }
            this.breakoutBallX = this.breakoutCanvas.width / 2;
            this.breakoutBallY = this.breakoutCanvas.height - 40;
            this.breakoutBallDX = 3 * (Math.random() > 0.5 ? 1 : -1);
            this.breakoutBallDY = -3;
            if (this.breakoutStatusElement)
                this.breakoutStatusElement.textContent = `Punkte: ${this.breakoutScore} | Leben: ${this.breakoutLives}`;
        }
        for (const brick of this.breakoutBricks) {
            if (!brick.alive)
                continue;
            if (this.breakoutBallX + this.BREAKOUT_BALL_RADIUS > brick.x &&
                this.breakoutBallX - this.BREAKOUT_BALL_RADIUS < brick.x + this.BREAKOUT_BRICK_WIDTH &&
                this.breakoutBallY + this.BREAKOUT_BALL_RADIUS > brick.y &&
                this.breakoutBallY - this.BREAKOUT_BALL_RADIUS < brick.y + this.BREAKOUT_BRICK_HEIGHT) {
                brick.alive = false;
                this.breakoutBallDY = -this.breakoutBallDY;
                this.breakoutScore += 10;
                if (this.breakoutStatusElement)
                    this.breakoutStatusElement.textContent = `Punkte: ${this.breakoutScore} | Leben: ${this.breakoutLives}`;
                break;
            }
        }
        if (this.breakoutBricks.every(b => !b.alive)) {
            this.breakoutGameOver = true;
            if (this.breakoutStatusElement)
                this.breakoutStatusElement.textContent = `Gewonnen! Punkte: ${this.breakoutScore}`;
            if (this.breakoutInterval)
                clearInterval(this.breakoutInterval);
        }
    }
    draw() {
        if (!this.breakoutCtx)
            return;
        this.breakoutCtx.clearRect(0, 0, this.breakoutCtx.canvas.width, this.breakoutCtx.canvas.height);
        for (const brick of this.breakoutBricks) {
            if (!brick.alive)
                continue;
            this.breakoutCtx.fillStyle = brick.color;
            this.breakoutCtx.fillRect(brick.x, brick.y, this.BREAKOUT_BRICK_WIDTH, this.BREAKOUT_BRICK_HEIGHT);
            this.breakoutCtx.strokeStyle = '#333';
            this.breakoutCtx.strokeRect(brick.x, brick.y, this.BREAKOUT_BRICK_WIDTH, this.BREAKOUT_BRICK_HEIGHT);
        }
        this.breakoutCtx.fillStyle = '#007bff';
        this.breakoutCtx.fillRect(this.breakoutPaddleX, this.breakoutCtx.canvas.height - 30, this.BREAKOUT_PADDLE_WIDTH, this.BREAKOUT_PADDLE_HEIGHT);
        this.breakoutCtx.beginPath();
        this.breakoutCtx.arc(this.breakoutBallX, this.breakoutBallY, this.BREAKOUT_BALL_RADIUS, 0, Math.PI * 2);
        this.breakoutCtx.fillStyle = '#fff';
        this.breakoutCtx.fill();
        this.breakoutCtx.closePath();
    }
    setupMobileControls() {
        const addControl = (btn, direction) => {
            if (!btn)
                return;
            const start = () => { this.breakoutPaddleMoving = direction; };
            const stop = () => { this.breakoutPaddleMoving = 0; };
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); start(); });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); stop(); });
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); start(); });
            btn.addEventListener('mouseup', (e) => { e.preventDefault(); stop(); });
        };
        addControl(this.breakoutBtnLeft, -1);
        addControl(this.breakoutBtnRight, 1);
    }
}
//# sourceMappingURL=BreakoutGame.js.map
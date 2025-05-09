const canvas = document.getElementById("breakoutCanvas");
const ctx = canvas.getContext("2d");

// Constants
const BALL_SIZE = 20;
const PADDLE_HEIGHT = 20;
const PADDLE_WIDTH = 120;
const PADDLE_RADIUS = 10;
const PADDLE_SPEED = 12;
const BRICK_ROWS = 5;
const BRICK_COLS = 9;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;
const BRICK_RADIUS = 8;

// Ball properties
let ballX = canvas.width / 2;
let ballY = canvas.height - 40;
let dx = 0;
let dy = 0;
const ballImage = new Image();
ballImage.src = "ball.gif";

// Paddle properties
let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let rightPressed = false;
let leftPressed = false;
const paddleImage = new Image();
paddleImage.src = "paddle.png"; // Replace with the correct path to your image

// Brick properties
let bricks = [];
let totalVisibleBricks = 0;
let score = 0;

// Game state
let gameStarted = false;
let gameOver = false;

// Initialize bricks with random visibility
function initBricks() {
  bricks = [];
  totalVisibleBricks = 0;
  for (let c = 0; c < BRICK_COLS; c++) {
    bricks[c] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      const status = Math.random() > 0.5 ? 1 : 0;
      if (status === 1) totalVisibleBricks++;
      const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
      const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
      bricks[c][r] = { x: brickX, y: brickY, status: status };
    }
  }
  if (totalVisibleBricks === 0) {
    const randomCol = Math.floor(Math.random() * BRICK_COLS);
    const randomRow = Math.floor(Math.random() * BRICK_ROWS);
    bricks[randomCol][randomRow].status = 1;
    totalVisibleBricks = 1;
  }
}
initBricks();

// Reset game state
function resetGame() {
  ballX = canvas.width / 2;
  ballY = canvas.height - 40;
  dx = 0;
  dy = 0;
  paddleX = (canvas.width - PADDLE_WIDTH) / 2;
  score = 0;
  gameStarted = false;
  gameOver = false;
  initBricks();
}

// Event listeners
document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
    if (gameOver) resetGame();
    if (!gameStarted) {
      gameStarted = true;
      dx = 6;
      dy = -6;
    }
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
    if (gameOver) resetGame();
    if (!gameStarted) {
      gameStarted = true;
      dx = -6;
      dy = -6;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// Draw functions
function drawBall() {
  ctx.drawImage(
    ballImage,
    ballX - BALL_SIZE / 2,
    ballY - BALL_SIZE / 2,
    BALL_SIZE,
    BALL_SIZE
  );
}

function drawPaddle() {
  // Draw the paddle image with a glow effect
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(233, 89, 80, 0.8)";
  ctx.drawImage(
    paddleImage,
    paddleX,
    canvas.height - PADDLE_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT
  );
  ctx.shadowBlur = 0;
}

function drawBricks() {
  for (let c = 0; c < BRICK_COLS; c++) {
    for (let r = 0; r < BRICK_ROWS; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT, BRICK_RADIUS);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 8, 20);
}

// Collision detection with brick edges
function collisionDetection() {
  for (let c = 0; c < BRICK_COLS; c++) {
    for (let r = 0; r < BRICK_ROWS; r++) {
      const b = bricks[c][r];
      if (b.status !== 1) continue;

      const ballLeft = ballX - BALL_SIZE / 2;
      const ballRight = ballX + BALL_SIZE / 2;
      const ballTop = ballY - BALL_SIZE / 2;
      const ballBottom = ballY + BALL_SIZE / 2;

      const brickLeft = b.x;
      const brickRight = b.x + BRICK_WIDTH;
      const brickTop = b.y;
      const brickBottom = b.y + BRICK_HEIGHT;

      if (
        ballRight > brickLeft &&
        ballLeft < brickRight &&
        ballBottom > brickTop &&
        ballTop < brickBottom
      ) {
        const distToTop = Math.abs(ballBottom - brickTop);
        const distToBottom = Math.abs(ballTop - brickBottom);
        const distToLeft = Math.abs(ballRight - brickLeft);
        const distToRight = Math.abs(ballLeft - brickRight);

        const minDist = Math.min(
          distToTop,
          distToBottom,
          distToLeft,
          distToRight
        );

        if (minDist === distToTop || minDist === distToBottom) dy = -dy;
        else dx = -dx;

        dx = Math.abs(dx) * (dx > 0 ? 1 : -1);
        dy = Math.abs(dy) * (dy > 0 ? 1 : -1);

        b.status = 0;
        score++;
        if (score === totalVisibleBricks) {
          gameStarted = false;
          gameOver = true;
        }
        break;
      }
    }
  }
}

// Paddle collision with directional bounce
function paddleCollision() {
  if (
    ballX > paddleX &&
    ballX < paddleX + PADDLE_WIDTH &&
    ballY + BALL_SIZE / 2 >= canvas.height - PADDLE_HEIGHT &&
    ballY + BALL_SIZE / 2 <= canvas.height
  ) {
    dy = -Math.abs(dy);
    const hitPosition = ballX - paddleX;
    const third = PADDLE_WIDTH / 3;

    if (hitPosition < third) dx = -6;
    else if (hitPosition < 2 * third) dx = dx > 0 ? 6 : -6;
    else dx = 6;
  }
}

// Main game loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();

  if (gameStarted) {
    collisionDetection();
    paddleCollision();

    ballX += dx;
    ballY += dy;

    if (ballX + dx > canvas.width - BALL_SIZE / 2 || ballX + dx < BALL_SIZE / 2)
      dx = -dx;
    if (ballY + dy < BALL_SIZE / 2) dy = -dy;
    else if (ballY + dy > canvas.height - BALL_SIZE / 2) {
      if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
        // Handled in paddleCollision
      } else {
        gameStarted = false;
        gameOver = true;
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
    paddleX += PADDLE_SPEED;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SPEED;
  }

  requestAnimationFrame(draw);
}

ballImage.onload = draw;

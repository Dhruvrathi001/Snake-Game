// Grab things from the page that we need to talk to
const board = document.querySelector('.board');
const modal = document.querySelector('.modal');

const startGameModal = document.querySelector('.start-game');
const startBtn = document.querySelector('.btn-start');

const gameOverModal = document.querySelector('.game-over');
const restartBtn = document.querySelector('.btn-restart');

const highScoreElement = document.querySelector('#high-score');
const scoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');

// Scores and time
let highScore = Number(localStorage.getItem('highScore')) || 0;
let score = 0;
let timeText = '00-00';

highScoreElement.innerText = highScore;
scoreElement.innerText = score;
timeElement.innerText = timeText;

// Each block’s size in pixels
const blockSize = 50;

// Calculate number of grid rows and columns based on board size
const cols = Math.floor(board.clientWidth / blockSize);
const rows = Math.floor(board.clientHeight / blockSize);

// Interval IDs for game loop and timer
let gameLoopId = null;
let timerId = null;

// Movement speed (ms)
const speed = 400;

// Cell references stored as "row-col" => element
const cells = {};

// Snake body + direction
let snake = [
  {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  },
];
let direction = 'right';

// Food position
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

// Build the grid once
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const cell = document.createElement('div');
    cell.classList.add('block');
    board.appendChild(cell);
    cells[`${row}-${col}`] = cell;
  }
}

// Draw one frame of the game
function render() {
  const head = snake[0];
  let newHead = { x: head.x, y: head.y };

  // Decide where the new head goes
  if (direction === 'left') newHead.y -= 1;
  else if (direction === 'right') newHead.y += 1;
  else if (direction === 'up') newHead.x -= 1;
  else if (direction === 'down') newHead.x += 1;

  // Stop if the snake hits the wall
  const outOfBounds =
    newHead.x < 0 || newHead.x >= rows || newHead.y < 0 || newHead.y >= cols;

  if (outOfBounds) {
    clearInterval(gameLoopId);
    clearInterval(timerId);

    modal.style.display = 'flex';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'flex';
    return;
  }

  // Mark the current food
  cells[`${food.x}-${food.y}`].classList.add('food');

  let shouldGrow = false;

  // Eat food
  if (newHead.x === food.x && newHead.y === food.y) {
    cells[`${food.x}-${food.y}`].classList.remove('food');
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    cells[`${food.x}-${food.y}`].classList.add('food');
    shouldGrow = true;
    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      highScoreElement.innerText = highScore;
      localStorage.setItem('highScore', String(highScore));
    }
  }

  // Clear old snake from board
  snake.forEach((part) => cells[`${part.x}-${part.y}`].classList.remove('fill'));

  // Move snake
  snake.unshift(newHead);
  if (!shouldGrow) snake.pop();

  // Draw new snake
  snake.forEach((part) => cells[`${part.x}-${part.y}`].classList.add('fill'));
}

// ===== Desktop keyboard control =====
addEventListener('keydown', (event) => {
  const key = event.key;
  if (key === 'ArrowUp' && direction !== 'down') direction = 'up';
  else if (key === 'ArrowDown' && direction !== 'up') direction = 'down';
  else if (key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  else if (key === 'ArrowRight' && direction !== 'left') direction = 'right';
});

// ===== Mobile swipe control =====
let touchStartX = 0;
let touchStartY = 0;

// When finger touches the screen
board.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

// When finger lifts off the screen
board.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  // Detect swipe direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    if (dx > 0 && direction !== 'left') direction = 'right';
    else if (dx < 0 && direction !== 'right') direction = 'left';
  } else {
    // Vertical swipe
    if (dy > 0 && direction !== 'up') direction = 'down';
    else if (dy < 0 && direction !== 'down') direction = 'up';
  }
});

// ===== Start button =====
startBtn.addEventListener('click', () => {
  gameOverModal.style.display = 'none';
  startGameModal.style.display = 'none';
  modal.style.display = 'none';

  // Timer
  timerId = setInterval(() => {
    let [min, sec] = timeText.split('-').map(Number);
    if (sec >= 59) {
      min++;
      sec = 0;
    } else sec++;
    timeText = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
    timeElement.innerText = timeText;
  }, 1000);

  // Start game loop
  gameLoopId = setInterval(render, speed);
});

// ===== Restart button =====
restartBtn.addEventListener('click', restartGame);

function restartGame() {
  modal.style.display = 'none';
  gameOverModal.style.display = 'none';
  startGameModal.style.display = 'none';

  score = 0;
  scoreElement.innerText = score;
  timeText = '00-00';
  timeElement.innerText = timeText;

  cells[`${food.x}-${food.y}`].classList.remove('food');
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  cells[`${food.x}-${food.y}`].classList.add('food');

  snake.forEach((part) => cells[`${part.x}-${part.y}`].classList.remove('fill'));
  snake = [
    {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    },
  ];

  clearInterval(gameLoopId);
  clearInterval(timerId);

  timerId = setInterval(() => {
    let [min, sec] = timeText.split('-').map(Number);
    if (sec >= 59) {
      min++;
      sec = 0;
    } else sec++;
    timeText = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
    timeElement.innerText = timeText;
  }, 1000);

  gameLoopId = setInterval(render, speed);
}

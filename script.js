// ========== Grab all the important elements ==========
const board = document.querySelector('.board');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const startBtn = document.querySelector('.btn-start');
const gameOverModal = document.querySelector('.game-over');
const restartBtn = document.querySelector('.btn-restart');
const highScoreElement = document.querySelector('#high-score');
const scoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');

// ========== Game State ==========
let highScore = Number(localStorage.getItem('highScore')) || 0;
let score = 0;
let time = '00-00';
let intervelId = null;
let timerIntervalId = null;
let speed = 400;
const blocks = {};
let direction = 'right';

// Make block size flexible for all screens
let blockSize = getBlockSize();
let cols = Math.floor(board.clientWidth / blockSize);
let rows = Math.floor(board.clientHeight / blockSize);

// Randomize start position and food
let snake = [
  { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) },
];
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

// Display initial scores
highScoreElement.innerText = highScore;
scoreElement.innerText = score;

// ========== Setup the Board ==========
createBoard();

// Function: calculate block size based on device width
function getBlockSize() {
  if (window.innerWidth <= 480) return 30; // small phones
  if (window.innerWidth <= 768) return 40; // tablets
  return 50; // desktops
}

// Create grid dynamically
function createBoard() {
  board.innerHTML = ''; // Clear if resizing
  Object.keys(blocks).forEach((key) => delete blocks[key]); // Reset old cells

  cols = Math.floor(board.clientWidth / blockSize);
  rows = Math.floor(board.clientHeight / blockSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const block = document.createElement('div');
      block.classList.add('block');
      block.style.width = `${blockSize}px`;
      block.style.height = `${blockSize}px`;
      board.appendChild(block);
      blocks[`${row}-${col}`] = block;
    }
  }
}

// ========== Main Render Function ==========
function render() {
  let head;

  // Paint food
  blocks[`${food.x}-${food.y}`]?.classList.add('food');

  // Determine new head position
  if (direction === 'left') head = { x: snake[0].x, y: snake[0].y - 1 };
  else if (direction === 'right') head = { x: snake[0].x, y: snake[0].y + 1 };
  else if (direction === 'up') head = { x: snake[0].x - 1, y: snake[0].y };
  else if (direction === 'down') head = { x: snake[0].x + 1, y: snake[0].y };

  // If snake hits wall → game over
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(intervelId);
    clearInterval(timerIntervalId);
    modal.style.display = 'flex';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'flex';
    return;
  }

  // Food collision
  let grow = false;
  if (food.x === head.x && food.y === head.y) {
    blocks[`${food.x}-${food.y}`].classList.remove('food');
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    grow = true;
    score += 10;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', String(highScore));
    }
    highScoreElement.innerText = highScore;
    scoreElement.innerText = score;
  }

  // Clear old snake
  snake.forEach((part) => {
    blocks[`${part.x}-${part.y}`]?.classList.remove('fill');
  });

  // Move snake
  snake.unshift(head);
  if (!grow) snake.pop();

  // Draw new snake
  snake.forEach((part) => {
    blocks[`${part.x}-${part.y}`]?.classList.add('fill');
  });
}

// ========== Handle Arrow Key Inputs ==========
addEventListener('keydown', (event) => {
  const key = event.key;
  if (key === 'ArrowUp' && direction !== 'down') direction = 'up';
  else if (key === 'ArrowDown' && direction !== 'up') direction = 'down';
  else if (key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  else if (key === 'ArrowRight' && direction !== 'left') direction = 'right';
});

// ========== Touch Controls for Mobile ==========
let touchStartX = 0;
let touchStartY = 0;

board.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

board.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  // Determine swipe direction
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left';
  } else {
    direction = dy > 0 ? 'down' : 'up';
  }
});

// ========== Start Game Button ==========
startBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  timerIntervalId = startTimer();
  intervelId = setInterval(render, speed);
});

// ========== Restart Button ==========
restartBtn.addEventListener('click', restartGame);

function restartGame() {
  modal.style.display = 'none';
  score = 0;
  scoreElement.innerText = score;
  time = '00-00';
  timeElement.innerText = time;

  // Reset snake and food
  snake.forEach((part) => {
    blocks[`${part.x}-${part.y}`]?.classList.remove('fill');
  });

  snake = [
    { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) },
  ];

  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  clearInterval(intervelId);
  clearInterval(timerIntervalId);
  timerIntervalId = startTimer();
  intervelId = setInterval(render, speed);
}

// ========== Timer ==========
function startTimer() {
  return setInterval(() => {
    let [min, sec] = time.split('-').map(Number);
    sec++;
    if (sec > 59) {
      min++;
      sec = 0;
    }
    time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
    timeElement.innerText = time;
  }, 1000);
}

// ========== Handle Screen Resize ==========
window.addEventListener('resize', () => {
  blockSize = getBlockSize();
  createBoard();
});

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

// Size of each block in the grid
const blockSize = 50;

// Figure out how many rows and columns we can fit
const cols = Math.floor(board.clientWidth / blockSize);
const rows = Math.floor(board.clientHeight / blockSize);

// IDs for our intervals so we can stop them when needed
let gameLoopId = null;
let timerId = null;

// How often the snake moves (ms)
const speed = 400;

// We store each cell element in this object using "row-col" as key
const cells = {};

// Snake and food state
let snake = [
  {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  },
];

let direction = 'right';

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

// Build the grid once at the start
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

  // Decide where the new head should go based on current direction
  let newHead = { x: head.x, y: head.y };

  if (direction === 'left') {
    newHead.y -= 1;
  } else if (direction === 'right') {
    newHead.y += 1;
  } else if (direction === 'up') {
    newHead.x -= 1;
  } else if (direction === 'down') {
    newHead.x += 1;
  }

  // If the new head is outside the board, the game ends
  const outOfBounds =
    newHead.x < 0 ||
    newHead.x >= rows ||
    newHead.y < 0 ||
    newHead.y >= cols;

  if (outOfBounds) {
    clearInterval(gameLoopId);
    clearInterval(timerId);

    // Show the game over modal
    modal.style.display = 'flex';
    startGameModal.style.display = 'none';
    gameOverModal.style.display = 'flex';

    return;
  }

  // Mark the current food cell
  cells[`${food.x}-${food.y}`].classList.add('food');

  let shouldGrow = false;

  // Check if the snake eats the food
  if (newHead.x === food.x && newHead.y === food.y) {
    // Remove food mark from old place
    cells[`${food.x}-${food.y}`].classList.remove('food');

    // Pick a new random position for food
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };

    cells[`${food.x}-${food.y}`].classList.add('food');

    shouldGrow = true;

    // Update score
    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      highScoreElement.innerText = highScore;
      localStorage.setItem('highScore', String(highScore));
    }
  }

  // Clear the snake's previous position from the board
  snake.forEach((part) => {
    cells[`${part.x}-${part.y}`].classList.remove('fill');
  });

  // Add the new head at the front of the snake
  snake.unshift(newHead);

  // If we didn't eat, remove the tail so length stays same
  if (!shouldGrow) {
    snake.pop();
  }

  // Draw the snake at its new position
  snake.forEach((part) => {
    cells[`${part.x}-${part.y}`].classList.add('fill');
  });
}

// Change direction based on arrow keys
addEventListener('keydown', (event) => {
  const key = event.key;

  if (key === 'ArrowUp') {
    direction = 'up';
  } else if (key === 'ArrowDown') {
    direction = 'down';
  } else if (key === 'ArrowLeft') {
    direction = 'left';
  } else if (key === 'ArrowRight') {
    direction = 'right';
  }
});

// Start button: begins timer and game loop
startBtn.addEventListener('click', () => {
  // Reset that "game over" modal state if needed
  gameOverModal.style.display = 'none';
  startGameModal.style.display = 'none';
  modal.style.display = 'none';

  // Start the timer (simple mm-ss style, but with "-")
  timerId = setInterval(() => {
    let [min, sec] = timeText.split('-').map(Number);

    if (sec >= 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    timeText = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
    timeElement.innerText = timeText;
  }, 1000);

  // Start the game loop
  gameLoopId = setInterval(render, speed);
});

// Restart button: resets everything and starts again
restartBtn.addEventListener('click', restartGame);

function restartGame() {
  // Hide modal
  modal.style.display = 'none';
  gameOverModal.style.display = 'none';
  startGameModal.style.display = 'none';

  // Reset score and time
  score = 0;
  scoreElement.innerText = score;
  timeText = '00-00';
  timeElement.innerText = timeText;

  // Remove old food from its previous position
  cells[`${food.x}-${food.y}`].classList.remove('food');

  // Place new food somewhere random
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  cells[`${food.x}-${food.y}`].classList.add('food');

  // Clear old snake from the board
  snake.forEach((part) => {
    cells[`${part.x}-${part.y}`].classList.remove('fill');
  });

  // Create a brand-new snake at a random place
  snake = [
    {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    },
  ];

  // Make sure any old loop or timer is stopped
  clearInterval(gameLoopId);
  clearInterval(timerId);

  // Start fresh timer and game loop
  timerId = setInterval(() => {
    let [min, sec] = timeText.split('-').map(Number);

    if (sec >= 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    timeText = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`;
    timeElement.innerText = timeText;
  }, 1000);

  gameLoopId = setInterval(render, speed);
}
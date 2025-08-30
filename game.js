// Game constants
const GRID_SIZE = 20;
const GAME_SPEED = 100; // milliseconds

// Game variables
let canvas;
let ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameRunning = false;
let gameLoop;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// DOM elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');

// Initialize the game
function init() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // Set high score from local storage
    highScoreElement.textContent = highScore;
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    // Draw initial game board
    drawBoard();
}

// Draw the game board
function drawBoard() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Initialize the snake
function createSnake() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
}

// Generate food at random position
function createFood() {
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    
    // Generate random position
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    // Make sure food doesn't appear on snake
    for (let i = 0; i < snake.length; i++) {
        if (food.x === snake[i].x && food.y === snake[i].y) {
            createFood(); // Try again
            break;
        }
    }
}

// Draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            ctx.fillStyle = '#8BC34A';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // Add eyes to the head
        if (index === 0) {
            ctx.fillStyle = '#000';
            
            // Position eyes based on direction
            const eyeSize = GRID_SIZE / 5;
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
            
            switch(direction) {
                case 'up':
                    leftEyeX = segment.x * GRID_SIZE + GRID_SIZE / 4;
                    leftEyeY = segment.y * GRID_SIZE + GRID_SIZE / 4;
                    rightEyeX = segment.x * GRID_SIZE + GRID_SIZE * 3/4;
                    rightEyeY = segment.y * GRID_SIZE + GRID_SIZE / 4;
                    break;
                case 'down':
                    leftEyeX = segment.x * GRID_SIZE + GRID_SIZE / 4;
                    leftEyeY = segment.y * GRID_SIZE + GRID_SIZE * 3/4;
                    rightEyeX = segment.x * GRID_SIZE + GRID_SIZE * 3/4;
                    rightEyeY = segment.y * GRID_SIZE + GRID_SIZE * 3/4;
                    break;
                case 'left':
                    leftEyeX = segment.x * GRID_SIZE + GRID_SIZE / 4;
                    leftEyeY = segment.y * GRID_SIZE + GRID_SIZE / 4;
                    rightEyeX = segment.x * GRID_SIZE + GRID_SIZE / 4;
                    rightEyeY = segment.y * GRID_SIZE + GRID_SIZE * 3/4;
                    break;
                case 'right':
                    leftEyeX = segment.x * GRID_SIZE + GRID_SIZE * 3/4;
                    leftEyeY = segment.y * GRID_SIZE + GRID_SIZE / 4;
                    rightEyeX = segment.x * GRID_SIZE + GRID_SIZE * 3/4;
                    rightEyeY = segment.y * GRID_SIZE + GRID_SIZE * 3/4;
                    break;
            }
            
            ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
            ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
        }
    });
}

// Draw the food
function drawFood() {
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Move the snake
function moveSnake() {
    // Update direction from nextDirection
    direction = nextDirection;
    
    // Create new head based on current direction
    const head = { x: snake[0].x, y: snake[0].y };
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Add new head to beginning of snake array
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Create new food
        createFood();
    } else {
        // Remove tail segment if no food was eaten
        snake.pop();
    }
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    
    // Check wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= gridWidth ||
        head.y >= gridHeight
    ) {
        return true;
    }
    
    // Check self collision (start from index 1 to avoid checking head against itself)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    
    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Handle keyboard input
function handleKeyPress(event) {
    // Prevent default behavior for arrow keys
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // Only change direction if game is running
    if (!gameRunning) return;
    
    // Update direction based on key press
    // Prevent 180-degree turns
    switch (event.keyCode) {
        // Left arrow
        case 37:
            if (direction !== 'right') nextDirection = 'left';
            break;
        // Up arrow
        case 38:
            if (direction !== 'down') nextDirection = 'up';
            break;
        // Right arrow
        case 39:
            if (direction !== 'left') nextDirection = 'right';
            break;
        // Down arrow
        case 40:
            if (direction !== 'up') nextDirection = 'down';
            break;
    }
}

// Main game loop
function gameUpdate() {
    // Clear the canvas
    drawBoard();
    
    // Move the snake
    moveSnake();
    
    // Check for collision
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Draw food and snake
    drawFood();
    drawSnake();
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    // Reset game state
    score = 0;
    scoreElement.textContent = score;
    direction = 'right';
    nextDirection = 'right';
    
    // Create snake and food
    createSnake();
    createFood();
    
    // Start game loop
    gameRunning = true;
    gameLoop = setInterval(gameUpdate, GAME_SPEED);
}

// Restart the game
function restartGame() {
    if (gameRunning) {
        clearInterval(gameLoop);
    }
    startGame();
}

// Initialize the game when the page loads
window.onload = init;
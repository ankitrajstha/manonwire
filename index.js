const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// canvas width and height
const canvasWidth = 1000;
const canvasHeight = 500;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// bug
const bugWidth = 45;
const bugHeight = 45;

// images
const backGround = new Image();
backGround.src = "img/bg.avif";
const bugImage = new Image();
bugImage.src = "img/bug.png";

// wires
const wires = [
  { x: canvas.width / 5, y: canvas.height },
  { x: (2 * canvas.width) / 5, y: canvas.height },
  { x: (3 * canvas.width) / 5, y: canvas.height },
  { x: (4 * canvas.width) / 5, y: canvas.height },
];

// bug position
let bugX = wires[2].x;
let bugY = canvas.height;

// draw wires
function drawWires() {
  for (let i in wires) {
    ctx.beginPath();
    ctx.moveTo(wires[i].x, 0);
    ctx.lineTo(wires[i].x, canvas.height);
    ctx.stroke();
  }
}
ctx.strokeStyle = "#000000";
ctx.lineWidth = 2;

// move bug
const moveBugSound = new Audio("sound/move.wav");
function moveBug(direction) {
  let bugWireIndex;
  wires.forEach((wire, index) => {
    if (wire.x === bugX) {
      bugWireIndex = index;
    }
  });
  bugWireIndex += direction;
  if (bugWireIndex > 3) bugWireIndex = 3;
  if (bugWireIndex < 0) bugWireIndex = 0;
  bugX = wires[bugWireIndex].x;
  moveBugSound.play();
}

window.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "ArrowRight":
      moveBug(1);
      break;
    case "ArrowLeft":
      moveBug(-1);
      break;
    default:
      "Wrong key";
  }
});

// draw bug
function drawBug() {
  ctx.drawImage(
    bugImage,
    bugX - bugWidth / 2,
    bugY - bugHeight,
    bugWidth,
    bugHeight
  );
}

//timer
let startTime;
let timerInterval;
let timerStarted = false;
let gameStarted = false;

// start timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 10);
}

// update timer
function updateTimer() {
  const elapsedTime = Date.now() - startTime;
  const minutes = Math.floor(elapsedTime / (60 * 1000));
  const seconds = Math.floor((elapsedTime % (60 * 1000)) / 1000);
  const milliseconds = elapsedTime % 1000;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;
  document.getElementById("timer").innerHTML = formattedTime;
}

// stop timer
function stopTimer() {
  clearInterval(timerInterval);
}

// score
let myScore = 0;

// obstacles
const obstacleWidth = 45;
const obstacleHeight = 45;
let obstacleSpeed = 1;
let obstacleInterval = 600;
let obstacles = [];
const obstacleImage = new Image();
obstacleImage.src = "img/bird.png";

function updateDifficulty() {
  timeSinceDifficultyIncrease += 10;
  if (timeSinceDifficultyIncrease >= difficultyIncreaseInterval) {
    obstacleSpeed += 1;
    obstacleInterval -= 100;
    timeSinceDifficultyIncrease = 0;
  }
}

// create obstacles
function createNewObstacles() {
  let randomWireIndex = Math.floor(Math.random() * wires.length);
  let obstacleX = wires[randomWireIndex].x;
  let obstacleY = obstacleHeight;
  return { x: obstacleX, y: obstacleY };
}
setInterval(() => {
  obstacles.push(createNewObstacles());
}, obstacleInterval);

// draw obstacles
function drawObstacles() {
  for (let obstacle of obstacles) {
    ctx.drawImage(
      obstacleImage,
      obstacle.x - obstacleWidth / 2,
      obstacle.y - obstacleHeight / 2,
      obstacleWidth,
      obstacleHeight
    );
  }
  updateObstacles();
}

//update obstacles
function updateObstacles() {
  for (let obstacle of obstacles) {
    obstacle.y += obstacleSpeed;
  }
  // update score
  if (obstacles.length > 0 && obstacles[0].y > canvasHeight) {
    myScore += 1;
    document.getElementById("score").textContent = myScore;
    obstacles.shift();
  }
}

// collision
const collisionSound = new Audio("sound/gameover.wav");
function isCollision(rect1, rect2) {
  return (
    rect1.x - rect1.width / 2 < rect2.x + rect2.width / 2 &&
    rect1.x + rect1.width / 2 > rect2.x - rect2.width / 2 &&
    rect1.y - rect1.height / 2 < rect2.y + rect2.height / 2 &&
    rect1.y + rect1.height / 2 > rect2.y - rect2.height / 2
  );
}

// check collision
function checkCollision() {
  const bugRect = {
    x: bugX,
    y: bugY - bugHeight,
    width: bugWidth,
    height: bugHeight,
  };

  for (let obstacle of obstacles) {
    const obstacleRect = {
      x: obstacle.x - obstacleWidth / 2,
      y: obstacle.y - obstacleHeight / 2,
      width: obstacleWidth,
      height: obstacleHeight,
    };

    if (isCollision(bugRect, obstacleRect)) {
      gameOver();
      collisionSound.play();
      return true; // Collision detected
    }
  }

  return false; // No collision detected
}

// game over
function gameOver() {
  stopTimer();
  const restart = confirm(
    `Game Over. Your score is ${myScore}. Do you want to restart?`
  );
  if (restart) {
    obstacles = [];
    myScore = 0;
    bugX = wires[2].x;
    bugY = canvasHeight;
    document.getElementById("score").textContent = "Score: " + myScore;
    animate();
    startTimer();
  } else {
    alert("Game Over.");
  }
}

//draw
function draw() {
  ctx.drawImage(backGround, 0, 0, canvas.width, canvas.height);
  drawWires();
  drawBug();
  drawObstacles();
}

// game loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw();
  if (!gameStarted) {
    alert("Press ok to start the game!");
    gameStarted = true;
  }
  if (!checkCollision()) {
    if (!timerStarted) {
      startTimer();
      timerStarted = true;
    }
    updateObstacles();
    requestAnimationFrame(animate);
  }
}

animate();
startTimer();

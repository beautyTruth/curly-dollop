// poetry, romance, ivy, and lichens -- all need ruin to grow

// our delicious GAME PARAMETERS
const PADDLE_WIDTH = 0.1; // a percentage of the screen width
const PADDLE_SPEED = 0.5; // a percentage of the screen width per second -- in this case, 2 sec to cross the screen
const BALL_SPEED = 0.45; // percentage of the screen height per second
const BALL_SPIN = 0.2; // degree of ball deflection maximum per hit (0 is the lowest, 1 is the highest)
const WALL = 0.02; // as a percentage of the shortest screen dimension
const BRICK_ROWS = 8; // the starting number of brick rows
const BRICK_COLS = 14; // the original number of brick columns
const BRICK_GAP = 0.3; // the gap between the bricks as a fraction of the wall's width
const MARGIN = 4; // the number of empty rows above the bricks (this is where the scoreboard will be)
const MAX_LEVEL = 10; // the highest level possible in the game +2 rows of bricks per level
const MIN_BOUNCE_ANGLE = 30; // the minimum bounce angle from horizontal 0 in degrees
const GAME_LIVES = 3; // the number of testicles that a cyclops has
const KEY_SCORE = "HighScore";
const BALL_SPEED_MAX = 2; // this is a multiple of the starting speed of .45
const PUP_CHANCE = 0.1; // the probability of getting a random powerup upon hitting a brick .00 to .1
const PUP_SPEED = 0.15;
const PUP_BONUS = 50;

// our sumptous colors
const COLOR_BG = "#3f0000";
const COLOR_WALL = "#580000";
const COLOR_PADDLE = "#bde0ff";
const COLOR_BALL = "#bde0ff";
const COLOR_TEXT = "#bde0ff";

// text properties
const TEXT_FONT = "sans-serif";
const TEXT_LEVEL = "Level";
const TEXT_LIVES = "Lives";
const TEXT_SCORE = "Score";
const TEXT_SCORE_HIGH = "BEST";
const TEXT_GAME_OVER = "YOU SUCK 💀";
const TEXT_WIN = "I'm Free! 🦧";

// our gorgeous directions
const DIRECTION = {
  LEFT: 0,
  RIGHT: 1,
  STOP: 2,
};

// the POWER UP types object

const PupType = {
  EXTENSION: { color: "tomato", symbol: "🍆" },
  LIFE: { color: "papayawhip", symbol: "🦧" },
  STICKY: { color: "crimson", symbol: "🍯" },
  SUPER: { color: "fuchsia", symbol: "🧨" },
};

// and now we will set up the canvas and the canvas's context
let canvasEl = document.createElement("canvas");
document.body.appendChild(canvasEl);
const CTX = canvasEl.getContext("2d");

let audBrick = new Audio("sounds/brick.m4a");
let audPaddle = new Audio("sounds/paddle.m4a");
let audPowerup = new Audio("sounds/powerup.m4a");
let audWall = new Audio("sounds/wall.m4a");

// our DIMENSIONS (which are also dynamic and responsive)
let width, height, wall;

// initialization of the PADDLE, BRICK, PUPs and BALL classes (and the touchX let)
let paddle,
  ball,
  bricks = [],
  pups = [];

let gameOver, pupExtension, pupSticky, pupSuper, win;
let level, lives, score, scoreHigh;
let numBricks, textSize, touchX;

// TOUCH EVENTS

canvasEl.addEventListener("touchcancel", touchCancel);
canvasEl.addEventListener("touchend", touchEnd);
canvasEl.addEventListener("touchmove", touchMove, { passive: true });
canvasEl.addEventListener("touchstart", touchStart, { passive: true });

// ARROW KEY EVENTS

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// ----- the RESIZE (THE WINDOW) EVENT

window.addEventListener("resize", setDimensions);

// -=-=-=-=-=- GAME LOOP GAME LOOP GAME LOOP GAME LOOP -=-=-=-=-=-=- //

function playGame() {
  requestAnimationFrame(playGame);

  // the GAME OVER logic

  if (!gameOver) {
    // UPDATE functions
    updatePaddle();
    updateBall();
    updateBricks();
    updatePups();
  }

  // draw functions

  drawBackground();
  drawWalls();
  drawPups();
  drawPaddle();
  drawBricks();
  drawText();
  drawBall();
}

// ----- the APPLY BALL SPEED function

function applyBallSpeed(angle) {
  ball.xV = ball.speed * Math.cos(angle);
  ball.yV = -ball.speed * Math.sin(angle);
}

// ----- CREATE BRICKS function
function createBricks() {
  // row dimensions
  let minY = wall;
  let maxY = ball.y - ball.h * 3.5;
  let totalSpaceY = maxY - minY;
  let totalRows = MARGIN + BRICK_ROWS + MAX_LEVEL * 2;
  let rowH = (totalSpaceY / totalRows) * 0.9;
  let gap = wall * BRICK_GAP * 0.9;
  let h = rowH - gap;

  // the text size
  textSize = rowH * MARGIN * 0.45;

  // col dimensions
  let totalSpaceX = width - wall * 2;
  let colW = (totalSpaceX - gap) / BRICK_COLS;
  let w = colW - gap;

  // reset the bricks array
  bricks = [];
  let cols = BRICK_COLS;
  let rows = BRICK_ROWS + level * 2;
  let color, left, rank, rankHigh, score, spdMult, top;

  numBricks = rows * cols;

  rankHigh = rows / 2 - 1;
  for (let i = 0; i < rows; i++) {
    bricks[i] = [];
    rank = Math.floor(i / 2);
    score = (rankHigh - rank) * 2 + 1;
    color = getBrickColor(rank, rankHigh);

    /*
    fyi -- red 0, orange 1, yellow 2, green 3 and rankHigh 3
    */

    spdMult = 1 + ((rankHigh - rank) / rankHigh) * (BALL_SPEED_MAX - 1);

    top = wall + (MARGIN + i) * rowH;
    for (let j = 0; j < cols; j++) {
      left = wall + gap + j * colW;
      bricks[i][j] = new Brick(left, top, w, h, color, score, spdMult);
    }
  }
}

// ------ our DRAW BACKGROUND function

function drawBackground() {
  CTX.fillStyle = COLOR_BG;
  CTX.fillRect(0, 0, canvasEl.width, canvasEl.height);
}

// ----- the DRAW BALL function

function drawBall() {
  CTX.fillStyle = pupSuper ? PupType.SUPER.color : COLOR_BALL;

  CTX.fillRect(ball.x - ball.w / 2, ball.y - ball.h / 2, ball.w, ball.h);
}

// ----- the DRAW BRICKS function
function drawBricks() {
  for (let row of bricks) {
    for (let brick of row) {
      if (brick == null) {
        continue;
      }

      CTX.fillStyle = brick.color;
      CTX.fillRect(brick.left, brick.top, brick.w, brick.h);
    }
  }
}

// ----- the courageous DRAW PADDLE function

function drawPaddle() {
  CTX.fillStyle = pupSticky ? PupType.STICKY.color : COLOR_PADDLE;
  CTX.fillRect(
    paddle.x - paddle.w * 0.5,
    paddle.y - paddle.h / 2,
    paddle.w,
    paddle.h
  );
}

// ----- the DRAW PUPS function

function drawPups() {
  CTX.lineWidth = wall * 0.2;
  for (let pup of pups) {
    CTX.fillStyle = pup.type.color;
    CTX.strokeStyle = pup.type.color;
    // CTX.strokeRect(pup.x - pup.w * 0.5, pup.y - pup.h * 0.5, pup.w, pup.h);
    CTX.font = `bold ${pup.h}px ${TEXT_FONT}`;
    CTX.textAlign = "center";
    CTX.fillText(pup.type.symbol, pup.x, pup.y);
  }
}

// ----- the DRAW TEXT function

function drawText() {
  CTX.fillStyle = COLOR_TEXT;

  // the dimensions
  let labelSize = textSize * 0.5;
  let margin = wall * 2;
  let maxWidth = width - margin * 2;
  let maxWidth1 = maxWidth * 0.27; // width of the text in column 1
  let maxWidth2 = maxWidth * 0.2; // width of the text in column 2
  let maxWidth3 = maxWidth * 0.2; // width of the text in column 3
  let maxWidth4 = maxWidth * 0.27; // width of the text in column 4
  let x1 = margin; // the position of column 1
  let x2 = width * 0.4; // the position of column 2
  let x3 = width * 0.6; // the position of column 3
  let x4 = width - margin; // the position of column 4
  let yLabel = wall + labelSize;
  let yValue = yLabel + textSize * 0.9;

  // drawing the actual labels
  CTX.font = `${labelSize}px ${TEXT_FONT}`;
  CTX.textAlign = "left";
  CTX.fillText(TEXT_SCORE, x1, yLabel, maxWidth1);
  CTX.textAlign = "center";
  CTX.fillText(TEXT_LIVES, x2, yLabel, maxWidth2);
  CTX.fillText(TEXT_LEVEL, x3, yLabel, maxWidth3);
  CTX.textAlign = "right";
  CTX.fillText(TEXT_SCORE_HIGH, x4, yLabel, maxWidth4);

  // filling in the values
  CTX.font = `${textSize}px ${TEXT_FONT}`;
  CTX.textAlign = "left";
  CTX.fillText(score, x1, yValue, maxWidth1);
  CTX.textAlign = "center";
  CTX.fillText(`${lives}/${GAME_LIVES}`, x2, yValue, maxWidth2);
  CTX.fillText(level, x3, yValue, maxWidth3);
  CTX.textAlign = "right";
  CTX.fillText(scoreHigh, x4, yValue, maxWidth4);

  // drawing the GAME OVER text
  if (gameOver) {
    let text = win ? TEXT_WIN : TEXT_GAME_OVER;
    CTX.font = `${textSize * 2}px ${TEXT_FONT}`;
    CTX.textAlign = "center";
    CTX.fillText(text, width / 2, paddle.y - textSize * 4, maxWidth);
  }
}

// ------ our exceptional DRAW WALLS function

function drawWalls() {
  let halfWall = wall * 0.5;
  CTX.lineWidth = wall;
  CTX.strokeStyle = COLOR_WALL;
  CTX.beginPath();
  CTX.moveTo(halfWall, height);
  CTX.lineTo(halfWall, halfWall);
  CTX.lineTo(width - halfWall, halfWall);
  CTX.lineTo(width - halfWall, height);
  CTX.stroke();
}

// ----- GET BRICK COLORS

function getBrickColor(rank, highestRank) {
  // red = 0, orange = 0.33, yellow = 0.67, green = 1
  let fraction = rank / highestRank;
  let r,
    g,
    b = 0;

  // red to orange to yellow the (increase of the green)

  if (fraction <= 0.67) {
    r = 255;
    g = (255 * fraction) / 0.67;
  }

  // yellow to green (reduce the red)
  else {
    r = (255 * (1 - fraction)) / 0.67;
    g = 255;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// ---- ARROW KEYS functions

function keyDown(e) {
  switch (e.keyCode) {
    case 32: // spacebar -- the serving of the ball
      serveBall();

      if (gameOver) {
        newGame();
      }
      break;
    case 37: // left arrow key which moves the paddle to the left
      movePaddle(DIRECTION.LEFT);
      break;
    case 39: // right arrow key which moves the paddle to the right
      movePaddle(DIRECTION.RIGHT);
      break;
  }
}

function keyUp(e) {
  switch (e.keyCode) {
    case 37:
    case 39:
      movePaddle(DIRECTION.STOP);
      break;
  }
}

// ----- the MOVE PADDLE function

function movePaddle(direction) {
  switch (direction) {
    case DIRECTION.LEFT:
      paddle.xV = -paddle.speed;
      break;
    case DIRECTION.RIGHT:
      paddle.xV = paddle.speed;
      break;
    case DIRECTION.STOP:
      paddle.xV = 0;
      break;
  }
}

// ----- NEW BALL function

function newBall() {
  // lets reset the powerups after each game
  pupExtension = false;
  pupSticky = false;
  pupSuper = false;

  paddle = new Paddle(PADDLE_WIDTH, wall, PADDLE_SPEED);
  ball = new Ball(wall, BALL_SPEED);
}

// ---- our beautiful NEW GAME function =-=-=-=-=-=-=-=-=-=-=-

function newGame() {
  level = 0;
  gameOver = false;
  score = 0;
  win = false;
  lives = GAME_LIVES;

  // get the best score from local storage
  let scoreStr = localStorage.getItem(KEY_SCORE);
  if (scoreStr == null) {
    scoreHigh = 0;
  } else {
    scoreHigh = parseInt(scoreStr);
  }

  newLevel();
}

// ---- NEW LEVEL function

function newLevel() {
  // reset the PUPS to an empty array
  pups = [];

  touchX = null;
  newBall();
  createBricks();
}

// ----- OUT OF BOUNDS function

function outOfBounds() {
  // newGame();
  lives--;
  if (lives == 0) {
    gameOver = true;
  }

  newBall();
}

// ----- the SERVE BALL function

function serveBall() {
  // check to see if the ball is already moving or has been served
  if (ball.yV != 0) {
    return false;
  }

  // randomized angle, not less than the minimum bounce angle
  let minBounceAngle = (MIN_BOUNCE_ANGLE / 180) * Math.PI; // in radians
  let range = Math.PI - minBounceAngle * 2;
  let angle = Math.random() * range + minBounceAngle;
  applyBallSpeed(pupSticky ? Math.PI / 2 : angle);
  audPaddle.play();
  return true;
}

// ---- the SET DIMENSIONS function

function setDimensions() {
  height = window.innerHeight;
  width = window.innerWidth;
  wall = WALL * (height < width ? height : width);
  canvasEl.width = width;
  canvasEl.height = height;

  CTX.textBaseline = "middle";

  newGame();
}

// ----- SPIN BALL function

function spinBall() {
  let upwards = ball.yV < 0;

  // change the angle of bounce based off of the ball spin
  // find the current angle
  let angle = Math.atan2(-ball.yV, ball.xV);
  angle += ((Math.random() * Math.PI) / 2 - Math.PI / 4) * BALL_SPIN;

  //unused concept code -- hard coded, unnacceptable

  // keep the angle between two limits (30 and 150 degrees)

  // console.log("angle default:", (angle / Math.PI) * 180);

  // if (angle < Math.PI / 6) {
  //   angle = Math.PI / 6;
  // } else if (angle > (Math.PI * 5) / 6) {
  //   angle = (Math.PI * 5) / 6;
  // }

  // console.log("angle output:", (angle / Math.PI) * 180);

  //END unused concept code

  let minBounceAngle = (MIN_BOUNCE_ANGLE / 180) * Math.PI;
  if (upwards) {
    if (angle < minBounceAngle) {
      angle = minBounceAngle;
    } else if (angle > Math.PI - minBounceAngle) {
      angle = Math.PI - minBounceAngle;
    }
  } else {
    if (angle > -minBounceAngle) {
      angle = -minBounceAngle;
    } else if (angle < -Math.PI + minBounceAngle) {
      angle = -Math.PI + minBounceAngle;
    }
  }

  applyBallSpeed(angle);
}

// ----- TOUCH EVENTS functions

// the TOUCH function // UNUSED, for reference
// function touch(x) {
//   if (!x) {
//     movePaddle(DIRECTION.STOP);
//   } else if (x > paddle.x) {
//     movePaddle(DIRECTION.RIGHT);
//   } else if (x < paddle.x) {
//     movePaddle(DIRECTION.LEFT);
//   }
// }

function touchCancel() {
  touchX = null;
  movePaddle(DIRECTION.STOP);
}

function touchEnd() {
  touchX = null;
  movePaddle(DIRECTION.STOP);
}

function touchMove(e) {
  touchX = e.touches[0].clientX;
}

function touchStart(e) {
  if (serveBall()) {
    if (gameOver) {
      newGame();
    }
    return;
  }
  touchX = e.touches[0].clientX;
}
// ----- UPDATE BALL

function updateBall() {
  // move the ball
  ball.x += (ball.xV / 1000) * 15;
  ball.y += (ball.yV / 1000) * 15;

  // bounce off a wall
  if (ball.x < wall + ball.w / 2) {
    ball.x = wall + ball.w / 2;
    ball.xV = -ball.xV;
    audWall.play();
    spinBall();
  } else if (ball.x > canvasEl.width - wall - ball.w / 2) {
    ball.x = canvasEl.width - wall - ball.w / 2;
    ball.xV = -ball.xV;
    audWall.play();
    spinBall();
  } else if (ball.y < wall + ball.h / 2) {
    ball.y = wall + ball.h / 2;
    ball.yV = -ball.yV;
    audWall.play();
    spinBall();
  }

  // bounce off of the paddle
  if (
    ball.y > paddle.y - paddle.h * 0.5 - ball.h * 0.5 &&
    ball.y < paddle.y + paddle.h * 0.5 + ball.h * 0.5 &&
    ball.x > paddle.x - paddle.w * 0.5 - ball.w * 0.5 &&
    ball.x < paddle.x + paddle.w * 0.5 + ball.w * 0.5
  ) {
    ball.y = paddle.y - paddle.h * 0.5 - ball.h * 0.5;

    audPaddle.play();

    // STICKY PUP logic
    if (pupSticky) {
      ball.xV = 0;
      ball.yV = 0;
    } else {
      ball.yV = -ball.yV;
      spinBall();
    }
  }

  // ball moves below the paddle
  if (ball.y > canvasEl.height) {
    outOfBounds();
  }
}

// ----- UPDATE BRICKS

function updateBricks() {
  // check for a ball collision with the bricks
  OUTER: for (let i = 0; i < bricks.length; i++) {
    for (let j = 0; j < BRICK_COLS; j++) {
      if (bricks[i][j] != null && bricks[i][j].intersect(ball)) {
        updateScore(bricks[i][j].score);
        ball.setSpeed(bricks[i][j].spdMult);
        if (ball.yV < 0) {
          // an upwards hit then a downwards hit
          ball.y = bricks[i][j].bottom + ball.h * 0.5;
        } else {
          ball.y = bricks[i][j].top - ball.h * 0.5;
        }

        // CREATING the POWER UPS

        if (Math.random() <= PUP_CHANCE) {
          let px = bricks[i][j].left + bricks[i][j].w / 2; // pup horizontal location
          let py = bricks[i][j].top + bricks[i][j].h / 2; // pup vertical location
          let pSize = bricks[i][j].w * 0.4;
          let pKeys = Object.keys(PupType);
          let pKey = pKeys[Math.floor(Math.random() * pKeys.length)];
          pups.push(new PowerUp(px, py, pSize, PupType[pKey]));
        }

        bricks[i][j] = null;

        if (!pupSuper) {
          ball.yV = -ball.yV;
        }

        numBricks--;
        audBrick.play();
        spinBall();
        break OUTER;
      }
    }
  }

  // check to see if it's a next level

  if (numBricks == 0) {
    if (level < MAX_LEVEL) {
      level++;
      newLevel();
    } else {
      gameOver = true;
      win = true;
      newBall();
    }
  }
}

// ----- UPDATE PADDLE

function updatePaddle() {
  // move the paddle with our touch
  if (touchX != null) {
    if (touchX > paddle.x + wall) {
      movePaddle(DIRECTION.RIGHT);
    } else if (touchX < paddle.x - wall) {
      movePaddle(DIRECTION.LEFT);
    } else {
      movePaddle(DIRECTION.STOP);
    }
  }
  // move the paddle
  let lastPaddleX = paddle.x;
  paddle.x += (paddle.xV / 1000) * 20;

  // wall collision detection for the paddle
  if (paddle.x < wall + paddle.w / 2) {
    paddle.x = wall + paddle.w / 2;
  } else if (paddle.x > canvasEl.width - wall - paddle.w / 2) {
    paddle.x = canvasEl.width - wall - paddle.w / 2;
  }

  // move the ball with the paddle when it is on the paddle
  if (ball.yV == 0) {
    ball.x += paddle.x - lastPaddleX;
  }

  // collecting the POWER UPS
  for (i = pups.length - 1; i >= 0; i--) {
    if (
      pups[i].x + pups[i].w * 0.5 > paddle.x - paddle.w * 0.5 &&
      pups[i].x - pups[i].w * 0.5 < paddle.x + paddle.w * 0.5 &&
      pups[i].y + pups[i].h * 0.5 > paddle.y - paddle.h * 0.5 &&
      pups[i].y - pups[i].h * 0.5 < paddle.y + paddle.h
    ) {
      switch (pups[i].type) {
        case PupType.EXTENSION:
          if (pupExtension) {
            score += PUP_BONUS;
          } else {
            pupExtension = true;
            paddle.w *= 2;
          }
          break;

        case PupType.LIFE:
          lives++;
          break;

        case PupType.STICKY:
          if (pupSticky) {
            score += PUP_BONUS;
          } else {
            pupSticky = true;
          }
          break;

        case PupType.SUPER:
          if (pupSuper) {
            score += PUP_BONUS;
          } else {
            pupSuper = true;
          }
          break;
      }
      pups.splice(i, 1);
      audPowerup.play();
    }
  }
}

// ----- the UPDATE PUPS function

function updatePups() {
  for (let i = pups.length - 1; i >= 0; i--) {
    pups[i].y += (pups[i].yV / 1000) * 20;

    // deletion of the PUPS when they go below the paddle
    if (pups[i].y - pups[i].h * 0.5 > height) {
      pups.splice(i, 1);
    }
  }
}

// ----- the UPDATE SCORE function

function updateScore(brickScore) {
  score += brickScore;

  // check for a high score
  if (score > scoreHigh) {
    scoreHigh = score;
    localStorage.setItem(KEY_SCORE, scoreHigh);
  }
}

// ----- the BALL CLASS
class Ball {
  constructor(ballSize, ballSpeed) {
    this.w = ballSize;
    this.h = ballSize;
    this.x = paddle.x;
    this.y = paddle.y - paddle.h / 2 - this.h / 2;
    this.speed = ballSpeed * height;
    this.xV = 0;
    this.yV = 0;
  }
  setSpeed = (spdMult) => {
    this.speed = Math.max(this.speed, BALL_SPEED * height * spdMult);
    console.log(`speed = ${this.speed}`);
  };
}

// ----- the BRICK CLASS
class Brick {
  constructor(left, top, w, h, color, score, spdMult) {
    this.w = w;
    this.h = h;
    this.left = left;
    this.top = top;
    this.bottom = top + h;
    this.right = left + w;
    this.color = color;
    this.score = score;
    this.spdMult = spdMult;

    this.intersect = (ball) => {
      let ballBottom = ball.y + ball.h / 2;
      let ballLeft = ball.x - ball.w / 2;
      let ballRight = ball.x + ball.w / 2;
      let ballTop = ball.y - ball.h / 2;

      return (
        this.left < ballRight &&
        ballLeft < this.right &&
        this.bottom > ballTop &&
        ballBottom > this.top
      );
    };
  }
}

// ------ the PADDLE CLASS
class Paddle {
  constructor(paddleWidth, paddleHeight, paddleSpeed) {
    this.w = paddleWidth * width;
    this.h = paddleHeight / 2;
    this.x = canvasEl.width / 2;
    this.y = canvasEl.height - this.h * 3;
    this.speed = paddleSpeed * width;
    this.xV = 0;
  }
}

// the POWER UP class
class PowerUp {
  constructor(x, y, size, type) {
    this.w = size;
    this.h = size;
    this.x = x;
    this.y = y;
    this.type = type;
    this.yV = PUP_SPEED * height;
  }
}

setDimensions();

playGame();

// pay attention!!!

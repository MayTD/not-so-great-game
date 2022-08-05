var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var game_score;
var lives;
var game_over;

function setup() {
  createCanvas(1024, 576);

  // load sounds
  jumpSound = loadSound("assets/jump.wav");
  jumpSound.setVolume(0.1);
  enemyTouchSound = loadSound("assets/enemyTouch.wav");
  enemyTouchSound.setVolume(0.1);
  gameOverSound = loadSound("assets/gameOver.wav");
  gameOverSound.setVolume(0.2);
  gameCompleteSound = loadSound("assets/gameComplete.wav");
  touchCollectableSound = loadSound("assets/touchCollectable.wav");
  touchCollectableSound.setVolume(0.1);
  backgroundLoopSound = loadSound("assets/backgroundLoop.mp3", () => {
    backgroundLoopSound.loop();
  });
  backgroundLoopSound.setVolume(0.1);

  // initiate game objects
  floorPos_y = (height * 3) / 4;
  game_score = 0;
  game_over = false;
  lives = 3;
  startGame();
}

function draw() {
  background(100, 155, 255); // fill the sky blue

  noStroke();
  fill(0, 155, 0);
  rect(0, floorPos_y, width, height / 4); // draw some green ground

  // start scroll logic
  push();
  translate(scrollPos, 0);

  drawClouds(); // Draw clouds
  drawMountains(); // Draw mountains
  drawTrees(); // Draw trees
  drawPlatforms(); // Draw platforms

  // Draw canyons.
  canyons.forEach((canyon) => {
    checkCanyon(canyon);
    drawCanyon(canyon);
  });

  // Draw collectable items.
  collectables.forEach((collectable) => {
    if (!collectable.isFound) {
      checkCollectable(collectable);
      drawCollectable(collectable);
    }
  });

  // Draw enemies
  enemies.forEach((enemy) => {
    enemy.draw();
    enemy.checkEnemy();
  });

  // Draw flagpole
  checkFlagpole();
  renderFlagpole();

  // end scroll logic
  pop();

  drawTokens(); // Draw life tokens.
  drawGameChar(); // Draw game character.

  // Display Game Score
  displayGameScore();

  // Display Game Over
  if (game_over) {
    displayGameOver();
  }

  // Display Game Complete
  if (flagpole.isReached) {
    displayGameComplete();
  }

  // Logic to make the game character move or the background scroll.
  // Do not move character if end of game or falling
  if (
    isLeft &&
    gameChar_y <= floorPos_y &&
    !(game_over === true || flagpole.isReached === true)
  ) {
    if (gameChar_x > width * 0.2) {
      gameChar_x -= 5;
    } else {
      scrollPos += 5;
    }
  }

  if (
    isRight &&
    gameChar_y <= floorPos_y &&
    !(game_over === true || flagpole.isReached === true)
  ) {
    if (gameChar_x < width * 0.8) {
      gameChar_x += 5;
    } else {
      scrollPos -= 5;
    }
  }

  // character will fall if not on ground or platform
  if (
    (gameChar_y < floorPos_y && !isCharOnPlatform()) ||
    gameChar_y > floorPos_y
  ) {
    isFalling = true;
    gameChar_y += 5;
  } else {
    isFalling = false;
  }

  // Update real position of gameChar for collision detection.
  gameChar_world_x = gameChar_x - scrollPos;
}

// ---------------------------
// Game Initializations Functions
// ---------------------------
function startGame() {
  gameChar_x = width / 2;
  gameChar_y = floorPos_y;

  // Variable to control the background scrolling.
  scrollPos = 0;

  // Variable to store the real position of the gameChar in the game
  // world. Needed for collision detection.
  gameChar_world_x = gameChar_x - scrollPos;

  // Boolean variables to control the movement of the game character.
  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;

  // Initialise arrays of scenery objects.
  trees_x = [100, 300, 800, 1100, 1300, 1450, 1700, 2000, 2300, 2700, 2900];
  clouds = [
    { x_pos: 130, y_pos: 100, size: 50 },
    { x_pos: 400, y_pos: 200, size: 30 },
    { x_pos: 800, y_pos: 100, size: 40 },
    { x_pos: 1030, y_pos: 200, size: 50 },
    { x_pos: 1400, y_pos: 100, size: 40 },
    { x_pos: 1730, y_pos: 200, size: 50 },
    { x_pos: 2400, y_pos: 200, size: 30 },
    { x_pos: 2600, y_pos: 100, size: 30 },
    { x_pos: 2800, y_pos: 200, size: 40 },
    { x_pos: 2000, y_pos: 100, size: 50 },
    { x_pos: 1320, y_pos: 200, size: 40 },
    { x_pos: 3100, y_pos: 100, size: 50 },
  ];
  mountains = [
    {
      x1_pos: 500,
      y1_pos: 300,
      x2_pos: 400,
      y2_pos: floorPos_y,
      x3_pos: 600,
      y3_pos: floorPos_y,
    },
    {
      x1_pos: 300,
      y1_pos: 220,
      x2_pos: 50,
      y2_pos: floorPos_y,
      x3_pos: 450,
      y3_pos: floorPos_y,
    },
    {
      x1_pos: 780,
      y1_pos: 250,
      x2_pos: 700,
      y2_pos: floorPos_y,
      x3_pos: 850,
      y3_pos: floorPos_y,
    },
    {
      x1_pos: 1500,
      y1_pos: 220,
      x2_pos: 1100,
      y2_pos: floorPos_y,
      x3_pos: 1900,
      y3_pos: floorPos_y,
    },
    {
      x1_pos: 1200,
      y1_pos: 200,
      x2_pos: 1100,
      y2_pos: floorPos_y,
      x3_pos: 1500,
      y3_pos: floorPos_y,
    },
    {
      x1_pos: 2200,
      y1_pos: 300,
      x2_pos: 1900,
      y2_pos: floorPos_y,
      x3_pos: 2400,
      y3_pos: floorPos_y,
    },
    {
      x1_pos: 2800,
      y1_pos: 250,
      x2_pos: 2700,
      y2_pos: floorPos_y,
      x3_pos: 2900,
      y3_pos: floorPos_y,
    },
  ];
  canyons = [
    { x_pos: -500, width: 500 },
    { x_pos: 700, width: 50 },
    { x_pos: 180, width: 80 },
    { x_pos: 900, width: 80 },
    { x_pos: 2080, width: 60 },
    { x_pos: 1200, width: 80 },
    { x_pos: 1800, width: 90 },
    { x_pos: 2580, width: 50 },
    { x_pos: 3300, width: 500 },
  ];
  flagpole = {
    x_pos: 3200,
    isReached: false,
  };
  collectables = [
    {
      isFound: false,
      x_pos: -90,
      y_pos: floorPos_y - 110,
      size: 20,
    },
    {
      isFound: false,
      x_pos: 940,
      y_pos: floorPos_y - 190,
      size: 20,
    },
    {
      isFound: false,
      x_pos: 1590,
      y_pos: floorPos_y - 190,
      size: 20,
    },
    {
      isFound: false,
      x_pos: 2400,
      y_pos: floorPos_y - 40,
      size: 20,
    },
    {
      isFound: false,
      x_pos: 2950,
      y_pos: floorPos_y - 40,
      size: 20,
    },
  ];
  platforms = [
    createPlatform(-130, floorPos_y - 80, 100),
    createPlatform(800, floorPos_y - 80, 50),
    createPlatform(900, floorPos_y - 160, 100),
    createPlatform(1500, floorPos_y - 80, 200),
    createPlatform(1550, floorPos_y - 160, 100),
  ];
  enemies = [
    new Enemy(100, floorPos_y, 50),
    new Enemy(1550, floorPos_y, 200),
    new Enemy(2400, floorPos_y, 100),
  ];
}

// ---------------------
// Key control functions
// ---------------------
function keyPressed() {
  // left arrow is pressed
  if (keyCode === 37) {
    isLeft = true;
  }
  // right arrow is pressed
  if (keyCode === 39) {
    isRight = true;
  }
  // space bar is pressed
  if (keyCode === 32 && (gameChar_y === floorPos_y || isCharOnPlatform())) {
    jumpSound.play();
    gameChar_y -= 150;
  }
  if (keyCode === 32 && (game_over === true || flagpole.isReached === true)) {
    game_over = false;
    lives = 3;
    game_score = 0;
    startGame();
  }
}

function keyReleased() {
  // left arrow is released
  if (keyCode === 37) {
    isLeft = false;
  }
  // right arrow is released
  if (keyCode === 39) {
    isRight = false;
  }
}

// ------------------------------
// Game character render function
// ------------------------------
function drawGameChar() {
  if (isLeft && isFalling) {
    // jumping-left code
    fill(255, 0, 0);
    ellipse(gameChar_x - 3, gameChar_y - 40, 30, 55);
    triangle(
      gameChar_x + 8,
      gameChar_y - 25,
      gameChar_x + 12,
      gameChar_y,
      gameChar_x - 2,
      gameChar_y - 15
    );
    triangle(
      gameChar_x - 8,
      gameChar_y - 15,
      gameChar_x + 5,
      gameChar_y - 2,
      gameChar_x,
      gameChar_y - 15
    );
    fill(255, 255, 255);
    ellipse(gameChar_x - 6, gameChar_y - 58, 10, 10);
    fill(0, 0, 0);
    ellipse(gameChar_x - 7, gameChar_y - 58, 5, 5);
  } else if (isRight && isFalling) {
    // jumping-right code
    fill(255, 0, 0);
    ellipse(gameChar_x + 3, gameChar_y - 40, 30, 55);
    triangle(
      gameChar_x - 8,
      gameChar_y - 25,
      gameChar_x - 12,
      gameChar_y,
      gameChar_x + 2,
      gameChar_y - 15
    );
    triangle(
      gameChar_x + 8,
      gameChar_y - 15,
      gameChar_x - 5,
      gameChar_y - 2,
      gameChar_x,
      gameChar_y - 15
    );
    fill(255, 255, 255);
    ellipse(gameChar_x + 6, gameChar_y - 58, 10, 10);
    fill(0, 0, 0);
    ellipse(gameChar_x + 7, gameChar_y - 58, 5, 5);
  } else if (isLeft) {
    // walking left code
    fill(255, 0, 0);
    ellipse(gameChar_x + 3, gameChar_y - 40, 30, 55);
    triangle(
      gameChar_x - 5,
      gameChar_y - 25,
      gameChar_x - 10,
      gameChar_y,
      gameChar_x + 2,
      gameChar_y - 15
    );
    triangle(
      gameChar_x + 17,
      gameChar_y - 30,
      gameChar_x + 15,
      gameChar_y,
      gameChar_x,
      gameChar_y - 30
    );
    fill(255, 255, 255);
    ellipse(gameChar_x - 4, gameChar_y - 50, 10, 10);
    fill(0, 0, 0);
    ellipse(gameChar_x - 5, gameChar_y - 50, 5, 5);
  } else if (isRight) {
    // walking right code
    fill(255, 0, 0);
    ellipse(gameChar_x - 3, gameChar_y - 40, 30, 55);
    triangle(
      gameChar_x + 5,
      gameChar_y - 25,
      gameChar_x + 10,
      gameChar_y,
      gameChar_x - 2,
      gameChar_y - 15
    );
    triangle(
      gameChar_x - 17,
      gameChar_y - 30,
      gameChar_x - 15,
      gameChar_y,
      gameChar_x,
      gameChar_y - 30
    );
    fill(255, 255, 255);
    ellipse(gameChar_x + 4, gameChar_y - 50, 10, 10);
    fill(0, 0, 0);
    ellipse(gameChar_x + 5, gameChar_y - 50, 5, 5);
  } else if (isFalling || isPlummeting) {
    // jumping facing forwards code
    fill(255, 0, 0);
    ellipse(gameChar_x, gameChar_y - 45, 25, 50);
    triangle(
      gameChar_x - 12,
      gameChar_y - 35,
      gameChar_x - 1,
      gameChar_y,
      gameChar_x,
      gameChar_y - 25
    );
    triangle(
      gameChar_x + 12,
      gameChar_y - 35,
      gameChar_x + 3,
      gameChar_y,
      gameChar_x,
      gameChar_y - 25
    );

    fill(255, 255, 255);
    ellipse(gameChar_x, gameChar_y - 65, 8, 5);
    fill(0, 0, 0);
    ellipse(gameChar_x, gameChar_y - 65, 4, 4);
  } else {
    // standing front facing code
    fill(255, 0, 0);
    ellipse(gameChar_x, gameChar_y - 40, 30, 55);
    triangle(
      gameChar_x - 10,
      gameChar_y - 25,
      gameChar_x - 3,
      gameChar_y,
      gameChar_x,
      gameChar_y - 15
    );
    triangle(
      gameChar_x + 10,
      gameChar_y - 25,
      gameChar_x + 3,
      gameChar_y,
      gameChar_x,
      gameChar_y - 15
    );
    fill(255, 255, 255);
    ellipse(gameChar_x, gameChar_y - 50, 10, 10);
    fill(0, 0, 0);
    ellipse(gameChar_x, gameChar_y - 50, 5, 5);
  }
}

// ---------------------------
// Background render functions
// ---------------------------
function drawClouds() {
  clouds.forEach((cloud) => {
    fill(255);
    ellipse(cloud.x_pos, cloud.y_pos, cloud.size);
    ellipse(cloud.x_pos + 30, cloud.y_pos, cloud.size + 20);
    ellipse(cloud.x_pos + 70, cloud.y_pos, cloud.size + 30);
    ellipse(cloud.x_pos + 30, cloud.y_pos, cloud.size + 20);
    ellipse(cloud.x_pos + 110, cloud.y_pos, cloud.size + 10);
    ellipse(cloud.x_pos + 90, cloud.y_pos - 20, cloud.size + 10);
  });
}

function drawMountains() {
  mountains.forEach((mountain) => {
    fill(180, 180, 180);
    triangle(
      mountain.x1_pos,
      mountain.y1_pos,
      mountain.x2_pos,
      mountain.y2_pos,
      mountain.x3_pos,
      mountain.y3_pos
    );
    fill(150, 150, 150);
    triangle(
      mountain.x1_pos + 80,
      mountain.y1_pos + 24,
      mountain.x2_pos + 100,
      mountain.y2_pos,
      mountain.x3_pos + 100,
      mountain.y3_pos
    );
  });
}

function drawTrees() {
  trees_x.forEach((treePos_x) => {
    const treePos_y = floorPos_y - 65;
    fill(150, 75, 0);
    rect(treePos_x, treePos_y, 20, 65);
    fill(0, 200, 0);
    stroke(0, 155, 0);
    ellipse(treePos_x + 10, treePos_y - 34, 60);
    ellipse(treePos_x - 10, treePos_y - 10, 50);
    ellipse(treePos_x + 30, treePos_y - 10, 50);
    noStroke();
  });
}

function renderFlagpole() {
  fill(105, 105, 105);
  rect(flagpole.x_pos, floorPos_y - 150, 10, 150);
  fill(255, 0, 0);
  if (flagpole.isReached) {
    triangle(
      flagpole.x_pos + 10,
      floorPos_y - 150,
      flagpole.x_pos + 70,
      floorPos_y - 120,
      flagpole.x_pos + 10,
      floorPos_y - 100
    );
  } else {
    fill(255, 0, 0);
    triangle(
      flagpole.x_pos + 10,
      floorPos_y - 50,
      flagpole.x_pos + 70,
      floorPos_y - 20,
      flagpole.x_pos + 10,
      floorPos_y
    );
  }
}

// ---------------------------------
// Platform factory, render, and check functions
// ---------------------------------

function createPlatform(x_pos, y_pos, width) {
  return {
    x_pos,
    y_pos,
    width,
  };
}

function drawPlatforms() {
  platforms.forEach((platform) => {
    fill(150, 75, 0);
    rect(platform.x_pos, platform.y_pos + 7, platform.width, 10);
    fill(0, 155, 0);
    rect(platform.x_pos, platform.y_pos, platform.width, 10);
  });
}

function isCharOnPlatform() {
  // character is over any platform
  return platforms.some(
    (platform) =>
      gameChar_world_x >= platform.x_pos &&
      gameChar_world_x <= platform.x_pos + platform.width &&
      gameChar_y === platform.y_pos
  );
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

function drawCanyon(t_canyon) {
  fill(78, 53, 36);
  rect(t_canyon.x_pos, floorPos_y, t_canyon.width, floorPos_y);
  fill(150, 75, 0);
  rect(t_canyon.x_pos, floorPos_y, t_canyon.width / 10, floorPos_y);
  rect(
    t_canyon.x_pos + t_canyon.width,
    floorPos_y,
    t_canyon.width / 10,
    floorPos_y
  );
}

function checkCanyon(t_canyon) {
  // falling in canyon condition
  if (
    gameChar_world_x > t_canyon.x_pos &&
    gameChar_world_x < t_canyon.x_pos + t_canyon.width &&
    gameChar_y >= floorPos_y
  ) {
    gameChar_y += 1;
    isFalling = true;
    checkPlayerDie();
  }
}

// ----------------------------------
// Collectable items render and check functions
// ---------------------------------

function drawCollectable(t_collectable) {
  stroke(200, 0, 0);
  fill(255, 0, 0);
  ellipse(t_collectable.x_pos, t_collectable.y_pos, t_collectable.size);
  ellipse(
    t_collectable.x_pos + 22,
    t_collectable.y_pos - 2,
    t_collectable.size
  );
  stroke(0, 200, 0);
  noFill();
  strokeWeight(3);
  beginShape();
  vertex(t_collectable.x_pos, t_collectable.y_pos - 5);
  vertex(t_collectable.x_pos + 14, t_collectable.y_pos - 30);
  vertex(t_collectable.x_pos + 20, t_collectable.y_pos - 10);
  endShape();
  noStroke();
}

function checkCollectable(t_collectable) {
  // character touched collectable
  if (
    dist(
      t_collectable.x_pos,
      t_collectable.y_pos,
      gameChar_world_x,
      gameChar_y
    ) <= 50
  ) {
    touchCollectableSound.play();
    t_collectable.isFound = true;
    game_score++;
  }
}

function drawTokens() {
  for (let i = 0; i < lives; i++) {
    stroke(204, 204, 0);
    fill(255, 255, 0);
    ellipse(25 + i * 20, 35, 15);
    noStroke();
  }
}

// ---------------------------------
// Score render and check functions
// ---------------------------------

function displayGameScore() {
  textSize(14);
  fill(255, 255, 255);
  text(`Score: ${game_score}`, 20, 20);
}

function displayGameOver() {
  textSize(32);
  text(`GAME OVER`, width / 2 - 100, height / 2 - 30);
  text(`Press space to continue`, width / 2 - 175, height / 2);
}

function displayGameComplete() {
  textSize(32);
  text(`LEVEL COMPLETE`, width / 2 - 150, height / 2 - 30);
  text(`Press space to continue`, width / 2 - 175, height / 2);
}

function checkFlagpole() {
  // character touched flagpole
  if (
    dist(flagpole.x_pos, floorPos_y, gameChar_world_x, gameChar_y) <= 50 &&
    !flagpole.isReached
  ) {
    flagpole.isReached = true;
    gameCompleteSound.play();
  }
}

// Check if character has remaining lives
function checkPlayerDie() {
  if (lives < 1 && !game_over) {
    game_over = true;
    gameOverSound.play();
  } else if (gameChar_y > height && !game_over) {
    startGame();
    lives--;
    gameOverSound.play();
  }
}

// ---------------------------------
// Enemies Constructor
// ---------------------------------

function Enemy(x, y, range) {
  this.originX = x;
  this.x = x;
  this.y = y;
  this.range = range;
  this.left = false;
  this.right = true;

  this.checkEnemy = function () {
    // character has touched enemy
    if (dist(this.x, this.y, gameChar_world_x, gameChar_y) <= 25) {
      gameChar_y += 1;
      isFalling = true;
      enemyTouchSound.play();
    }
    checkPlayerDie();
  };

  this.draw = function () {
    const drawing = () => {
      fill(255, 165, 0);
      arc(this.x, this.y, 40, 70, PI, PI);
      fill(255, 255, 255);
      ellipse(this.x - 8, this.y - 10, 10, 10);
      ellipse(this.x, this.y - 10, 10, 10);
      fill(0, 0, 0);
      ellipse(this.x, this.y - 10, 5, 5);
      ellipse(this.x - 9, this.y - 10, 5, 5);
    };

    // change direction of drawing so that enemy moves left and right
    if (this.x >= this.originX + this.range) {
      this.left = true;
      this.right = false;
    }
    if (this.x <= this.originX - this.range) {
      this.right = true;
      this.left = false;
    }
    if (this.left) {
      this.x--;
    } else {
      this.x++;
    }
    drawing();
  };
}

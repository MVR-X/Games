//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//plane
let planeWidth = 51; //width/height ratio = 408/228 = 17/12
let planeHeight = 36;
let planeX = boardWidth / 8;
let planeY = boardHeight / 2;
let planeImg;

let plane = {
  x: planeX,
  y: planeY,
  width: planeWidth,
  height: planeHeight,
};

//towers
let towerArray = [];
let towerWidth = 64; //width/height ratio = 384/3072 = 1/8
let towerHeight = 512;
let towerX = boardWidth;
let towerY = 0;

let toptowerImg;
let bottomtowerImg;

//physics
let velocityX = -2; //towers moving left speed
let velocityY = 0; //plane jump speed
let gravity = 0.4;

let gameStarted = false;
let gameOver = false;
let score = 0;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  // Load audio files
  collisionSound = new Audio("./collide.wav");
  fallSound = new Audio("./fall.wav");
  scoreSound = new Audio("./score.wav");
  bgSound = new Audio("./bgmusic.mp3");

  //load images
  planeImg = new Image();
  planeImg.src = "./flyplane.png";
  planeImg.onload = function () {
    context.drawImage(planeImg, plane.x, plane.y, plane.width, plane.height);
  };

  toptowerImg = new Image();
  toptowerImg.src = "./toptower.png";

  bottomtowerImg = new Image();
  bottomtowerImg.src = "./bottomtower.png";

  requestAnimationFrame(update);
  setInterval(placetowers, 1500); //every 1.5 seconds
  document.addEventListener("keydown", moveplane);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  //plane
  velocityY += gravity;
  // plane.y += velocityY;
  plane.y = Math.max(plane.y + velocityY, 0); //apply gravity to current plane.y, limit the plane.y to top of the canvas
  context.drawImage(planeImg, plane.x, plane.y, plane.width, plane.height);

  if (plane.y > board.height) {
    gameOver = true;
    fallSound.play();
  }

  //towers
  for (let i = 0; i < towerArray.length; i++) {
    let tower = towerArray[i];
    tower.x += velocityX;
    context.drawImage(tower.img, tower.x, tower.y, tower.width, tower.height);

    if (!tower.passed && plane.x > tower.x + tower.width) {
      score += 0.5; //0.5 because there are 2 towers! so 0.5*2 = 1, 1 for each set of towers
      tower.passed = true;
      scoreSound.play();
    }

    if (detectCollision(plane, tower)) {
      gameOver = true;
      collisionSound.play();
    }
  }

  //clear towers
  while (towerArray.length > 0 && towerArray[0].x < -towerWidth) {
    towerArray.shift(); //removes first element from the array
  }

  //score
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(score, 5, 45);

  if (gameOver) {
    context.fillText("GAME OVER", 5, 90);
    planeImg.src = "./flyplanedead.png";
    bgSound.pause();
  }
}

function placetowers() {
  if (gameOver) {
    return;
  }

  //(0-1) * towerHeight/2.
  // 0 -> -128 (towerHeight/4)
  // 1 -> -128 - 256 (towerHeight/4 - towerHeight/2) = -3/4 towerHeight
  let randomtowerY =
    towerY - towerHeight / 4 - Math.random() * (towerHeight / 2);
  let openingSpace = board.height / 4;

  let toptower = {
    img: toptowerImg,
    x: towerX,
    y: randomtowerY,
    width: towerWidth,
    height: towerHeight,
    passed: false,
  };
  towerArray.push(toptower);

  let bottomtower = {
    img: bottomtowerImg,
    x: towerX,
    y: randomtowerY + towerHeight + openingSpace,
    width: towerWidth,
    height: towerHeight,
    passed: false,
  };
  towerArray.push(bottomtower);
}

function moveplane(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    //jump
    velocityY = -6;
    if (!gameStarted) {
      bgSound.play();
      gameStarted = true;
    }
    //reset game
    if (gameOver) {
      bgSound.play();
      plane.y = planeY;
      towerArray = [];
      score = 0;
      planeImg.src = "./flyplane.png";
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && //a's top right corner passes b's top left corner
    a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); //a's bottom left corner passes b's top left corner
}

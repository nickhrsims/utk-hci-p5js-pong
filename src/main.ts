import { Game, GameConfig } from "./game";

const gameConfig: GameConfig = {
  score: {
    textSize: 24,
    limit: 7,
  },
  paddles: {
    width: 4,
    height: 96,
    wallGap: 64,
    speed: 0.25,
  },
  ball: {
    radius: 6,
    initialSpeed: 0.2,
    speedStep: 0.05,
    verticalEnglish: 0.05,
    activationDelay: 1200,
  },
  field: {
    width: 400,
    height: 400,
  },
  inputs: {     // Defaults Only
    p1: {
      up: 65,   // A
      down: 90, // Z
    },
    p2: {
      up: 75,   // K
      down: 77, // M
    }
  }
};

let game: Game = new Game(gameConfig);

const newGame = (): void => {
  game = new Game(gameConfig);
}

const setBallSizeTiny = (): void => {
  gameConfig.ball.radius = 2;
  newGame();
}

const setBallSizeNormal = (): void => {
  gameConfig.ball.radius = 6;
  newGame();
}

const setBallSizeLarge = (): void => {
  gameConfig.ball.radius = 10;
  newGame();
}

const setBallSizeComical = (): void => {
  gameConfig.ball.radius = 20;
  newGame();
}

const setPaddleSpeedNormal = (): void => {
  gameConfig.paddles.speed = 0.25;
  newGame();
}

const setPaddleSpeedCheat = (): void => {
  gameConfig.paddles.speed = 0.4;
  newGame();
}

const setThemeAmber = (): void => {
  fill(255, 176, 0); // AMBER-CRT
  backgroundLumosity = 0;
}

const setThemeGreen = (): void => {
  fill(51, 255, 0); // GREEN-CRT
  backgroundLumosity = 0;
}

const setThemeBlack = (): void => {
  fill(0, 0, 0);
  backgroundLumosity = 255;
}

const setThemeWhite = (): void => {
  fill(255, 255, 255);
  backgroundLumosity = 0;
}

let backgroundLumosity = 0;

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
  textSize(game.config.score.textSize);

  createButton("NEW GAME").mouseClicked(newGame);
  createP();
  createButton("Ball Size (Tiny)").mouseClicked(setBallSizeTiny);
  createButton("Ball Size (Normal)").mouseClicked(setBallSizeNormal);
  createButton("Ball Size (Large)").mouseClicked(setBallSizeLarge);
  createButton("Ball Size (Comical)").mouseClicked(setBallSizeComical);
  createP();
  createButton("Paddle Speed (Normal)").mouseClicked(setPaddleSpeedNormal);
  createButton("Paddle Speed (Cheat)").mouseClicked(setPaddleSpeedCheat);
  createP();
  createButton("Amber Theme").mouseClicked(setThemeAmber);
  createButton("Green Theme").mouseClicked(setThemeGreen);
  createButton("Black Theme").mouseClicked(setThemeBlack);
  createButton("White Theme").mouseClicked(setThemeWhite);

}

function draw() {
  background(backgroundLumosity);
  game.process(deltaTime);
}

(window as any).setup = setup;
(window as any).draw = draw;

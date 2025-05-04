import { Game, GameConfig } from "./game";

const pongMode: GameConfig = {
  score: {
    textSize: 12,
    limit: 3,
  },
  paddles: {
    width: 4,
    gap: 64,
    speed: 0.25,
    controllers: [
      {
        height: 100,
        colliderCount: 1,
      }
    ]
  },
  goal: {
    width: 8,
    heightRatio: 1,
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
  },
  debug: {
    goals: false,
    pointTime: true,
  },
};

const twoPaddleMode: GameConfig = {
  ...pongMode,
  paddles: {
    ...pongMode.paddles,
    controllers: [
      {
        height: 100,
        colliderCount: 2,
      }
    ]
  },
}

const foosballMode: GameConfig = {
  ...pongMode,
  paddles: {
    ...pongMode.paddles,
    controllers: [
      {
        height: 240,
        colliderCount: 3,
      },
      {
        height: 120,
        colliderCount: 2
      }
    ]
  },
  goal: {
    width: 8,
    heightRatio: 4,
  },
  debug: {
    goals: true,
    pointTime: pongMode.debug.pointTime,
  }
}

const gameModeSelection: 0 | 1 | 2 = 0;

const gameModes = [pongMode, twoPaddleMode, foosballMode];
const gameConfig = gameModes[gameModeSelection];

let currentGameIndex = 0;

const gameLedger: Game[] = [Game.create(gameConfig)];

const getCurrentGame = (): Game => gameLedger[currentGameIndex];

const newGame = (): void => {
  currentGameIndex += 1;
  gameLedger[currentGameIndex] = Game.create(gameConfig);
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

function saveMetrics(filename: string): void {
  saveJSON(gameLedger.map((game: Game, index: number) => ({
    match: index + 1,
    points: game.aggregatePointRecords()
  })), filename);
}

function setup() {
  const game = getCurrentGame();
  createCanvas(gameConfig.field.width, gameConfig.field.height);
  textAlign(CENTER, CENTER);
  textSize(game.config.score.textSize);
  setThemeAmber();
  createButton("NEW GAME").mouseClicked(newGame);
  createButton("Save Metrics").mouseClicked(() => saveMetrics('metrics.json'));
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
  getCurrentGame().process(deltaTime);
  getCurrentGame().drawDebug();
}

(window as any).setup = setup;
(window as any).draw = draw;

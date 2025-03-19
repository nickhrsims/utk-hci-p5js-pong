import { Game } from "./game";

const game = new Game({
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
    baseSpeed: 0.2,
    speedScale: 1.1,
    maxSpeed: 0.9,
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
});


function setup() {
  createCanvas(400, 400);
  textSize(game.config.score.textSize);
  fill(255, 176, 0); // AMBER-CRT
}

function draw() {
  background(0);
  game.process(deltaTime);
}

(window as any).setup = setup;
(window as any).draw = draw;

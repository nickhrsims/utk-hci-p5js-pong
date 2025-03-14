import { Paddle } from './paddle';

const SPEEDSCALE = 0.2;

const paddle = Paddle.create({
  position: {
    x: 64,
    y: 64,
  },
  size: {
    w: 32,
    h: 32,
  },
});

const scaleMotion = (value: number) => value * SPEEDSCALE;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  const p1up = keyIsDown(UP_ARROW) ? 1 : 0;
  const p1down = keyIsDown(DOWN_ARROW) ? 1 : 0;


  paddle.velocity = [0, scaleMotion(p1down - p1up)]

  paddle.update(deltaTime);
  paddle.draw();
}

(window as any).setup = setup;
(window as any).draw = draw;

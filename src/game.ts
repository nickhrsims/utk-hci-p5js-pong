import { randomChoice } from "./auxiliary";
import { AxisAlignedBoundingBox } from "./axis-aligned-bounding-box";
import { Ball, BallParams } from "./ball";
import { Paddle, PaddleParams } from "./paddle";

const scale = (value: number, scalar: number) => value * scalar;

export interface GameConfig {
  score: {
    textSize: number,
    limit: number,
  }
  field: {
    width: number,
    height: number,
  },
  paddles: {
    width: number,
    height: number,
    wallGap: number,
    speed: number,
  },
  ball: {
    speed: number,
    radius: number,
    verticalEnglish: number,
  },
  inputs: {     // Defaults Only
    p1: {
      up: number,
      down: number,
    },
    p2: {
      up: number,
      down: number,
    }
  }
};

export class Game {

  readonly config: GameConfig;
  private field: AxisAlignedBoundingBox;
  private leftPaddle: Paddle;
  private rightPaddle: Paddle;
  private ball: Ball;

  constructor(config: GameConfig) {

    const defaultSpawnPosition = { x: 0, y: 0 };

    // Save the config for later
    this.config = config;

    const field = AxisAlignedBoundingBox.create({
      x: defaultSpawnPosition.x,
      y: defaultSpawnPosition.y,
      w: config.field.width,
      h: config.field.height,
    });

    // Configure each paddle
    const leftPaddle = Paddle.create({
      position: defaultSpawnPosition,
      size: {
        w: config.paddles.width,
        h: config.paddles.height,
      }
    });

    const rightPaddle = Paddle.create({
      position: defaultSpawnPosition,
      size: {
        w: config.paddles.width,
        h: config.paddles.height,
      }
    });

    const ball = Ball.create({
      position: defaultSpawnPosition,
      size: {
        w: scale(config.ball.radius, 2),
        h: scale(config.ball.radius, 2),
      }
    });

    this.field = field;
    this.leftPaddle = leftPaddle;
    this.rightPaddle = rightPaddle;
    this.ball = ball;

    this.resetPaddles();
    this.resetBall();
  }

  process(delta: number) {
    this.input();
    this.update(delta);
    this.collide();
    this.draw();
  }

  resetPaddles(): void {
    const { leftPaddle, rightPaddle, field, config } = this;
    // Center-align paddles to field
    leftPaddle.position = field.center;
    rightPaddle.position = field.center;

    // Push paddles back against wall, leaving specified gap
    leftPaddle.box.left = field.left + config.paddles.wallGap;
    rightPaddle.box.right = field.right - config.paddles.wallGap;
  }

  resetBall(): void {
    const { ball, field, config } = this;

    // Place ball center field
    ball.position = field.center;

    // "Flick" the ball towards a paddle
    const [LEFT, RIGHT] = [-1, 1];
    const [SLIGHTLY_UP, SLIGHTLY_DOWN] = [-1, 1];
    const ballDirection = randomChoice([LEFT, RIGHT]);
    const angle = randomChoice([SLIGHTLY_UP, SLIGHTLY_DOWN]);
    ball.velocity = [scale(ballDirection, config.ball.speed), scale(angle, config.ball.verticalEnglish)];
  }


  private input() {
    const p1VelocityUp = keyIsDown(this.config.inputs.p1.up) ? 1 : 0;
    const p1VelocityDown = keyIsDown(this.config.inputs.p1.down) ? 1 : 0;
    const p2VelocityUp = keyIsDown(this.config.inputs.p2.up) ? 1 : 0;
    const p2VelocityDown = keyIsDown(this.config.inputs.p2.down) ? 1 : 0;

    this.leftPaddle.velocity = [0, scale(p1VelocityDown - p1VelocityUp, this.config.paddles.speed)];
    this.rightPaddle.velocity = [0, scale(p2VelocityDown - p2VelocityUp, this.config.paddles.speed)];
  }

  private update(delta: number) {
    this.leftPaddle.update(delta);
    this.rightPaddle.update(delta);
    this.ball.update(delta);
  }

  private collide() {

  }

  private draw() {
    this.leftPaddle.draw();
    this.rightPaddle.draw();
    this.ball.draw();
  }
}

import { randomChoice } from "./auxiliary";
import { AxisAlignedBoundingBox } from "./axis-aligned-bounding-box";
import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Vector2 } from "./vector2";

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
    initialSpeed: number,
    speedStep: number,
    radius: number,
    verticalEnglish: number,
    activationDelay: number,
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
  },
  bonus: {
    fuseball: boolean,
  },
};

export enum Direction {
  left = -1,
  right = 1,
};

export interface GameParams {
  readonly config: GameConfig;
  field: AxisAlignedBoundingBox;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  leftScore: number;
  rightScore: number;
}

export class Game {

  readonly config: GameConfig;
  protected field: AxisAlignedBoundingBox;
  protected leftPaddle: Paddle;
  protected rightPaddle: Paddle;
  protected ball: Ball;
  protected leftScore: number;
  protected rightScore: number;

  protected constructor(params: GameParams) {
    this.config = params.config
    this.field = params.field;
    this.leftPaddle = params.leftPaddle;
    this.rightPaddle = params.rightPaddle;
    this.ball = params.ball;
    this.leftScore = params.leftScore;
    this.rightScore = params.rightScore;
  }

  static create(config: GameConfig): Game {

    const defaultSpawnPosition = { x: 0, y: 0 };

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
      },
      speed: config.paddles.speed,
    });

    const rightPaddle = Paddle.create({
      position: defaultSpawnPosition,
      size: {
        w: config.paddles.width,
        h: config.paddles.height,
      },
      speed: config.paddles.speed,
    });

    const ball = Ball.create({
      position: defaultSpawnPosition,
      size: {
        w: config.ball.radius * 2,
        h: config.ball.radius * 2,
      },
      speed: config.ball.initialSpeed,
    });


    const params: GameParams = {
      config,
      field,
      leftPaddle,
      rightPaddle,
      ball,
      leftScore: 0,
      rightScore: 0,
    }

    const game = new Game(params);
    game.resetPaddles();
    game.resetBall();

    return game;
  }

  process(delta: number): void {
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

    // Scale velocity to default, and hold ball in place until ready for release
    ball.direction = [0, 0];
    ball.speed = config.ball.initialSpeed;

    // "Release" the ball towards a paddle
    const releaseBall = () => {
      const [LEFT, RIGHT] = [-1, 1];
      const horizontalDirection = randomChoice([LEFT, RIGHT]);
      ball.direction = [horizontalDirection, -config.ball.initialSpeed / 2];
    }

    setTimeout(releaseBall, config.ball.activationDelay);
  }


  protected input() {
    const p1VelocityUp = keyIsDown(this.config.inputs.p1.up) ? 1 : 0;
    const p1VelocityDown = keyIsDown(this.config.inputs.p1.down) ? 1 : 0;
    const p2VelocityUp = keyIsDown(this.config.inputs.p2.up) ? 1 : 0;
    const p2VelocityDown = keyIsDown(this.config.inputs.p2.down) ? 1 : 0;

    this.leftPaddle.direction = [0, p1VelocityDown - p1VelocityUp];
    this.rightPaddle.direction = [0, p2VelocityDown - p2VelocityUp];
  }

  protected update(delta: number) {
    this.leftPaddle.update(delta);
    this.rightPaddle.update(delta);
    this.ball.update(delta);
  }

  protected collide() {
    const { leftPaddle, rightPaddle, ball, field } = this;

    // --- Paddles <--> Field

    if (leftPaddle.box.top < field.top) {
      leftPaddle.box.top = field.top + 1;
    }

    else if (leftPaddle.box.bottom > field.bottom) {
      leftPaddle.box.bottom = field.bottom - 1;
    }

    if (rightPaddle.box.top < field.top) {
      rightPaddle.box.top = field.top + 1;
    }

    else if (rightPaddle.box.bottom > field.bottom) {
      rightPaddle.box.bottom = field.bottom - 1;
    }

    // --- Ball <--> Paddles

    if (ball.isColliding(leftPaddle)) {
      this.bounceBallOff(leftPaddle, Direction.right);
    }

    else if (ball.isColliding(rightPaddle)) {
      this.bounceBallOff(rightPaddle, Direction.left);
    }

    // --- Ball <--> Field

    // If ball beyond top of field
    if (ball.box.top < field.top) {
      this.bounceBallDown();
    }

    // If ball beyond bottom of field
    else if (field.bottom < ball.box.bottom) {
      this.bounceBallUp();
    }

    // --- Ball <--> Goals

    else if (ball.box.left < field.left) {
      this.rightScore += 1;
      this.resetBall();
      if (this.rightScore >= this.config.score.limit) {
        this.process = this.gameover;
      }
    }

    else if (ball.box.right > field.right) {
      this.leftScore += 1;
      this.resetBall();
      if (this.leftScore >= this.config.score.limit) {
        this.process = this.gameover;
      }
    }
  }

  protected draw() {
    const MARGIN = 4; // Used for almost anything
    const RIGHT_MARGIN = 16; // Used for spacing the right-score from the right-side
    text(str(this.leftScore), this.config.score.textSize + MARGIN, this.config.score.textSize + MARGIN);
    text(str(this.rightScore), this.field.right - (this.config.score.textSize + RIGHT_MARGIN), this.config.score.textSize + MARGIN);
    this.leftPaddle.draw();
    this.rightPaddle.draw();
    this.ball.draw();
  }

  protected bounceBallOff(paddle: Paddle, direction: Direction) {
    const [X, Y] = [0, 1];
    const RANGE = 90;
    const RADIANS = Math.PI / 180;

    const { config, ball } = this;

    // Normalized vertical distance between ball center and paddle center
    const angularScalar = (ball.position[Y] - paddle.position[Y]) / config.paddles.height;

    const phi = angularScalar * RANGE * RADIANS;

    const collisionVector: Vector2 = [Math.cos(phi), Math.sin(phi)];

    ball.direction = [collisionVector[X] * direction, collisionVector[Y]];
    ball.speed += config.ball.speedStep;
  }

  protected bounceBallUp() {
    const { ball } = this;
    const [horizontalVelocity, verticalVelocity] = ball.direction;
    ball.direction = [horizontalVelocity, -Math.abs(verticalVelocity)];
  }

  protected bounceBallDown() {
    const { ball } = this;
    const [horizontalVelocity, verticalVelocity] = ball.direction;
    ball.direction = [horizontalVelocity, Math.abs(verticalVelocity)];
  }

  protected gameover(): void {
    const [x, y] = this.field.center;
    this.draw();
    text("GAME OVER", x, y - this.config.ball.radius * 8);
  }
}

import { Paddle, PaddleParams } from "./paddle";
import { Game, GameParams, GameConfig, Direction } from './game';
import { AxisAlignedBoundingBox } from "./axis-aligned-bounding-box";
import { Ball } from "./ball";
import { Vector2 } from './vector2';

export interface FuseballGameParams extends GameParams {
  ltPaddle: Paddle;
  lbPaddle: Paddle;
  rtPaddle: Paddle;
  rbPaddle: Paddle;
}

export class FuseballGame extends Game {

  protected ltPaddle: Paddle;
  protected lbPaddle: Paddle;
  protected rtPaddle: Paddle;
  protected rbPaddle: Paddle;

  protected constructor(params: FuseballGameParams) {
    super(params);
    this.ltPaddle = params.ltPaddle;
    this.lbPaddle = params.lbPaddle;
    this.rtPaddle = params.rtPaddle;
    this.rbPaddle = params.rbPaddle;
  }

  static create(config: GameConfig): FuseballGame {

    // All entities start life in the center
    const defaultSpawnPosition = { x: 0, y: 0 };

    // Pepare sub-paddle parameters, all share the same data inputs
    const subPaddleParams: PaddleParams = {
      position: defaultSpawnPosition,
      size: {
        w: config.paddles.width,
        h: config.paddles.height / 3,
      },
      speed: config.paddles.speed,
    }


    // Configure game field
    const field = AxisAlignedBoundingBox.create({
      x: defaultSpawnPosition.x,
      y: defaultSpawnPosition.y,
      w: config.field.width,
      h: config.field.height,
    });

    // Configure main paddles
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

    // Configure ball
    const ball = Ball.create({
      position: defaultSpawnPosition,
      size: {
        w: config.ball.radius * 2,
        h: config.ball.radius * 2,
      },
      speed: config.ball.initialSpeed,
    });

    // Configure sub-paddles
    const ltPaddle = Paddle.create(subPaddleParams);
    const lbPaddle = Paddle.create(subPaddleParams);
    const rtPaddle = Paddle.create(subPaddleParams);
    const rbPaddle = Paddle.create(subPaddleParams);


    const params: FuseballGameParams = {
      config,
      field,
      leftPaddle,
      rightPaddle,
      ball,
      ltPaddle,
      lbPaddle,
      rtPaddle,
      rbPaddle,
      leftScore: 0,
      rightScore: 0,
    }

    const game = new FuseballGame(params);
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

  override resetPaddles(): void {
    const { leftPaddle, rightPaddle, ltPaddle, lbPaddle, rtPaddle, rbPaddle, field, config } = this;
    // Center-align paddles to field
    leftPaddle.position = field.center;
    rightPaddle.position = field.center;

    // Push paddles back against wall, leaving specified gap
    leftPaddle.box.left = field.left + config.paddles.wallGap;
    rightPaddle.box.right = field.right - config.paddles.wallGap;

    // Align sub-paddles
    ltPaddle.box.top = leftPaddle.box.top;
    lbPaddle.box.bottom = leftPaddle.box.bottom;
    rtPaddle.box.top = rightPaddle.box.top;
    rbPaddle.box.bottom = rightPaddle.box.bottom;

  }

  protected override update(delta: number): void {
    // Update primary paddles
    this.leftPaddle.update(delta);
    this.rightPaddle.update(delta);
    // Align sub-paddles to primary
    this.ltPaddle.box.left = this.leftPaddle.box.left;
    this.ltPaddle.box.top = this.leftPaddle.box.top;
    this.lbPaddle.box.left = this.leftPaddle.box.left;
    this.lbPaddle.box.bottom = this.leftPaddle.box.bottom;
    this.rtPaddle.box.left = this.rightPaddle.box.left;
    this.rtPaddle.box.top = this.rightPaddle.box.top;
    this.rbPaddle.box.left = this.rightPaddle.box.left;
    this.rbPaddle.box.bottom = this.rightPaddle.box.bottom;
    // Update ball
    this.ball.update(delta);
  }

  protected override collide() {
    const { leftPaddle, rightPaddle, ltPaddle, lbPaddle, rtPaddle, rbPaddle, ball, field } = this;

    // --- Primary Paddles <--> Field

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


    // --- Ball <--> Sub Paddles

    if (ball.isColliding(ltPaddle)) {
      this.bounceBallOff(ltPaddle, Direction.right);
    }

    else if (ball.isColliding(lbPaddle)) {
      this.bounceBallOff(lbPaddle, Direction.right);
    }


    else if (ball.isColliding(rtPaddle)) {
      this.bounceBallOff(rtPaddle, Direction.left);
    }

    else if (ball.isColliding(rbPaddle)) {
      this.bounceBallOff(rbPaddle, Direction.left);
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
      if (this.leftScore >= this.config.score.limit) {
        this.process = this.gameover;
      }
    }

    else if (ball.box.right > field.right) {
      this.leftScore += 1;
      this.resetBall();
      if (this.rightScore >= this.config.score.limit) {
        this.process = this.gameover;
      }
    }
  }

  protected override draw() {
    const MARGIN = 4; // Used for almost anything
    const RIGHT_MARGIN = 16; // Used for spacing the right-score from the right-side
    text(str(this.leftScore), this.config.score.textSize + MARGIN, this.config.score.textSize + MARGIN);
    text(str(this.rightScore), this.field.right - (this.config.score.textSize + RIGHT_MARGIN), this.config.score.textSize + MARGIN);
    this.ltPaddle.draw();
    this.lbPaddle.draw();
    this.rtPaddle.draw();
    this.rbPaddle.draw();
    this.ball.draw();
  }

  protected override bounceBallOff(paddle: Paddle, direction: Direction) {
    const [X, Y] = [0, 1];
    const RANGE = 90;
    const RADIANS = Math.PI / 180;

    const { config, ball } = this;

    // Normalized vertical distance between ball center and paddle center
    const angularScalar = (ball.position[Y] - paddle.position[Y]) / config.paddles.height * 3;

    const phi = angularScalar * RANGE * RADIANS;

    const collisionVector: Vector2 = [Math.cos(phi), Math.sin(phi)];

    ball.direction = [collisionVector[X] * direction, collisionVector[Y]];
    ball.speed += config.ball.speedStep;
  }

}

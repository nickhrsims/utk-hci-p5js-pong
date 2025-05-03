import { randomChoice, range } from "./auxiliary";
import { AxisAlignedBoundingBox } from "./axis-aligned-bounding-box";
import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Vector2 } from "./vector2";
import { PointLedger } from './point-ledger';

type ColliderTuple = [Paddle, number]
type ColliderGroup = ColliderTuple[];
type PaddleGroup = [Paddle, ColliderGroup][];

const getSegmentsPerCollider = (colliderCount: number): number => 2 * colliderCount - 1;

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
    speed: number,
    gap: number,
    controllers: {
      height: number,
      colliderCount: number,
    }[]
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
  leftPaddles: PaddleGroup;
  rightPaddles: PaddleGroup;
  ball: Ball;
  leftScore: number;
  rightScore: number;
}

export class Game {

  readonly config: GameConfig;
  protected field: AxisAlignedBoundingBox;
  protected leftPaddles: PaddleGroup;
  protected rightPaddles: PaddleGroup;
  protected ball: Ball;
  protected leftScore: number;
  protected rightScore: number;
  protected ledger: PointLedger;

  protected constructor(params: GameParams) {
    this.config = params.config
    this.field = params.field;
    this.leftPaddles = params.leftPaddles;
    this.rightPaddles = params.rightPaddles;
    this.ball = params.ball;
    this.leftScore = params.leftScore;
    this.rightScore = params.rightScore;
    this.ledger = PointLedger.create();
  }

  static create(config: GameConfig): Game {

    const defaultSpawnPosition = { x: 0, y: 0 };

    const field = AxisAlignedBoundingBox.create({
      x: defaultSpawnPosition.x,
      y: defaultSpawnPosition.y,
      w: config.field.width,
      h: config.field.height,
    });

    const createPaddleGroup = (): PaddleGroup => config.paddles.controllers.map((controllerConfig) => {
      // Create paddle
      const controller = Paddle.create({
        position: defaultSpawnPosition,
        size: {
          w: config.paddles.width,
          h: controllerConfig.height,
        },
        speed: config.paddles.speed,
      });
      // Create colliders
      const segmentsCount = getSegmentsPerCollider(controllerConfig.colliderCount);
      const segmentHeight = Math.floor(controllerConfig.height / segmentsCount);
      const colliders = range(controllerConfig.colliderCount).map((index): ColliderTuple => {
        const colliderOffset = 2 * index * segmentHeight;
        const collider = Paddle.create({
          position: defaultSpawnPosition, // colliders are put in place during each update phase
          size: {
            w: config.paddles.width,
            h: segmentHeight,
          },
          // colliders do not have real velocity
          speed: 0,
        });
        return [collider, colliderOffset];
      })
      // return paddle
      return [controller, colliders];
    });

    // Configure each control path with colliders
    const leftPaddles: PaddleGroup = createPaddleGroup();
    const rightPaddles: PaddleGroup = createPaddleGroup();

    // Create ball
    const ball = Ball.create({
      position: defaultSpawnPosition,
      size: {
        w: config.ball.radius * 2,
        h: config.ball.radius * 2,
      },
      speed: config.ball.initialSpeed,
      logMotion: (delta: number): void => { game.ledger.logBallMotion(delta) },
    });

    const params: GameParams = {
      config,
      field,
      leftPaddles,
      rightPaddles,
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

  aggregateMetrics() {
    return this.ledger.aggregate();
  }

  resetPaddles(): void {
    const { leftPaddles, rightPaddles, field, config } = this;
    leftPaddles.forEach(([controller, ..._], index) => {
      controller.position = field.center;
      controller.box.left = field.left + (config.paddles.gap * (index + 1));
    });
    rightPaddles.forEach(([controller, ..._], index) => {
      controller.position = field.center;
      controller.box.right = field.right - (config.paddles.gap * (index + 1));
    });
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

    this.leftPaddles.forEach(([controller, ..._]) => {
      controller.direction = [0, p1VelocityDown - p1VelocityUp];
    })
    this.rightPaddles.forEach(([controller, ..._]) => {
      controller.direction = [0, p2VelocityDown - p2VelocityUp];
    });
  }

  protected update(delta: number) {
    this.leftPaddles.forEach(([controller, tuples]) => {
      controller.update(delta);
      tuples.forEach(([collider, offset]) => {
        collider.box.left = controller.box.left;
        collider.box.top = controller.box.top + offset;
      });
    });
    this.rightPaddles.forEach(([controller, tuples]) => {
      controller.update(delta);
      tuples.forEach(([collider, offset]) => {
        collider.box.left = controller.box.left;
        collider.box.top = controller.box.top + offset;
      });
    });
    this.ball.update(delta);
  }

  protected collide() {
    const { leftPaddles, rightPaddles, ball, field } = this;

    // --- Paddles <--> Field

    leftPaddles.forEach(([controller, ..._]) => {
      if (controller.box.top < field.top) {
        controller.box.top = field.top + 1;
      }
      else if (controller.box.bottom > field.bottom) {
        controller.box.bottom = field.bottom - 1;
      }
    });

    rightPaddles.forEach(([controller, ..._]) => {
      if (controller.box.top < field.top) {
        controller.box.top = field.top + 1;
      }
      else if (controller.box.bottom > field.bottom) {
        controller.box.bottom = field.bottom - 1;
      }
    });


    // --- Ball <--> Paddles

    leftPaddles.forEach(([_, tuples]) => tuples.forEach(([collider, ..._]) => {
      if (ball.isColliding(collider)) {
        this.bounceBallOff(collider, Direction.right);
      }
    }));

    rightPaddles.forEach(([_, tuples]) => tuples.forEach(([collider, ..._]) => {
      if (ball.isColliding(collider)) {
        this.bounceBallOff(collider, Direction.left);
      }
    }));


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
        this.ledger.logPoint('right', true);
      } else {
        this.ledger.logPoint('right', false);
      }
    }

    else if (ball.box.right > field.right) {
      this.leftScore += 1;
      this.resetBall();
      if (this.leftScore >= this.config.score.limit) {
        this.process = this.gameover;
        this.ledger.logPoint('left', true);
      } else {
        this.ledger.logPoint('left', false);
      }
    }

  }

  protected draw() {
    const MARGIN = 4; // Used for almost anything
    const RIGHT_MARGIN = 16; // Used for spacing the right-score from the right-side
    text(str(this.leftScore), this.config.score.textSize + MARGIN, this.config.score.textSize + MARGIN);
    text(str(this.rightScore), this.field.right - (this.config.score.textSize + RIGHT_MARGIN), this.config.score.textSize + MARGIN);
    this.leftPaddles.forEach(([_, tuples]) => {
      tuples.forEach(([collider, _]) => {
        collider.draw();
      });
    });
    this.rightPaddles.forEach(([_, tuples]) => {
      tuples.forEach(([collider, _]) => {
        collider.draw();
      });
    });
    this.ball.draw();
  }

  public drawDebug() {
    const horizontalMargin = this.config.score.textSize * 4;
    const verticalMargin = this.config.score.textSize * 2;
    this.ledger.draw(this.field.right - horizontalMargin, this.field.bottom - verticalMargin);
  }

  protected bounceBallOff(paddle: Paddle, direction: Direction) {
    const [X, Y] = [0, 1];
    const RANGE = 90;
    const RADIANS = Math.PI / 180;

    const { config, ball } = this;
    // Normalized vertical distance between ball center and paddle center
    const angularScalar = (ball.position[Y] - paddle.position[Y]) / paddle.box.size[Y];

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

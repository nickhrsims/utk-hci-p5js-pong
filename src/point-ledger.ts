import { GameConfig } from "./game";

interface PointRecordProps {
  /* Point number. */
  point: number;
  /* Duration is only track while ball is actually in motion. */
  duration: number;
  /* Which side scored a goal? */
  scoredBy: 'left' | 'right' | 'none';
  /* Is game over? */
  gameOver: boolean;
  /* How many ball-paddle collisions occured for each player? */
  leftHits: number;
  rightHits: number;
  /* Config Info */
  ballSize: number;
  ballSpeed: number;
  paddleSpeed: number;

};

class PointRecord {
  props: PointRecordProps;

  private constructor(props: PointRecordProps) {
    this.props = props;
  }

  static create(props: PointRecordProps): PointRecord {
    return new PointRecord(props);
  }
}

class LedgerState {
  pointDuration: number;
  leftHits: number;
  rightHits: number;
  ballSize: number;
  ballSpeed: number;
  paddleSpeed: number;

  /* Used to ensure accuracy due to how collisions work. */
  lastHit: 'left' | 'right' | 'none';

  constructor() {
    this.pointDuration = 0;
    this.leftHits = 0;
    this.rightHits = 0;
    this.lastHit = 'none';
    this.ballSize = 0;
    this.ballSpeed = 0;
    this.paddleSpeed = 0;
  }
}

export class PointLedger {
  private records: PointRecord[];
  private state: LedgerState;

  private constructor() {
    this.records = [];
    this.state = new LedgerState();
  }

  static create(): PointLedger {
    return new PointLedger();
  }

  draw(x: number, y: number): void {
    const roundDurationSeconds = Math.floor(this.state.pointDuration / 1000);
    text(str(roundDurationSeconds), x, y);
  }

  aggregate(): PointRecordProps[] {
    return this.records.map((record) => record.props);
  }

  logPoint(scoredBy: 'left' | 'right', gameOver: boolean): void {
    this.records.push(PointRecord.create({
      point: this.records.length + 1,
      duration: this.state.pointDuration,
      scoredBy,
      gameOver,
      leftHits: this.state.leftHits,
      rightHits: this.state.rightHits,
      ballSize: this.state.ballSize,
      ballSpeed: this.state.ballSpeed,
      paddleSpeed: this.state.paddleSpeed,
    }));
    this.state = new LedgerState();
  }

  logLeftHit(): void {
    if (this.state.lastHit != 'left') {
      this.state.leftHits += 1;
      this.state.lastHit = 'left';
    }
  }

  logRightHit(): void {
    if (this.state.lastHit != 'right') {
      this.state.rightHits += 1;
      this.state.lastHit = 'right';
    }
  }

  logBallMotion(delta: number): void {
    this.state.pointDuration += delta;
  }

  saveConfig(config: GameConfig): void {
    this.state.ballSize = config.ball.radius;
    this.state.ballSpeed = config.ball.initialSpeed;
    this.state.paddleSpeed = config.paddles.speed;
  }
}


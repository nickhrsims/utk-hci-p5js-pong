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
  /* Total Hits left/right */
  // totalHitsLeft: number;
  // totalHitsRight: number;
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

  /* Used to ensure accuracy due to how collisions work. */
  lastHit: 'left' | 'right' | 'none';

  constructor() {
    this.pointDuration = 0;
    this.leftHits = 0;
    this.rightHits = 0;
    this.lastHit = 'none';
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
}


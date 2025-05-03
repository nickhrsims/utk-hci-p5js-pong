interface PointRecordProps {
  /* Point number. */
  id: number;
  /* Duration is only track while ball is actually in motion. */
  duration: number;
  /* Which side scored a goal? */
  scoredBy: 'left' | 'right' | 'none';
  /* Is game over? */
  gameOver: boolean;
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

  constructor() {
    this.pointDuration = 0;
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
      id: this.records.length + 1,
      duration: this.state.pointDuration,
      scoredBy,
      gameOver,
    }));
    this.state = new LedgerState();
  }


  logBallMotion(delta: number): void {
    this.state.pointDuration += delta;
  }
}


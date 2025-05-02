import { Entity, EntityParams } from './entity';

export interface BallParams extends EntityParams {
  logMotion: (delta: number) => void;
};

export class Ball extends Entity {

  logMotion: (delta: number) => void;

  private constructor(readonly params: BallParams) {
    super(params);
    this.logMotion = params.logMotion;
  }

  static create(params: BallParams): Ball {
    return new Ball(params);
  }

  override update(delta: number): void {
    super.update(delta);
    const isInMotion = this.direction[0] || this.direction[1];
    if (isInMotion) {
      this.logMotion(delta);
    }
  }

  override draw(): void {
    const [x, y] = this.box.center;
    const radius = this.box.size[0];
    circle(x, y, radius);
  }
}

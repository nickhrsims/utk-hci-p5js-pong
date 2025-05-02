import { Entity, EntityParams } from './entity';

export interface BallParams extends EntityParams { };

export class Ball extends Entity {

  private constructor(readonly params: BallParams) {
    super(params);
  }

  static create(params: BallParams): Ball {
    return new Ball(params);
  }

  override draw(): void {
    const [x, y] = this.box.center;
    const radius = this.box.size[0];
    circle(x, y, radius);
  }
}

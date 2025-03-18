import { Entity, EntityParams } from './entity';

export interface BallParams extends EntityParams { };

export class Ball extends Entity {

  private constructor(readonly params: BallParams) {
    super(params);
  }

  static create(params: BallParams) {
    return new Ball(params);
  }

  override draw(): void {
    const radius = this.box.size[0];
    circle(this.box.left, this.box.top, radius);
  }
}

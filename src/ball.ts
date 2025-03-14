import { Entity, EntityParams } from './entity';

export interface BallParams extends EntityParams { };

export class Ball extends Entity {

  private constructor(readonly params: BallParams) {
    super(params);
  }

  static create(params: BallParams) {
    return new Ball(params);
  }
}

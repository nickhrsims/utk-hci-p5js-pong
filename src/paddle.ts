import { Entity, EntityParams } from './entity';

export interface PaddleParams extends EntityParams { };

export class Paddle extends Entity {

  private constructor(readonly params: PaddleParams) {
    super(params);
  }

  static create(params: PaddleParams) {
    return new Paddle(params);
  }
}

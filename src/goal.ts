import { Entity, EntityParams } from './entity';

export interface GoalParams extends EntityParams { };

export class Goal extends Entity {

  private constructor(readonly params: GoalParams) {
    super(params);
  }

  static create(params: GoalParams) {
    return new Goal(params);
  }
}

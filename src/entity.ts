import { AxisAlignedBoundingBox } from './axis-aligned-bounding-box';
import { Vector2 } from './vector2';

export interface EntityParams {
  position: {
    x: number;
    y: number;
  },
  size: {
    w: number,
    h: number,
  },
};

export abstract class Entity {

  // Who said encapsulation violation ever hurt anyone?

  box: AxisAlignedBoundingBox;
  velocity: Vector2;

  draw(): void {
    this.box.draw();
  }

  update(delta: number): void {
    const [x, y] = this.position;
    const [vx, vy] = this.velocity;
    this.box.center = [x + (vx * delta), y + (vy * delta)];
  }

  get position(): Vector2 {
    return this.box.center;
  }

  set position(center: Vector2) {
    this.box.center = center;
  }

  protected constructor(readonly params: EntityParams) {
    const { position: { x, y }, size: { w, h } } = params;
    this.box = AxisAlignedBoundingBox.create({ x, y, w, h });
    this.velocity = [0, 0];
  }


}

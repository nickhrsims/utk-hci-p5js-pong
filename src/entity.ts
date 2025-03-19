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
  speed: number,
};

export abstract class Entity {

  // Who said encapsulation violation ever hurt anyone?

  box: AxisAlignedBoundingBox;
  direction: Vector2;
  speed: number;

  draw(): void {
    this.box.draw();
  }

  update(delta: number): void {
    const [x, y] = this.position;
    const [vx, vy] = this.direction;
    const { speed } = this;
    this.box.center = [x + (vx * delta) * speed, y + (vy * delta) * speed];
  }

  get position(): Vector2 {
    return this.box.center;
  }

  set position(center: Vector2) {
    this.box.center = center;
  }

  isColliding(rhs: Entity): boolean {
    const origin: Vector2 = [0, 0];
    return this.box.minkowskiDifference(rhs.box).contains(origin);
  }

  protected constructor(readonly params: EntityParams) {
    const { position: { x, y }, size: { w, h }, speed } = params;
    this.box = AxisAlignedBoundingBox.create({ x, y, w, h });
    this.direction = [0, 0];
    this.speed = speed;
  }
}

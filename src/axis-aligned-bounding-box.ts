import { Vector2 } from './vector2';

const radius = (diameter: number): number => diameter / 2;

export type AxisAlignedBoundingBoxParams = {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class AxisAlignedBoundingBox {
  private x: number;
  private y: number;
  private w: number;
  private h: number;

  private constructor(params: AxisAlignedBoundingBoxParams) {
    const { x, y, w, h } = params;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  static create(params: AxisAlignedBoundingBoxParams) {
    return new AxisAlignedBoundingBox(params);
  }

  draw(): void {
    const { x, y, w, h } = this;
    rect(x, y, w, h);
  }

  get position(): Vector2 {
    const { x, y } = this;
    return [x, y];
  }

  set position(vec2: Vector2) {
    const [x, y] = vec2;
    this.x = x;
    this.y = y;
  }

  get center(): Vector2 {
    const { x, y, w, h } = this;
    return [
      x + radius(w),
      y + radius(h),
    ];
  }

  set center(vec2: Vector2) {
    const [x, y] = vec2;
    const { w, h } = this;
    this.x = x - radius(w);
    this.y = y - radius(h);
  }

  get top(): number {
    return this.y;
  }

  set top(value: number) {
    this.y = value;
  }

  get left(): number {
    return this.x;
  }

  set left(value: number) {
    this.x = value;
  }

  get right(): number {
    return this.x + this.w;
  }

  set right(value: number) {
    this.x = value - this.w;
  }

  get bottom(): number {
    return this.y + this.h;
  }

  set bottom(value: number) {
    this.y = value - this.h;
  }

  isBoundedWithin(parent: AxisAlignedBoundingBox): boolean {
    return parent.left < this.left && this.right < parent.right && parent.top < this.top && this.bottom < parent.bottom;
  }
}

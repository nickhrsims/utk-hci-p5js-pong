function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}

(window as any).setup = setup;
(window as any).draw = draw;

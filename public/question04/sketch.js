const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
const GROUND = CANVAS_HEIGHT - 10;
const CEILING = 10;
const XPOS = 0.5;

let itemAButton, itemBButton, itemCButton, itemDButton, itemEButton, startButtonR;

let truck, car;

let isRunning = false;
let update;

let truck1, truck2, car1, car2, aspect1, aspect2, aspect22;
function preload() {
  // Adjust the path to where your PNG is stored
  truck1 = loadImage('../figs/truck1.png');
  truck2 = loadImage('../figs/truck2.png');
  aspect1 = (1.5 * 267) / 832;
  car1 = loadImage('../figs/car1.png');
  car2 = loadImage('../figs/car2.png');
  aspect2 = (1.3 * 118) / 252;
}

let P = { x: 0.85, y: 0.125 };
let Q = { x: 0.1, y: 0.06 };
let flagCrash = false;
let t = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  let v1x = -1;
  let a1x = 0.0
  let lx1 = 300 / CANVAS_WIDTH
  let ly1 = lx1 * aspect1;

  let v2x = 10;
  let a2x = 0.0
  let lx2 = 100 / CANVAS_WIDTH
  let ly2 = lx2 * aspect2;


  truck = new Body(P.x, P.y, v1x, 0, a1x, 0, lx1, ly1, "A", 50, truck1);
  truck.ghost_step = 10;

  car = new Body(Q.x, Q.y, v2x, 0, a2x, 0, lx2, ly2, "B", 50, car1);
  car.ghost_step = 10;

  // Create option buttons using helper function
  itemAButton = createOptionButton("Opção A", -60, option_A);
  itemBButton = createOptionButton("Opção B", -30, option_B);
  itemCButton = createOptionButton("Opção C", 0, option_C);
  itemDButton = createOptionButton("Opção D", 30, option_D);
  itemEButton = createOptionButton("Opção E", 60, option_E);

  // Create restart button
  startButtonR = createButton("Reiniciar");
  startButtonR.position(CANVAS_WIDTH + 70, CANVAS_HEIGHT / 2 + 90);
  startButtonR.mousePressed(restart);
  startButtonR.style("text-align", "left");

  update = updateA;
}

function draw() {

  background(220);

  drawGround();
  // drawRuler(0, 1, 0.5, 0.5, 0.1);
  truck.show();
  car.show();

  update();



  fill(0);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(8);
  text("t = " + t / 10, 10, 10);


  if (isRunning) {
    t = t + 1;
  }
}


// Helper to convert normalized x to pixel x
function toPixelX(nx) {
  return nx * width;
}

// Helper to convert normalized y to pixel y (inverting y since p5's origin is at the top left)
function toPixelY(ny) {
  return height - ny * height;
}
function createOptionButton(label, yOffset, callback) {
  const btn = createButton(label);
  btn.position(CANVAS_WIDTH + 70, CANVAS_HEIGHT / 2 + yOffset);
  btn.mousePressed(callback);
  return btn;
}

function drawRuler(xi, xf, yi, yf, delta, show_label = false) {
  // xi, xf, yi, yf, and delta are in normalized units [0,1]
  // This function draws a vertical ruler if xi === xf
  // and a horizontal ruler if yi === yf.

  textAlign(RIGHT, CENTER);

  if (xi === xf) { // vertical ruler
    const xPixel = xi * width;              // Convert x coordinate
    const yPixelStart = height - yi * height; // Lower bound in pixels
    const yPixelEnd = height - yf * height;   // Upper bound in pixels

    strokeWeight(1);
    stroke(0);
    line(xPixel, yPixelStart, xPixel, yPixelEnd);

    // Loop from yi to yf in steps of delta (both are normalized)
    for (let i = yi; i <= yf; i += delta) {
      const y = height - i * height; // Convert normalized y to pixel y
      stroke(0);
      strokeWeight(1);

      line(xPixel - 3, y, xPixel + 3, y); // Tick marks

      if (show_label) {
        fill(0);
        noStroke();
        text(i.toFixed(1), xPixel - 5, y);   // Label the tick mark
      }
    }

  } else if (yi === yf) { // horizontal ruler
    const yPixel = height - yi * height;    // Convert y coordinate
    const xPixelStart = xi * width;           // Left bound in pixels
    const xPixelEnd = xf * width;             // Right bound in pixels

    strokeWeight(2);
    stroke(0);
    line(xPixelStart, yPixel, xPixelEnd, yPixel);

    // Loop from xi to xf in steps of delta (normalized)
    for (let i = xi; i <= xf; i += delta) {
      const x = i * width;                // Convert normalized x to pixel x
      stroke(0);
      strokeWeight(2);
      line(x, yPixel - 5, x, yPixel + 5);   // Tick marks
      if (show_label) {
        fill(0);
        noStroke();
        text(i.toFixed(1), x, yPixel - 10);    // Label the tick mark
      }
    }

    // Loop from xi to xf in steps of delta (normalized)
    for (let i = xi; i <= xf; i += delta / 5) {
      const x = i * width;                // Convert normalized x to pixel x
      stroke(0);
      strokeWeight(1);
      line(x, yPixel - 2, x, yPixel + 2);   // Tick marks
      if (show_label) {
        fill(0);
        noStroke();
        text(i.toFixed(1), x, yPixel - 10);    // Label the tick mark
      }
    }
  }
}

function drawGround() {
  fill(80);
  rect(0, GROUND, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND);
}

function updateA() {
  truck.update(isRunning)
  car.update(isRunning)

  let x1 = truck.x - truck.lx / 2;
  let x2 = car.x + car.ly / 2;


  if (x2 >= x1) {

    if (!flagCrash) {
      flagCrash = true;
      car.img = car2;
      truck.img = truck2;
    }
    car.ax = -1.0 * CANVAS_WIDTH - 2 * CANVAS_WIDTH * car.vx;
    truck.ax = 0.03 * CANVAS_WIDTH - 0.5 * CANVAS_WIDTH * truck.vx;

    car.showVector(-0.15, 0.0);
    truck.showVector(0.03, 0.0);
  }

  redraw();
}

function updateB() {
  truck.update(isRunning)
  car.update(isRunning)

  let x1 = truck.x - truck.lx / 2;
  let x2 = car.x + car.ly / 2;


  if (x2 >= x1) {

    if (!flagCrash) {
      flagCrash = true;
      car.img = car2;
      truck.img = truck2;
    }
    car.ax = -0.03 * CANVAS_WIDTH - 0.5 * CANVAS_WIDTH * car.vx;
    truck.ax = 1.03 * CANVAS_WIDTH - 2 * CANVAS_WIDTH * truck.vx;

    car.showVector(-0.03, 0.0);
    truck.showVector(0.15, 0.0);
  }

  redraw();
}


function updateC() {
  truck.update(isRunning)
  car.update(isRunning)

  let x1 = truck.x - truck.lx / 2;
  let x2 = car.x + car.lx / 2;


  if (x2 >= x1) {

    if (!flagCrash) {
      flagCrash = true;
      car.img = car2;
      truck.img = truck2;
    }
    car.x = x1 - 0.35 * car.lx;

  }

  redraw();
}


function updateD() {
  truck.update(isRunning)
  car.update(isRunning)

  let x1 = truck.x - truck.lx / 2;
  let x2 = car.x + car.lx / 2;


  if (x2 >= x1) {

    if (!flagCrash) {
      flagCrash = true;
      car.img = car2;
      truck.img = truck2;
    }
    car.x = x1 - 0.35 * car.lx;
    car.showVector(-0.1, 0.0);

  }

  redraw();
}

function updateE() {
  truck.update(isRunning)
  car.update(isRunning)

  let x1 = truck.x - truck.lx / 2;
  let x2 = car.x + car.lx / 2;


  if (x2 >= x1) {

    if (!flagCrash) {
      flagCrash = true;
      car.img = car2;
      truck.img = truck2;
    }
    car.ax = -1.0 * CANVAS_WIDTH - 2.5 * CANVAS_WIDTH * car.vx;
    truck.ax = 0.03 * CANVAS_WIDTH - 2.5 * CANVAS_WIDTH * truck.vx;

    car.showVector(-0.15, 0.0);
    truck.showVector(0.15, 0.0);
  }

  redraw();
}
// Option functions
function option_A() {
  isRunning = !isRunning;
  update = updateA;
}

function option_B() {
  isRunning = !isRunning;
  update = updateB;
}

function option_C() {
  isRunning = !isRunning;
  update = updateC;
}

function option_D() {
  isRunning = !isRunning;
  update = updateD;
}

function option_E() {
  isRunning = !isRunning;
  update = updateE;
}

function restart() {
  // Code to restart the simulation
  isRunning = false;
  truck.reset();
  truck.img = truck1;
  truck.ly = truck.lx * aspect1;

  car.reset();
  car.img = car1;
  car.ly = car.lx * aspect2;


  t = 0;
  flagCrash = false;

}

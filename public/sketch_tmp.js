const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
const GROUND = CANVAS_HEIGHT - 10;

let itemAButton, itemBButton, itemCButton, itemDButton, itemEButton, startButtonR;

let isRunning = false;
let update;

let t = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

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

  update = restart;
}

function draw() {
  background(220);
  update();

  // time   
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
  redraw();
}

function updateB() {
  redraw();
}

function updateC() {
  redraw();
}

function updateD() {
  redraw();
}

function updateE() {
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
  body1.reset();
  body1.img = shuttle1;
  body1.ly = body1.lx * aspect1;

  t = 0;
  flagQ = false;
  flagR = false;
  countD = 0;

}

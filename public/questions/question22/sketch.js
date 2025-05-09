const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
const GROUND = CANVAS_HEIGHT - 10;
const CEILING = 10;
const XPOS = 0.5;

let itemAButton,
  itemBButton,
  itemCButton,
  itemDButton,
  itemEButton,
  startButtonR;

let body1, body2, bodies;

let isRunning = false;
let update;

let shuttle1, shuttle2, aspect1, aspect2;
function preload() {
  // Adjust the path to where your PNG is stored
  shuttle1 = loadImage("../figs/shuttle.png");
  aspect1 = (1.5 * 321) / 234;
  shuttle2 = loadImage("../figs/shuttle2.png");
  aspect2 = (1.5 * 357) / 234;
}

let Q = { x: 0.5, y: 0.5 };
let R;
let P = { x: 0.3, y: 0.5 };
let flagQ = false,
  flagR = false;
let countD = 0;
let t = 0;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  let v1x = 2;
  let a1x = 0.0;
  let lx = 80 / CANVAS_WIDTH;
  let ly = lx * aspect1;
  body1 = new Body(P.x, P.y, v1x, 0, a1x, 0, lx, ly, "A", 50, shuttle1);
  body1.ghost_step = 10;
  bodies = [body1];
  // Create option buttons using helper function
  itemAButton = createOptionButton("Opção A", -60, option_A);
  itemBButton = createOptionButton("Opção B", -30, option_B);
  itemCButton = createOptionButton("Opção C", 0, option_C);
  itemDButton = createOptionButton("Opção D", 30, option_D);
  itemEButton = createOptionButton("Opção E", 60, option_E);

  // Create restart button
  startButtonR = createButton("Reiniciar");
  startButtonR.parent("sim-controls");
  startButtonR.mousePressed(restart);
  startButtonR.style("text-align", "left");

  update = updateA;
}

function draw() {
  background(220);

  // drawGround();
  // drawRuler(0, 1, 0.5, 0.5, 0.1);
  body1.show();

  update();

  fill(0);
  textSize(12);
  noStroke();
  ellipse(toPixelX(Q.x), toPixelY(Q.y), 5, 5);
  textAlign(CENTER, CENTER);
  text("Q", toPixelX(Q.x), toPixelY(Q.y) + 12);

  if (flagR) {
    fill(255);
    rect(toPixelX(R.x) - 7.5, toPixelY(R.y) - 5, 15, 25);

    fill(0);
    textSize(12);
    ellipse(toPixelX(R.x), toPixelY(R.y), 5, 5);

    noStroke();
    textAlign(CENTER, CENTER);
    text("R", toPixelX(R.x), toPixelY(R.y) + 12);
  }

  if (flagQ) body1.showVector(0, 0.1);

  fill(0);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(8);
  text("t = " + t / 10, 10, 10);

  textSize(12);
  ellipse(toPixelX(P.x), toPixelY(P.y), 5, 5);
  textAlign(CENTER, CENTER);
  text("P", toPixelX(P.x), toPixelY(P.y) + 12);

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
  btn.parent("sim-controls");
  btn.mousePressed(callback);
  return btn;
}

function drawRuler(xi, xf, yi, yf, delta, show_label = false) {
  // xi, xf, yi, yf, and delta are in normalized units [0,1]
  // This function draws a vertical ruler if xi === xf
  // and a horizontal ruler if yi === yf.

  textAlign(RIGHT, CENTER);

  if (xi === xf) {
    // vertical ruler
    const xPixel = xi * width; // Convert x coordinate
    const yPixelStart = height - yi * height; // Lower bound in pixels
    const yPixelEnd = height - yf * height; // Upper bound in pixels

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
        text(i.toFixed(1), xPixel - 5, y); // Label the tick mark
      }
    }
  } else if (yi === yf) {
    // horizontal ruler
    const yPixel = height - yi * height; // Convert y coordinate
    const xPixelStart = xi * width; // Left bound in pixels
    const xPixelEnd = xf * width; // Right bound in pixels

    strokeWeight(2);
    stroke(0);
    line(xPixelStart, yPixel, xPixelEnd, yPixel);

    // Loop from xi to xf in steps of delta (normalized)
    for (let i = xi; i <= xf; i += delta) {
      const x = i * width; // Convert normalized x to pixel x
      stroke(0);
      strokeWeight(2);
      line(x, yPixel - 5, x, yPixel + 5); // Tick marks
      if (show_label) {
        fill(0);
        noStroke();
        text(i.toFixed(1), x, yPixel - 10); // Label the tick mark
      }
    }

    // Loop from xi to xf in steps of delta (normalized)
    for (let i = xi; i <= xf; i += delta / 5) {
      const x = i * width; // Convert normalized x to pixel x
      stroke(0);
      strokeWeight(1);
      line(x, yPixel - 2, x, yPixel + 2); // Tick marks
      if (show_label) {
        fill(0);
        noStroke();
        text(i.toFixed(1), x, yPixel - 10); // Label the tick mark
      }
    }
  }
}

function drawGround() {
  fill(80);
  rect(0, GROUND, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND);
}

function updateA() {
  body1.update(isRunning);
  if (body1.x >= Q.x) {
    if (!flagQ) {
      body1.vx = 0;
      flagQ = true;
    }
    body1.vy = 2;
    body1.ax = 10;
    body1.ay = 0;
    body1.img = shuttle2;
    body1.ly = body1.lx * aspect2;
  }
  if (!flagR && body1.y >= 0.8) {
    isRunning = false;
    flagR = true;
    R = { x: body1.x, y: body1.y };
  }
  redraw();
}

function updateB() {
  body1.update(isRunning);
  if (body1.x >= Q.x) {
    if (!flagQ) {
      body1.vx = 0;
      flagQ = true;
    }
    body1.vy = 2;
    body1.ax = 0;
    body1.ay = 0;
    body1.img = shuttle2;
    body1.ly = body1.lx * aspect2;
  }
  if (!flagR && body1.y >= 0.8) {
    isRunning = false;
    flagR = true;
    R = { x: body1.x, y: body1.y };
  }
  redraw();
}

function updateC() {
  body1.update(isRunning);
  if (body1.x >= Q.x) {
    if (!flagQ) {
      // body1.vx = 0;
      flagQ = true;
    }
    body1.vy = 2;
    body1.ax = 0;
    body1.ay = 0;
    body1.img = shuttle2;
    body1.ly = body1.lx * aspect2;
  }
  if (!flagR && body1.y >= 0.8) {
    isRunning = false;
    flagR = true;
    R = { x: body1.x, y: body1.y };
  }
  redraw();
}

function updateD() {
  body1.update(isRunning);
  if (body1.x >= Q.x) {
    if (!flagQ) {
      flagQ = true;
    }
    if (countD < 40) body1.vy = 0;
    body1.ax = 0;
    body1.ay = 100;
    body1.img = shuttle2;
    body1.ly = body1.lx * aspect2;
    countD = countD + 1;
  }
  if (!flagR && body1.y >= 0.8) {
    isRunning = false;
    flagR = true;
    R = { x: body1.x, y: body1.y };
  }
  redraw();
}

function updateE() {
  body1.update(isRunning);
  if (body1.x >= Q.x) {
    if (!flagQ) {
      flagQ = true;
    }

    body1.ay = 100;
    body1.img = shuttle2;
    body1.ly = body1.lx * aspect2;
  }
  if (!flagR && body1.y >= 0.8) {
    isRunning = false;
    flagR = true;
    R = { x: body1.x, y: body1.y };
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
  body1.reset();
  body1.img = shuttle1;
  body1.ly = body1.lx * aspect1;

  t = 0;
  flagQ = false;
  flagR = false;
  countD = 0;
}

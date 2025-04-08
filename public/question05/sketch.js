const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
const GROUND = CANVAS_HEIGHT - 10;

let itemAButton,
  itemBButton,
  itemCButton,
  itemDButton,
  itemEButton,
  startButtonR;

let isRunning = false;
let topView = false;
let update;

let t = 0;
let phi0, phi1, phiQ, phi;
let channelWidth, radius;
let O, P, Q, R;
let lastCameraState, camTilted, camTopDown;
let cam;
let myFont;
function preload() {
  myFont = loadFont("assets/FiraCodeNerdFontMono-Regular.ttf");
}

let myTrack;
function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);
  phi0 = (5 * PI) / 4;
  phi1 = 0;
  phiQ = (phi0 + phi1) / 2;

  radius = toPixelX(0.2);
  channelWidth = toPixelX(0.05);
  // Set the camera position

  fill("#ED225D");
  textFont(myFont);
  textSize(36);

  camTilted = {
    eye: createVector(0., 600, 400),
    center: createVector(0, 0, 0),
    up: createVector(0, 1, 0),
    fov: PI / 3,
    near: 0.1,
    far: 1000,
    aspect: CANVAS_WIDTH / CANVAS_HEIGHT,
  };

  camTopDown = {
    eye: createVector(0, 0, 700),
    center: createVector(0, 0, 0),
    up: createVector(0, 1, 0),
    fov: PI / 3,
    near: 0.1,
    far: 1000,
    aspect: CANVAS_WIDTH / CANVAS_HEIGHT,
  };

  cam = createCamera(); // Get the current camera object

  if (topView) {
    lastCameraState = camTopDown;
  } else {
    lastCameraState = camTilted;
  }

  camera(
    lastCameraState.eye.x,
    lastCameraState.eye.y,
    lastCameraState.eye.z,
    lastCameraState.center.x,
    lastCameraState.center.y,
    lastCameraState.center.z,
    lastCameraState.up.x,
    lastCameraState.up.y,
    lastCameraState.up.z
  );

  O = createVector(0, 0, 0);
  myTrack = new circularChannel(O, radius, channelWidth, phi0, phi1);

  console.log(O);
  console.log(radius);
  console.log(channelWidth);

  // Create option buttons using helper function
  // Criando o botão ITEM A
  itemAButton = createButton("Opção A");
  itemAButton.parent("sim-controls");
  itemAButton.mousePressed(option_A);

  // Criando o botão ITEM B
  itemBButton = createButton("Opção B");
  itemBButton.parent("sim-controls");
  itemBButton.mousePressed(option_B);

  // Criando o botão ITEM C
  itemCButton = createButton("Opção C");
  itemCButton.parent("sim-controls");
  itemCButton.mousePressed(option_C);

  // Criando o botão ITEM D
  itemDButton = createButton("Opção D");
  itemDButton.parent("sim-controls");
  itemDButton.mousePressed(option_D);

  // Criando o botão ITEM D
  itemEButton = createButton("Opção E");
  itemEButton.parent("sim-controls");
  itemEButton.mousePressed(option_E);

  // startButtonR = createButton("Reiniciar");
  // startButtonR.parent("sim-controls");
  // startButtonR.mousePressed(restart);
  // startButtonR.style("text-align", "left");

  startButtonT = createButton("vista superior");
  startButtonT.parent("sim-controls");
  startButtonT.mousePressed(applyTopView);
  startButtonT.style("text-align", "left");

  update = updateA;
  phi = phi0 + 0.2;
}

function applyTopView() {
  if (topView) {
    lastCameraState = camTilted;
    topView = false;
    startButtonT.html("vista superior ");
  } else {
    lastCameraState = camTopDown;
    topView = true;
    startButtonT.html("vista inclinada");
  }

  camera(
    lastCameraState.eye.x,
    lastCameraState.eye.y,
    lastCameraState.eye.z,
    lastCameraState.center.x,
    lastCameraState.center.y,
    lastCameraState.center.z,
    lastCameraState.up.x,
    lastCameraState.up.y,
    lastCameraState.up.z
  );
}

function draw() {
  background(250);
  orbitControl(); // Allows interaction from this camera position
  saveCameraState(cam);

  myTrack.drawTabletop(); // ✅ tabletop from class
  myTrack.drawCircularTrack();
  myTrack.drawDisk(phi); // ✅ moving disk
  myTrack.drawLabeledPoints(); // 👈 This

  update(t); // Update the scene based on the selected option
  if (t <=1) {
    t = t + 0.01;
  }
  // push();
  // translate(-100, -100, 0);
  // noLights();
  // text(''+t, 0, 0); // label offset
  // pop();

  
}

// the camera looks from (width/2, height/2, (height/2) / tan(PI/6))
// the center of the canvas is in the (0,0,0) in 3D space

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

function drawInwardVector(x, y) {
  fill(255);
  stroke(0);

  strokeWeight(1);

  ellipse(x, y, 12, 12); // Circle
  stroke(0);
  strokeWeight(1.5);
  line(x - 4, y - 4, x + 4, y + 4);
  line(x - 4, y + 4, x + 4, y - 4);
}

function drawGround() {
  fill(80);
  rect(0, GROUND, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND);
}

function updateA(t) {

  if (isRunning) {
    phi = lerp(phi0 + 0.2, phi1 - 0.2, constrain(t, 0, 1));

    if (phi < phiQ) {
      let pos_Q = myTrack.positionAtPhi(phiQ);
      let g = createVector(0, 0.01, -1); // gravity vector pointing down
      g.mult(50); // Scale it to a length of 50
      drawArrow3D(pos_Q, g, "blue");
    }
  }

  redraw();

}

function updateB() {
  if (isRunning) {
    phi = lerp(phi0 + 0.2, phi1 - 0.2, constrain(t, 0, 1));

    if (phi < phiQ) {
      let g = createVector(0, 0.01, -1); // gravity vector pointing down
      let pos_Q = myTrack.positionAtPhi(phiQ);

      let vQO = p5.Vector.sub(O, pos_Q); // vector from Q to O
      vQO.normalize(); // Normalize the vector
      vQO.mult(50); // Scale it to a length of 50
      g.mult(50); // Scale it to a length of 50

      drawArrow3D(pos_Q, g, "blue");
      drawArrow3D(pos_Q, vQO, "red");
    }
    redraw();
  }
}

function updateC() {
  if (isRunning) {
    phi = lerp(phi0 + 0.2, phi1 - 0.2, constrain(t, 0, 1));

    if (phi < phiQ) {
      let g = createVector(0, 0.01, -1); // gravity vector pointing down
      let pos_Q = myTrack.positionAtPhi(phiQ);

      let vQO = p5.Vector.sub(O, pos_Q); // vector from Q to O
      vQO.normalize(); // Normalize the vector
      vQO.mult(50); // Scale it to a length of 50

      let v = vQO.cross(g); // c is (0, 0, 1)

      g.mult(50); // Scale it to a length of 50

      drawArrow3D(pos_Q, g, "blue");
      drawArrow3D(pos_Q, v, "green");
    }
    redraw();
  }
}

function updateD() {
  if (isRunning) {
    phi = lerp(phi0 + 0.2, phi1 - 0.2, constrain(t, 0, 1));

    if (phi < phiQ) {
      let g = createVector(0, 0.01, -1); // gravity vector pointing down
      let pos_Q = myTrack.positionAtPhi(phiQ);

      let vQO = p5.Vector.sub(O, pos_Q); // vector from Q to O
      vQO.normalize(); // Normalize the vector
      vQO.mult(50); // Scale it to a length of 50

      let v = vQO.cross(g); // c is (0, 0, 1)

      g.mult(50); // Scale it to a length of 50

      drawArrow3D(pos_Q, g, "blue");
      drawArrow3D(pos_Q, vQO, "red");
      drawArrow3D(pos_Q, v, "green");
    }
    redraw();
  }
}

function updateE() {
  if (isRunning) {
    phi = lerp(phi0 + 0.2, phi1 - 0.2, constrain(t, 0, 1));

    if (phi < phiQ) {
      let g = createVector(0, 0.01, -1); // gravity vector pointing down
      let pos_Q = myTrack.positionAtPhi(phiQ);

      let vQO = p5.Vector.sub(O, pos_Q); // vector from Q to O
      vQO.normalize(); // Normalize the vector
      vQO.mult(50); // Scale it to a length of 50

      let v = vQO.cross(g); // c is (0, 0, 1)

      g.mult(50); // Scale it to a length of 50
      vQO.mult(-1); // Scale it to a length of 50

      drawArrow3D(pos_Q, g, "blue");
      drawArrow3D(pos_Q, vQO, "orange");
      drawArrow3D(pos_Q, v, "green");
    }
    redraw();
  }}
// Option functions
function option_A() {
 if (t>1) {restart();}

  isRunning = !isRunning;

  update = updateA;
}

function option_B() {
  if (t>1) {restart();}

  isRunning = !isRunning;
  update = updateB;
}

function option_C() {
  if (t>1) {restart();}

  isRunning = !isRunning;
  update = updateC;
}

function option_D() {
  if (t>1) {restart();}

  isRunning = !isRunning;
  update = updateD;
}

function option_E() {
  if (t>1) {restart();}

  isRunning = !isRunning;
  update = updateE;
}

function restart() {
  isRunning = false;
  t = 0;
  phi = phi0 + 0.2;
  camera(
    lastCameraState.eye.x,
    lastCameraState.eye.y,
    lastCameraState.eye.z,
    lastCameraState.center.x,
    lastCameraState.center.y,
    lastCameraState.center.z,
    lastCameraState.up.x,
    lastCameraState.up.y,
    lastCameraState.up.z
  );
  console.log(
    lastCameraState.eye.x,
    lastCameraState.eye.y,
    lastCameraState.eye.z
  );
  console.log(
    lastCameraState.center.x,
    lastCameraState.center.y,
    lastCameraState.center.z
  );
  console.log(lastCameraState.up.x, lastCameraState.up.y, lastCameraState.up.z);
}

function saveCameraState(cam) {
  lastCameraState.eye.set(cam.eyeX, cam.eyeY, cam.eyeZ);
  lastCameraState.center.set(cam.centerX, cam.centerY, cam.centerZ);
  lastCameraState.up.set(cam.upX, cam.upY, cam.upZ);
}

function drawArrow3D(base, vec, color = "black", scale = 1) {
  push();
  stroke(color);
  fill(color);
  strokeWeight(2);

  // Go to base position
  translate(base.x, base.y, base.z);

  let dir = vec.copy().normalize();
  let len = vec.mag() * scale;

  // Align Z-axis to vector direction
  let zAxis = createVector(0, 0, 1);
  let rotationAxis = zAxis.cross(dir);
  let rotationAngle = acos(zAxis.dot(dir));

  if (rotationAxis.mag() > 0.0001) {
    rotate(rotationAngle, rotationAxis);
  }

  // Shaft
  line(0, 0, 0, 0, 0, len - 10);

  // Arrowhead
  translate(0, 0, len - 10);
  rotateX(HALF_PI); // 🔁 Fix Y-axis cone orientation to align with Z
  cone(4, 10); // Cone originally points along +Y
  pop();
}

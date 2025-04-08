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
let topView = true;
let update;

let t = 0;
let phi0, phi1, phiQ, phi;
let x0, y0, z0;
let x, y, z;
let omega;
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

  omega = phi0;
  radius = 0.2 * CANVAS_WIDTH;
  channelWidth = 0.05 * CANVAS_WIDTH;
  // Set the camera position

  fill("#ED225D");
  textFont(myFont);
  textSize(36);

  camTilted = {
    eye: createVector(0, 600, 400),
    center: createVector(0, 0, 0),
    up: createVector(0, 1, 0),
    fov: PI / 7,
    near: 0.1,
    far: 1000,
    aspect: CANVAS_WIDTH / CANVAS_HEIGHT,
  };

  camTopDown = {
    eye: createVector(0, 0, 700),
    center: createVector(0, 0, 0),
    up: createVector(0, 1, 0),
    fov: PI / 7,
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
  setCameraState(lastCameraState);

  O = createVector(0, 0, 0);
  myTrack = new circularChannel(O, radius, channelWidth, phi0, phi1);

  // Create option buttons using helper function
  // Criando o botão ITEM A

  itemAButton = createNewButton("Opção A", option_A);
  itemBButton = createNewButton("Opção B", option_B);
  itemCButton = createNewButton("Opção C", option_C);
  itemDButton = createNewButton("Opção D", option_D);
  itemEButton = createNewButton("Opção E", option_E);
  startButtonT = createNewButton("vista superior", applyTopView);

  update = updateA;
  phi = phi0 + 0.2;
  x0 = radius * Math.cos(phi);
  y0 = radius * Math.sin(phi);
  z0 = 0.0;
  x = x0;
  y = y0;
  z = z0;
}

function draw() {
  background(250);
  orbitControl(); // Allows interaction from this camera position
  saveCameraState(cam);

  myTrack.drawTabletop(); // ✅ tabletop from class
  myTrack.drawCircularTrack();
  myTrack.drawDiskAt(x, y, z); // ✅ moving disk
  // myTrack.drawDisk(phi); // ✅ moving disk

  myTrack.drawLabeledPoints(); // 👈 This

  update(t); // Update the scene based on the selected option
  if (t <= 1.5) {
    t = t + 0.01;
  }
  // push();
  // translate(-100, -150, 0);
  // noLights();
  // text(''+phi, 0, 0); // label offset
  // pop();
}

function setCameraState(camSt) {
  camera(
    camSt.eye.x,
    camSt.eye.y,
    camSt.eye.z,
    camSt.center.x,
    camSt.center.y,
    camSt.center.z,
    camSt.up.x,
    camSt.up.y,
    camSt.up.z
  );
  perspective(camSt.fov, camSt.aspect, camSt.near, camSt.far);
}

function createNewButton(
  label,
  event,
  parent = "sim-controls",
  align = "left"
) {
  butt = createButton(label);
  butt.parent(parent);
  butt.mousePressed(event);
  butt.style("text-align", align);
  return butt;
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

  setCameraState(lastCameraState);
}

function updateA() {
  if (isRunning) {
    phi = phi0 + 0.2 - omega * t;
    x = radius * Math.cos(phi);
    y = radius * Math.sin(phi);
    z = 0.0;

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
    phi = phi0 + 0.2 - omega * t;

    if (t < 1) {
      x = radius * Math.cos(phi);
      y = radius * Math.sin(phi);
    } 
    else {
      y = y - omega*radius*0.007; 
    }


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
    phi = phi0 + 0.2 - omega * t;
    if (t < 1) {
      x = radius * Math.cos(phi);
      y = radius * Math.sin(phi);
    } 
    else {
      x = x + 1*(omega*radius*0.007)*(t-1)*(t-1);
      y = y - omega*radius*0.007;    
    }

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
    phi = phi0 + 0.2 - omega * t;
    if (t < 1) {
      x = radius * Math.cos(phi);
      y = radius * Math.sin(phi);
    } 
    else {
      x = x + 5*(omega*radius*0.007)*(t-1)*(t-1);
      y = y - omega*radius*0.007;    
    }

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
    phi = phi0 + 0.2 - omega * t;
    if (t < 1) {
      x = radius * Math.cos(phi);
      y = radius * Math.sin(phi);
    } 
    else {
      x = x + 2*(omega*radius*0.007)*(t-1);
      y = y - omega*radius*0.004;    
    }

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
  }
}
// Option functions
function option_A() {
  if (t > 1) {
    restart();
  }

  isRunning = !isRunning;

  update = updateA;
}

function option_B() {
  if (t > 1) {
    restart();
  }

  isRunning = !isRunning;
  update = updateB;
}

function option_C() {
  if (t > 1) {
    restart();
  }

  isRunning = !isRunning;
  update = updateC;
}

function option_D() {
  if (t > 1) {
    restart();
  }

  isRunning = !isRunning;
  update = updateD;
}

function option_E() {
  if (t > 1) {
    restart();
  }

  isRunning = !isRunning;
  update = updateE;
}

function restart() {
  isRunning = false;
  t = 0;
  phi = phi0 + 0.2;
  setCameraState(lastCameraState);

  console.log(
    lastCameraState.eye.x,
    lastCameraState.eye.y,
    lastCameraState.eye.z
  );
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

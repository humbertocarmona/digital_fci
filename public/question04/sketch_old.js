let width = 700;
let height = 400;
let ground = 0.98 * height;
let ceiling = 0.05 * height;
let xpos = 0.5;

let car1;
let running = false;
let t = 0;
let t_collision = 999;

let update;

function setup() {
  createCanvas(width, height);

  car1 = new cars(0, ground, 15, 0, 0, 0, 20, 80, 20, "", 150);
  car2 = new cars(550, ground, -5, 0, 0, 0, 22, 200, 30, "", 75);

  // Criando o botão ITEM A
  itemAButton = createButton("Opção A");
  itemAButton.position(width + 70, height / 2 - 60);
  itemAButton.mousePressed(option_A);

  // Criando o botão ITEM B
  itemBButton = createButton("Opção B");
  itemBButton.position(width + 70, height / 2 - 30);
  itemBButton.mousePressed(option_B);

  // Criando o botão ITEM C
  itemCButton = createButton("Opção C");
  itemCButton.position(width + 70, height / 2);
  itemCButton.mousePressed(option_C);

  // Criando o botão ITEM D
  itemDButton = createButton("Opção D");
  itemDButton.position(width + 70, height / 2 + 30);
  itemDButton.mousePressed(option_D);

  // Criando o botão ITEM E
  itemEButton = createButton("Opção E");
  itemEButton.position(width + 70, height / 2 + 60);
  itemEButton.mousePressed(option_E);

  startButtonR = createButton("Reiniciar");
  startButtonR.position(width + 70, height / 2 + 90);
  startButtonR.mousePressed(restart);
  startButtonR.style("text-align", "left");
}

function draw() {
  background(220);
  drawGround();

  car1.show();
  car2.show();

  if (running || t > 0) update();

  fill(0);
  strokeWeight(0);
  textAlign(LEFT, CENTER);
  textSize(12);
  text("tempo=" + t, 10, 10);
}


function drawVerticalRuler(xi, xf, yi, yf, delta) {
  textAlign(RIGHT, CENTER);
  if (xi == xf) {// vertical ruler
    let xxi = map(xi, 0, 1, 0, width);
    let yyi = map(yi, 0, 1, ground, ceiling);
    let yyf = map(yf, 0, 1, ground, ceiling);

    strokeWeight(1);
    stroke(0);

    line(xxi, yyi, xxi, yyf);

    for (let i = 0; i <= 1; i += delta) {
      let y = map(i, 0, 1, ground, 0);
      if (y > yyf) {
        stroke(0);
        strokeWeight(1);
        line(xxi - 1, y, xxi + 1, y); // tick marks

        h = i
        fill(0);
        strokeWeight(0);
        text(h.toFixed(1), xxi - 5, y); // labels

      }
    }
  } else if (yi == yf) {// horizontal ruler
    let yyi = map(yi, 0, 1, ground, 0);
    let xxi = map(xi, 0, 1, 0, width);
    let xxf = map(xf, 0, 1, 0, width);

    strokeWeight(1);
    stroke(0);

    line(xxi, yyi, xxf, yyi);

    for (let i = 0; i <= 1; i += delta) {
      let x = map(i, 0, 1, 0, width);
      if (x < xxf) {
        stroke(0);
        strokeWeight(1);
        line(x, yyi - 1, x, yyi + 1); // tick marks

        h = i
        fill(0);
        strokeWeight(0);
        text(h.toFixed(1), x, yyi - 10); // labels

      }
    }
  }

  // line(x,y x,y)  // relative to top left corner
  // map(val, start1, stop1, start2, stop2)

}

function drawGround() {
  fill(80);
  rect(0, ground, width, height - ground);
}

function update_A() {
  car1.update();
  car2.update();

  let x1 = car1.x + car1.length / 2;
  let x2 = car2.x - car2.length / 2;
  if (x1 >= x2) {
    if (t_collision == 999)
      t_collision = t;

    car1.ax = -.5 - 1 * car1.vx;
    car2.ax = 0.02 - 1.1 * car2.vx;

    car1.showVector(-150, 0);
    car2.showVector(30, 0);

  }
  if (t - t_collision > 150) {
    running = false;
  } else {
    car1.showVector(-150, 0);
    car2.showVector(30, 0);
    t += 1;
  }
}

function update_B() {
  car1.update();
  car2.update();

  let x1 = car1.x + car1.length / 2;
  let x2 = car2.x - car2.length / 2;
  if (x1 >= x2) {
    if (t_collision == 999)
      t_collision = t;

    car1.ax = -.02 - 1.1 * car1.vx;
    car2.ax = 0.2 - 1 * car2.vx;

    car1.showVector(-30, 0);
    car2.showVector(150, 0);

  }
  if (t - t_collision > 150) {
    running = false;
  } else {
    car1.showVector(-30, 0);
    car2.showVector(150, 0);
    t += 1;
  }
}

function update_C() {
  car1.update();
  car2.update();

  let x1 = car1.x + car1.length / 2;
  let x2 = car2.x - car2.length / 2;
  if (x1 >= x2) {
    if (t_collision == 999)
      t_collision = t;

    car1.ax = -.5 - 1.1 * car1.vx;
    car2.x = car1.x + car1.length / 2 + car2.length / 2 - 30;


  }
  if (t - t_collision > 350) {
    running = false;
  } else {
    t += 1;
  }
}

function update_D() {
  car1.update();
  car2.update();

  let x1 = car1.x + car1.length / 2;
  let x2 = car2.x - car2.length / 2;
  if (x1 >= x2) {
    if (t_collision == 999)
      t_collision = t;

    // car1.ax = -.2 - 1.1 * car1.vx;
    car1.x = car2.x - car2.length / 2 - car1.length / 2 + 30;
    car2.ax = - 0.01 * car2.vx;

    car1.showVector(-150, 0);


  }
  if (t - t_collision > 150) {
    running = false;
  } else {
    car1.showVector(-150, 0);
    t += 1;
  }
}

function update_E() {
  car1.update();
  car2.update();


  let x1 = car1.x + car1.length / 2;
  let x2 = car2.x - car2.length / 2;
  if (x1 >= x2) {
    if (t_collision == 999)
      t_collision = t;

    car1.ax = -0.02 - 0.3 * car1.vx;
    car2.ax = 0.002 - 0.5 * car2.vx;

    car1.showVector(-150, 0);
    car2.showVector(150, 0);

  }
  if (t - t_collision > 150) {
    running = false;
  } else {
    t += 1;
  }
}


function option_A() {
  restart()
  update = update_A;
  running = true;
  redraw();
}

function option_B() {
  restart()
  update = update_B;
  running = true;
  redraw();
}

function option_C() {
  restart()
  update = update_C;
  running = true;
  redraw();
}

function option_D() {
  restart()
  update = update_D;
  running = true;
  redraw();
}

function option_E() {
  restart()
  update = update_E;
  running = true;
  redraw();
}

function restart() {
  t = 0;
  car1.x = car1.x0;
  car1.y = car1.y0;
  car1.vx = car1.vx0;
  car1.vy = car1.vy0;


  car2.x = car2.x0;
  car2.y = car2.y0;
  car2.vx = car2.vx0;
  car2.vy = car2.vy0;

  update = update_A;
  running = !running;
}

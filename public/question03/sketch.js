let width = 700;
let height = 400;
let ground = 0.98 * height;
let ceiling = 0.05 * height;

let xpos = 0.5;
let g = 1;

let body1;

let update;

let running = false;

let t = 0;

function setup() {
  createCanvas(width, height);
  body1 = new ball(0.5, 1, 0, 0, 0, 0, 30, "");
  randomSeed(4);

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

  // Criando o botão ITEM D
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
  drawVerticalRuler(xpos - 0.1, xpos - 0.1, 0, 1, 0.1);
  if (running) update();

  body1.show();

  textSize(10);
  fill(0);
  text("Tempo: " + t, 50, height / 2 - 100);
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
  if (t < 20)
    body1.ay = g;
  else
    body1.ay = 0;

  body1.update();

  if (running) {
    t += 1;
  };
}

function update_B() {
  if (t < 2)
    body1.ay = g;
  else
    body1.ay += 0.1 * g;

  body1.update();

  if (running) {
    t += 1;
  };
}

function update_C() {

  body1.ay = g;
  body1.update();


  if (running) {
    t += 1;
  };

}

function update_E() {

  body1.ay = 0.1*g + body1.vy;
  body1.update();


  if (running) {
    t += 1;
  };

}

function update_D() {

  let num = random(-5, 5);
  body1.ay = g;
  body1.ay += num;
  body1.vx = Math.sin(2 * PI * t / 50);
  body1.update();

  if (running) {
    t += 1;
  };

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
  body1.x = body1.x0;
  body1.y = body1.y0;
  body1.vx = body1.vx0;
  body1.vy = body1.vy0;
  running = false;
}

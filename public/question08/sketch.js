let width = 700;
let height = 400;
let ground = height - 10;
let ceiling = 10;
let xpos = 0.5;
function setup() {
  createCanvas(width, height);

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

  // Criando o botão ITEM E
  itemEButton = createButton("Opção E");
  itemEButton.parent("sim-controls");
  itemEButton.mousePressed(option_E);

  startButtonR = createButton("Reiniciar");
  startButtonR.parent("sim-controls");
  startButtonR.mousePressed(restart);
  startButtonR.style("text-align", "left");
}

function draw() {
  background(220);
  drawGround();
  drawVerticalRuler(xpos, xpos, 0, 1, 0.1);
  // drawVerticalRuler(0, 0.5, 0.5, 0.5, 0.1);
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

function option_A() {
}

function option_B() {
}

function option_C() {
}

function option_D() {
}

function option_E() {
}

function restart() {
}

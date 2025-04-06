let ball1, ball2;
let gravity = 15; // Aceleração devido à gravidade

let currentBallIndex = 0; // Índice da bola atual (0 para ball1, 1 para ball2)
let balls; // Array de bolas
let itemAButton, itemBButton, itemCButton, itemDButton, itemEButton;
let startSimulation = false; // Controle para iniciar a simulação

let widthMeasureInterval = 0.5; // Intervalo de medição de altura em metros
let width = 700;
let height = 400;
let groundY = height - 10;
let tableTop = height - 300;

let x0 = 0;
let y0 = tableTop;
let tableWidth = 260;

let vx = 15;
function setup() {
  createCanvas(width, height);
  x0 = map(0.98, 0, 1, 0, tableWidth); // Calculando a posição da borda da mesa
  // Criando as bolas com diferentes massas
  ball1 = new Ball(x0, y0, vx, 0, 1, '1kg'); // Ball(x, y, diameter, label)
  ball2 = new Ball(x0, y0, vx, 0, 1.2, '2kg');

  balls = [ball1, ball2];

  // Criando o botão ITEM A
  itemAButton = createButton("Opção A");
  itemAButton.position(width + 70, height / 2 - 60);
  itemAButton.mousePressed(applyEqualGravity);

  // Criando o botão ITEM B
  itemBButton = createButton("Opção B");
  itemBButton.position(width + 70, height / 2 - 30);
  itemBButton.mousePressed(applyHalfDistanceB);

  // Criando o botão ITEM C
  itemCButton = createButton("Opção C");
  itemCButton.position(width + 70, height / 2);
  itemCButton.mousePressed(applyHalfDistanceA);

  // Criando o botão ITEM D
  itemDButton = createButton("Opção D");
  itemDButton.position(width + 70, height / 2 + 30);
  itemDButton.mousePressed(applyShorterDistanceB);

  // Criando o botão ITEM E
  itemEButton = createButton("Opção E");
  itemEButton.position(width + 70, height / 2 + 60);
  itemEButton.mousePressed(applyShorterDistanceA);

  startButtonR = createButton("Reiniciar");
  startButtonR.position(width + 70, height / 2 + 90);
  startButtonR.mousePressed(restartSimulation);
  startButtonR.style("text-align", "left");
}

function draw() {
  background(220);

  // Desenhando o solo
  fill(100); // Cor cinza escuro
  strokeWeight(1);
  stroke(0);
  rect(0, height - 10, width, 10); // Retângulo representando o solo

  drawTable();
  // Desenhando a mesa com comprimento menor
  strokeWeight(1);
  stroke(0);
  // Desenhando as réguas
  // drawRuler();
  drawVerticalRuler();
  balls[0].display();
  balls[1].display();

  if (startSimulation) {
    // Atualizando e desenhando a bola atual
    balls[0].update();
    balls[1].update();
  }

}

class Ball {
  constructor(x, y, vx, vy, massFactor, label) {
    this.diameter = 20 * massFactor;
    this.x = x - this.diameter / 2;
    this.y = y - this.diameter / 2;
    this.x0 = x;
    this.y0 = y;
    this.xf = 0;
    this.yf = 0;
    this.vx = vx;
    this.vy = vy;

    this.color = 150;
    if (massFactor > 1) {
      this.color = 100;
    }
    this.label = label;
  }

  update() {
    // Atualizando a posição horizontal da bola enquanto estiver na mesa
    let deltat = 0.1; // Intervalo de tempo

    if (this.x < tableWidth) {
      this.x += vx * deltat;
    } else {
      if (this.y + 1.2 * this.diameter / 2 <= groundY) {
        this.x += this.vx * deltat;
        this.y += this.vy * deltat;
        this.vy += gravity * deltat;
      } else {
        this.vx = 0;
        this.vy = 0;
        this.xf = this.x;
        this.yf = this.y;
      }
    }
  }

  display() {
    // Desenhando a bola
    strokeWeight(1);
    stroke(0);
    fill(this.color);
    ellipse(this.x, this.y, this.diameter);


    fill(0);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    textSize(8);
    text(this.label, this.x, this.y);
    if (this.xf > 0) {
      let point = createVector(this.xf, this.yf);
      fill(255, 0, 0); // Cor vermelha para o ponto de impacto
      strokeWeight(0);
      ellipse(this.xf, this.yf + this.diameter / 2, 2, 2); // Desenhando o ponto de impacto
    }
  }


  init(vx, vy) {
    // Reinicializando a bola
    this.x = this.x0 - this.diameter / 2;
    this.y = this.y0 - this.diameter / 2;
    this.vx = vx;
    this.vy = vy;
    this.t0 = 0;
    this.xf = 0;
  }
}



function drawTable() {
  stroke(0);
  strokeWeight(1);
  fill(0, 100, 0); // Cor verde escuro

  let xpos = map(0, 0, 1, 0, width);
  let ypos = tableTop;
  rect(xpos, ypos, tableWidth, 10); // Retângulo representando a mesa (comprimento menor)
}
function drawVerticalRuler() {
  fill(90);
  textSize(10);
  strokeWeight(1);
  stroke(0);

  textAlign(RIGHT, CENTER);
  let heightMeasureInterval = 0.1; // Intervalo de medição de altura em metros

  // line(x,y x,y)  // relative to top left corner
  // map(val, start1, stop1, start2, stop2)
  let xpos = tableWidth;
  let yi = map(0., 0, 1, groundY, 0);
  let yf = map(0.8, 0, 1, groundY, 0);

  line(xpos, yi, xpos, yf);

  for (let i = 0; i <= 1; i += heightMeasureInterval) {

    let y = map(i, 0, 1, groundY, 0);
    if (y > yf) {
      h = i
      fill(0);
      strokeWeight(0);
      text(h.toFixed(1) + " m", xpos + 30, y); // Rótulo da altura

      stroke(0);
      strokeWeight(1);
      line(xpos - 1, y, xpos + 1, y); // Linha da régua
    }
  }
}

function drawRuler() {
  stroke(0);
  fill(0);
  strokeWeight(0);

  // Desenhando a régua horizontal
  for (let i = 0; i < width; i += 10) {
    line(i, height - 10, i, height - 5);
    if (i % 50 === 0) {
      let h = i / 100 - 1.5;
      text(h.toFixed(1) + " m", i, height - 15);
    }
  }

  // Desenhando a régua vertical passando pelo ponto de lançamento da bola
  for (let j = height - 10; j >= 0; j -= 10) {
    line(x0, j, x0 - 5, j);
    if ((height - j) % 50 === 0) {
      let h = (height - j) / 200
      text(h.toFixed(1), x0 - 15, j);
    }
  }

}


function restartSimulation(vx1, vx2) {

  balls[0].init(vx1, 0);
  balls[1].init(vx2, 0);

  currentBallIndex = 0;
  impactPoints = [];
  startSimulation = false;
}

function applyEqualGravity() {
  // Aplicando a gravidade igual para ambas as bolas

  restartSimulation(vx, vx);
  startSimulation = true; // Iniciar a simulação
}

function applyHalfDistanceB() {
  // Aplicando a condição para que a bola B percorra metade da distância horizontal em relação à bola A

  restartSimulation(vx, 0.5 * vx);
  startSimulation = true; // Iniciar a simulação
}

function applyHalfDistanceA() {
  // Aplicando a condição para que a bola A percorra metade da distância horizontal em relação à bola B

  restartSimulation(0.5 * vx, vx);
  startSimulation = true; // Iniciar a simulação
}

function applyShorterDistanceB() {
  // Aplicando a condição para que a bola B percorra uma distância menor em relação à bola A

  restartSimulation(vx, 0.8 * vx);
  startSimulation = true; // Iniciar a simulação
}

function applyShorterDistanceA() {
  // Aplicando a condição para que a bola A percorra uma distância menor em relação à bola B

  restartSimulation(0.8 * vx, vx);
  startSimulation = true; // Iniciar a simulação
}

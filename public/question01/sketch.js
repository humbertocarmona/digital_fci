// Variáveis para as bolas
let ballA;
let ballB;
let t = 0; // Tempo
let dt = 0.8; // Incremento de tempo em px usints
let groundY;
let startButtonA, startButtonB, startButtonC;
let simulationStarted = false; // Variável para controlar a simulação
let meterToPx = 400
let heightMeasureInterval = 0.2; // Intervalo de medição de altura em metros


function setup() {
  createCanvas(600, 500);
  groundY = height - 100; // Definindo a posição y do solo

  // Inicializando as bolas
  ballA = new Ball(0.3, 1 + 0.1, "2kg", 0.08, 2, 100); // Posição x, y, gravidade e rótulo
  ballB = new Ball(0.6, 1 + 0.08, "1kg", 0.06, 1, 150); // Posição x diferente para visualização, gravidade e rótulo


  ballA.reset();
  ballB.reset();
  // Criar botão de ajuste A
  startButtonA = createButton("Opção A");
  startButtonA.position(width + 70, height / 2 - 60);
  startButtonA.mousePressed(startSimulationA);
  startButtonA.style("text-align", "left");

  // Criar botão de ajuste B
  startButtonB = createButton(
    "Opção B"
  );
  startButtonB.position(width + 70, height / 2 - 30);
  startButtonB.mousePressed(startSimulationB);
  startButtonB.style("text-align", "left");

  // Criar botão de ajuste C
  startButtonC = createButton(
    "Opção C"
  );
  startButtonC.position(width + 70, height / 2);
  startButtonC.mousePressed(startSimulationC);
  startButtonC.style("text-align", "left");

  // Criar botão de ajuste D
  startButtonD = createButton(
    "Opção D"
  );
  startButtonD.position(width + 70, height / 2 + 30);
  startButtonD.mousePressed(startSimulationD);
  startButtonD.style("text-align", "left");

  // Criar botão de ajuste E
  startButtonE = createButton(
    "Opção E"
  );
  startButtonE.position(width + 70, height / 2 + 60);
  startButtonE.mousePressed(startSimulationE);
  startButtonE.style("text-align", "left");

  startButtonR = createButton("Resetar");
  startButtonR.position(width + 70, height / 2 + 90);
  startButtonR.mousePressed(resetSimulation);
  startButtonR.style("text-align", "left");
}

function draw() {
  background(220);

  // Desenhar o solo
  stroke(100);
  fill(100);
  rect(0, groundY, width, height - groundY);

  // Desenhar a régua vertical
  drawHeightRuler();

  // Mostrar informações sobre as bolas
  displayBallInfo();

  if (simulationStarted) {
    // Atualizar a posição das bolas
    ballA.update(dt);
    ballB.update(dt);

    // Incrementar o tempo
    t += dt;
  }

  // Desenhar as bolas
  ballA.show();
  ballB.show();

  // Exibir cronômetros e verificar se as bolas atingiram o solo
  checkAndDisplayTimer(ballA);
  checkAndDisplayTimer(ballB);
}
function startSimulationA() {
  ballA.gravity = 2.44; // Ajustar a gravidade da bola A
  ballB.gravity = 9.8; // Ajustar a gravidade da bola B
  resetSimulation(); // Resetar a simulação após ajuste
  simulationStarted = true;
}

function startSimulationB() {
  ballA.gravity = 9.8; // Ajustar a gravidade da bola A
  ballB.gravity = 2.44; // Ajustar a gravidade da bola B
  resetSimulation(); // Resetar a simulação após ajuste
  simulationStarted = true;
}

function startSimulationC() {
  ballA.gravity = 9.9; // Ajustar a gravidade da bola A
  ballB.gravity = 9.7; // Ajustar a gravidade da bola B
  resetSimulation(); // Resetar a simulação após ajuste
  simulationStarted = true;
}
function startSimulationD() {
  ballA.gravity = 6.9; // Ajustar a gravidade da bola A
  ballB.gravity = 9.8; // Ajustar a gravidade da bola B
  resetSimulation(); // Resetar a simulação após ajuste
  simulationStarted = true;
}
function startSimulationE() {
  ballA.gravity = 9.8; // Ajustar a gravidade da bola A
  ballB.gravity = 6.9; // Ajustar a gravidade da bola B
  resetSimulation(); // Resetar a simulação após ajuste
  simulationStarted = true;
}

function resetSimulation() {
  t = 0;
  ballA.reset();
  ballB.reset();
  simulationStarted = false;

}

function checkAndDisplayTimer(ball) {
  displayTimer(ball);
  if (ball.y >= groundY - ball.radius) {
    ball.stopTimer();
  }
}

function displayTimer(ball) {
  fill(0);
  textSize(12);
  textAlign(CENTER, TOP);
  text(
    "t=" + ball.timer.toFixed(2) + "s",
    ball.x,
    2
  );
}


function drawHeightRuler() {
  fill(90);
  textSize(12);
  textAlign(RIGHT, CENTER);
  line(0, meterToPx, width, meterToPx);

  for (let i = 0; i <= 1; i += heightMeasureInterval) {
    let y = map(i, 0, height / meterToPx, groundY, 0);
    stroke(0);
    h = 5 * i
    text(h.toFixed(1) + " m", width - 25, y); // Rótulo da altura
    stroke(190)
    line(0, y, width - 5, y); // Linha da régua
  }
}

function displayBallInfo() {
  // fill(0);
  // textSize(14);
  // textAlign(LEFT, BOTTOM);
  // text("Bola A: Massa = 1x", 10, groundY + 30);
  // text("Bola B: Massa = 2x", 10, groundY + 50);
}



class Ball {
  constructor(x, y, label, radius, mass, color) {
    this.mass = mass
    this.gravity = 9.8;  // m/s2
    this.radius = radius * meterToPx;
    console.log(this.radius, radius, meterToPx)
    this.x0 = map(x, 0, width / meterToPx, 0, width);;
    this.y0 = map(y, 0, height / meterToPx, groundY, 0);;
    this.x = this.x0;
    this.y = this.y0;
    this.velocity = 0;
    this.timer = 0;
    this.timerStopped = false;
    this.label = label;
    this.color = color;
  }

  update(dt) {
    if (!this.timerStopped) {
      // Atualizar o cronômetro
      this.timer += 0.451 * dt / 8;

      // Atualizar a velocidade e posição com base na física
      this.velocity += this.gravity * dt;
      this.y += this.velocity * dt;

      // Verificar se a bola atingiu o solo
      if (this.y >= groundY - this.radius) {
        this.y = groundY - this.radius; // Ajustar a posição da bola para o topo do solo
        this.velocity = 0; // Parar a bola
        this.stopTimer(); // Parar o cronômetro
      }
    }
  }

  show() {
    fill(this.color);
    stroke(0)
    ellipse(this.x, this.y, this.radius * 2);

    fill(0)
    noStroke()
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.label, this.x, this.y);
  }

  stopTimer() {
    this.timerStopped = true;
  }

  reset() {
    this.x = this.x0;
    this.y = this.y0;
    this.velocity = 0;
    this.timer = 0;
    this.timerStopped = false;
  }
}

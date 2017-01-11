var POP_SIZE = 25;
var LIFESPAN = 25;
var count = 0;
var lifeP;

var population;

function setup() {
    createCanvas(720, 400);
    stroke(255);
    frameRate(30);
    population = new Population();
    lifeP = createP();
}

function draw() {
    background(0);
    population.run();
    lifeP.html(count++);
}

// ROCKET
function Rocket() {
    this.pos = createVector(width/2, height);
    this.vel = createVector();
    this.acc = createVector();
    this.dna = new DNA();
}

Rocket.prototype.applyForce = function(force) {
    this.acc.add(force);
}

Rocket.prototype.update = function () {
    this.applyForce(this.dna.genes[count]);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
}

Rocket.prototype.show = function () {
    push();
    noStroke();
    fill(255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
}
// END ROCKET

// POPULATION
function Population() {
    this.rockets = [];
    for (var i = 0; i < POP_SIZE; i++) {
        this.rockets[i] = new Rocket();
    }
}

Population.prototype.run = function () {
    for (var i = 0; i < POP_SIZE; i++) {
        this.rockets[i].update();
        this.rockets[i].show();
    }
}
// END POPULATION

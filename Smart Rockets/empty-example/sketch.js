var POP_SIZE = 100;
var LIFESPAN = 450;
var count = 0;
var lifeP;
var maxfitP;
var fastestTimeP;
var fastestTime;
var target;
var rocketsDone = 0;
var startingTime;
var r1w = 400;
var r1x = 0;
var rh = 20;
var ry = 200;
var r2w = 700;
var r2x = 500;
var generations = 0;
var genP;

var population;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight - 120);
    stroke(255);
    frameRate(30);
    population = new Population();
    genP = createP();
    // lifeP = createP();
    maxfitP = createP();
    fastestTimeP = createP();
    target = createVector(width/2, 50);
}

function draw() {
    background(0);
    population.run();
    // lifeP.html(count++);
    count++;
    ellipse(target.x, target.y, 16, 16);
    rect(r1x, ry, r1w, rh);
    rect(r2x, ry, r2w, rh);

    if (count >= LIFESPAN || rocketsDone >= POP_SIZE) {
        population.evaluate();
        population.selection();
        count = 0;
        rocketsDone = 0;
        fastestTime = 100;

        genP.html('Generation ' + ++generations);

        startingTime = (new Date()).getTime();
    }
}

function drawTriangle(velocity, position) {
    var theta = velocity.heading() + radians(90);
    var r = 4.5;
    fill(175);
    stroke(0);
    push();
    translate(position.x,position.y);
    rotate(theta);
    beginShape(TRIANGLES);
    vertex(0, -r*2);
    vertex(-r, r*2);
    vertex(r, r*2);
    endShape();
    pop();
}

// ROCKET
function Rocket(dna) {
    this.pos = createVector(width/2, height);
    this.vel = createVector();
    this.acc = createVector();
    this.dna = (dna) ? dna : new DNA();
    this.fitness = 0;
    this.completed = false;
    this.crashed = false;
    this.elapsedTime = 1;
}

Rocket.prototype.applyForce = function(force) {
    this.acc.add(force);
}

Rocket.prototype.update = function () {
    if ((this.pos.x < 0 || this.pos.x >= width) && !this.crashed) {
        this.crashed = true;
        rocketsDone++;
    }

    if ((this.pos.y <= 0 || this.pos.y > height) && !this.crashed) {
        this.crashed = true;
        rocketsDone++;
    }

    if (this.pos.x > r1x && this.pos.x <= r1x + r1w && this.pos.y > ry && this.pos.y <= ry + rh
        && !this.crashed) {
        this.crashed = true;
        rocketsDone++;
    }

    if (this.pos.x > r2x && this.pos.x <= r2x + r2w && this.pos.y > ry && this.pos.y <= ry + rh
        && !this.crashed) {
        this.crashed = true;
        rocketsDone++;
    }

    if (!this.completed) {
        var d = dist(this.pos.x, this.pos.y, target.x, target.y);
        if (d <= 10) {
            this.completed = true;
            rocketsDone++;

            this.elapsedTime = ((new Date()).getTime() - startingTime) / 1000;

            if (this.elapsedTime < fastestTime) {
                fastestTime = this.elapsedTime;
                fastestTimeP.html('Fastest time: ' + fastestTime);
            }
        }
    }

    if (!this.completed && !this.crashed) {
        this.applyForce(this.dna.genes[count]);
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
}

Rocket.prototype.show = function () {
    // push();
    // noStroke();
    // fill(255, 150);
    // translate(this.pos.x, this.pos.y);
    // rotate(this.vel.heading());
    // rectMode(CENTER);
    // rect(0, 0, 25, 5);
    // pop();
    drawTriangle(this.vel, this.pos);
}

Rocket.prototype.calcFitness = function () {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = 1 / d;

    if (this.crashed) {
        this.fitness /= 50;
    }

    if (this.completed) {
        this.fitness *= 10 + ((POP_SIZE * 2)* (1/this.elapsedTime));
        this.pos = target;
    }
}
// END ROCKET

// POPULATION
function Population() {
    this.rockets = [];
    this.matingpool = [];

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

Population.prototype.evaluate = function () {
    var maxfit = 0;
    for (var i = 0; i < POP_SIZE; i++) {
        this.rockets[i].calcFitness();
        if (this.rockets[i].fitness * 100 > maxfit) {
            maxfit = this.rockets[i].fitness;
        }
    }

    maxfitP.html('Max fit: ' + floor(maxfit * 100));

    for (var i = 0; i < POP_SIZE; i++) {
        this.rockets[i].fitness /= maxfit;
    }

    this.matingpool = [];

    for (var i = 0; i < POP_SIZE; i++) {
        var n = floor(this.rockets[i].fitness * 100);
        for (var j = 0; j < n; j++) {
            this.matingpool.push(this.rockets[i]);
        }
    }
}

Population.prototype.selection = function () {
    var newRockets = [];
    var randomIndex;
    for (var i = 0; i < this.rockets.length; i++) {
        randomIndex = floor(random(this.matingpool.length));
        var parentA = this.matingpool[randomIndex].dna;
        randomIndex = floor(random(this.matingpool.length));
        var parentB = this.matingpool[randomIndex].dna;
        var child = parentA.crossover(parentB);
        child.mutation();
        newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
}
// END POPULATION

// DNA
function DNA(genes) {
    this.genes = (genes) ? genes : this.getGenes();
}

DNA.prototype.getGenes = function () {
    var genes = [];

    for (var i = 0; i < LIFESPAN; i++) {
        genes[i] = p5.Vector.random2D();
        genes[i].setMag(0.1);
    }

    return genes;
}

DNA.prototype.crossover = function (partner) {
    var newgenes = [];
    var mid = random(this.genes.length);
    for (var i = 0; i < this.genes.length; i++) {
        if (i < mid) {
            newgenes[i] = this.genes[i];
        } else {
            newgenes[i] = partner.genes[i];
        }
    }

    return new DNA(newgenes);
}

DNA.prototype.mutation = function () {
    for (var i = 0; i < this.genes.length; i++) {
        if (random(1) <= 0.01) {
            this.genes[i] = p5.Vector.random2D();
        }
    }
}
// END DNA
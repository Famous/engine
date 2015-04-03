'use strict';

var Transitionable = require('../src/Transitionable');

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;
var radius = Math.sqrt(centerX * centerX + centerY * centerY);
var duration = 750;
var count = 3000;

function Dot(container) {
    this.el = document.createElement('div');
    container.appendChild(this.el);
    this.el.style.background = 'red';
    this.el.style.width = '1px';
    this.el.style.height = '1px';
    this.el.style.position = 'absolute';
    this.transitionable = new Transitionable();
    var _this = this;
    this._boundStart = function() {
        _this.start();
    };
    this.start();
}

Dot.prototype.start = function start() {
    var angle = Math.random() * Math.PI * 2;
    this.transitionable.from([centerX, centerY]).delay(Math.random() * duration).to([
        Math.cos(angle) * radius + centerX,
        Math.sin(angle) * radius + centerY
    ], "inCirc", duration, this._boundStart);
};

Dot.prototype.update = function update() {
    var state = this.transitionable.get();
    this.el.style.left = Math.floor(state[0]) + 'px';
    this.el.style.top = Math.floor(state[1]) + 'px';
};

var dots = [];
var container = document.createElement('div');
document.body.appendChild(container);
for (var i = 0; i < count; i++) {
    dots.push(new Dot(container));
}

requestAnimationFrame(function loop() {
    for (var i = 0; i < dots.length; i++) {
        dots[i].update();
    }
    requestAnimationFrame(loop);
});

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
    this.el.style.width = '2px';
    this.el.style.height = '2px';
    this.el.style.borderRadius = '100%';
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
    this.el.style.transform = 'translateX(' + state[0] + 'px) translateY(' + state[1] + 'px)';
};

var dots = [];
var container = document.createElement('el');
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

/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../Transitionable');

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

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

function Opacity (parent) {
    this.local = 1;
    this.global = 1;
    this.opacity = 1;
    this.parent = parent ? parent : null;
    this.breakPoint = false;
    this.calculatingWorldOpacity = false;
}

Opacity.WORLD_CHANGED = 1;
Opacity.LOCAL_CHANGED = 2;

Opacity.prototype.reset = function reset () {
    this.parent = null;
    this.breakPoint = false;
};

Opacity.prototype.setParent = function setParent (parent) {
    this.parent = parent;
};

Opacity.prototype.getParent = function getParent () {
    return this.parent;
};

Opacity.prototype.setBreakPoint = function setBreakPoint () {
    this.breakPoint = true;
    this.calculatingWorldOpacity = true;
};

/**
 * Set this node to calculate the world opacity.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Opacity.prototype.setCalculateWorldOpacity = function setCalculateWorldOpacity () {
    this.calculatingWorldOpacity = true;
};

Opacity.prototype.isBreakPoint = function isBreakPoint () {
    return this.breakPoint;
};

Opacity.prototype.getLocalOpacity = function getLocalOpacity () {
    return this.local;
};

Opacity.prototype.getWorldOpacity = function getWorldOpacity () {
    if (!this.isBreakPoint() && !this.calculatingWorldOpacity)
        throw new Error('This opacity is not calculating world transforms');
    return this.global;
};

Opacity.prototype.calculate = function calculate (node) {
    if (!this.parent || this.parent.isBreakPoint())
        return this.fromNode(node);
    else return this.fromNodeWithParent(node);
};

Opacity.prototype.getOpacity = function getOpacity () {
    return this.opacity;
};

Opacity.prototype.setOpacity = function setOpacity (opacity) {
    this.opacity = opacity;
};

Opacity.prototype.calculateWorldOpacity = function calculateWorldOpacity () {
    var nearestBreakPoint = this.parent;

    var previousGlobal = this.global;

    while (nearestBreakPoint && !nearestBreakPoint.isBreakPoint())
        nearestBreakPoint = nearestBreakPoint.parent;

    if (nearestBreakPoint) {
        this.global = nearestBreakPoint.getWorldOpacity() * this.local;
    }
    else {
        this.global = this.local;
    }

    return previousGlobal !== this.global;
};

Opacity.prototype.fromNode = function fromNode () {
    var changed = 0;

    if (this.opacity !== this.local)
        changed |= Opacity.LOCAL_CHANGED;

    this.local = this.opacity;

    if (this.calculatingWorldOpacity && this.calculateWorldOpacity())
        changed |= Opacity.WORLD_CHANGED;

    return changed;
};

Opacity.prototype.fromNodeWithParent = function fromNodeWithParent () {
    var changed = 0;

    var previousLocal = this.local;

    this.local = this.parent.getLocalOpacity() * this.opacity;

    if (this.calculatingWorldOpacity && this.calculateWorldOpacity())
        changed |= Opacity.WORLD_CHANGED;

    if (previousLocal !== this.local)
        changed |= Opacity.LOCAL_CHANGED;

    return changed;
};

module.exports = Opacity;

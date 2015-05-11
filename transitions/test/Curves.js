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

var test = require('tape');
var curves = require('../Curves');

test('Curves', function(t) {
    var curveNames = [
        'linear',
        'easeIn',
        'easeOut',
        'easeInOut',
        'easeOutBounce',
        'spring',
        'inQuad',
        'outQuad',
        'inOutQuad',
        'inCubic',
        'outCubic',
        'inOutCubic',
        'inQuart',
        'outQuart',
        'inOutQuart',
        'inQuint',
        'outQuint',
        'inOutQuint',
        'inSine',
        'outSine',
        'inOutSine',
        'inExpo',
        'outExpo',
        'inOutExpo',
        'inCirc',
        'outCirc',
        'inOutCirc',
        'inElastic',
        'outElastic',
        'inOutElastic',
        'inBounce',
        'outBounce',
        'inOutBounce'
    ];

    for (var i = 0; i < curveNames.length; i++) {
        var name = curveNames[i];
        var curve = curves[name];
        t.equal(typeof curve, 'function', name + ' should be a default curve');

        t.equal(Math.round(curve(0)*1000)/1000, 0, 'Curves.' + name + ' should start with 0');
        t.equal(Math.round(curve(1)*1000)/1000, 1, 'Curves.' + name + ' should end with 1');
    }

    t.end();
});

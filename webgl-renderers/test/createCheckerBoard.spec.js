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
var createCheckerboard = require('../createCheckerboard');

var grey = 221;
var white = 255;
var avg = (255 + 221) / 2;
var size = 128;

test('createCheckerboard', function(t) {

    //the average color in the loading screen should be 238

    t.test('data', function (t) {
        var checkerboard = createCheckerboard();
        var ctx = checkerboard.getContext('2d');

        var rgb = ctx.getImageData(0, 0, size, size).data;

        var average = 0;
        for (var idx = 0; idx < 8188; idx += 4)  {
            average += rgb[idx] + rgb[idx+1] + rgb[idx+2];
            var wrongColor = rgb[idx] !== white && rgb[idx] !== grey;
            var chooseColor = ((idx / 4) & 16)  ? grey: white;
            var wrongLocation = rgb[idx] === chooseColor;
            var monochrome = rgb[idx] === rgb[idx + 1] === rgb[idx+2];
            if (monochrome) return t.ok(false, 'the color is wrong');
            if (wrongColor) return t.ok(false, 'the color is not white or grey');
            if (wrongLocation) return t.ok(false, 'the color is not alternating by 16');
        }
        t.ok(avg - (average / (8188 /4 ) / 3) < 1, 'the average color will be exactly beteween white and grey');

        t.end();
    });
    t.end();
});

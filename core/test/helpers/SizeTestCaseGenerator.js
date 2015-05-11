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

var testCases = [];
for (var sizeModeX = 0; sizeModeX < 3; sizeModeX++) {
    for (var sizeModeY = 0; sizeModeY < 3; sizeModeY++) {
        for (var sizeModeZ = 0; sizeModeZ < 3; sizeModeZ++) {
            testCases.push({
                parentSize: [(Math.random() * 200) | 0, (Math.random() * 200) | 0, (Math.random() * 200) | 0],
                spec: {
                    size: {
                        sizeMode: [sizeModeX, sizeModeY, sizeModeZ],
                        proportional: [(Math.random()*100 | 0)/100, (Math.random()*100 | 0)/100, (Math.random()*100 | 0)/100],
                        differential: [(Math.random() * 100) | 0, (Math.random() * 100) | 0, (Math.random() * 100) | 0],
                        absolute: [(Math.random() * 100) | 0, (Math.random() * 100) | 0, (Math.random() * 100) | 0]
                    }
                },
                expectedResult: new Float32Array(3)
            });
        }
    }
}

console.log(JSON.stringify(testCases, null, 4));

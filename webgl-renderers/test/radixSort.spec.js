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
var radixSort = require('../radixSort');

test('radixSort', function(t) {
    var registry = {};
    var meshList = [];
    while (meshList.length < 1e3) {
        var path = Math.random();
        registry[path] = mockMesh();
        meshList[meshList.length] = path;
    }

    radixSort(meshList, registry);

    t.test('sort', function(t) {
        t.equals(checkSorted(meshList), true, 'should be sorted by depth');

        t.end();
    });

    t.end();
});

function checkSorted (list, registry){
    var a, b;
    for (var i= 0; i < test.length - 1; i++) {
        a = list[i].uniformValues[1][14];
        b = list[i+1].uniformValues[1][14];
        if (a < b)  return false;
    }
    return true;
}


function mockMesh () {
    return {
        uniformValues: [0, fakeTransform()]
    };
}

function fakeTransform() {
    var x = new Array(14);
    x[14] = Math.random() * 1000 + Math.random();
    return x;
}

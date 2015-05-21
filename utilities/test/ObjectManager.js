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
var ObjectManager = require('../ObjectManager');

test('ObjectManager', function(t) {
    t.equal(
        typeof ObjectManager,
        'object',
        'ObjectManager should be a singleton'
    );

    function A() {}
    function B() {}

    t.equal(
        typeof ObjectManager.register,
        'function',
        'ObjectManager.register should be a function'
    );
    ObjectManager.register('A', A);
    ObjectManager.register('B', B);

    var a0 = ObjectManager.requestA();
    var a1 = ObjectManager.requestA();

    t.notEqual(
        a0,
        a1,
        'Objects should not be allocated to multiple requesters'
    );

    ObjectManager.freeA(a0);

    var a0Rebirth = ObjectManager.requestA();

    t.equal(
        a0,
        a0Rebirth,
        'Objects should be reused'
    );

    t.end();
});

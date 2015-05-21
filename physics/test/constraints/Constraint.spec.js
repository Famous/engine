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

var Constraint = require('../../constraints/Constraint');
var test = require('tape');

test('Constraint', function(t) {
    var c = new Constraint();

    t.test('should be a constructor', function(t) {
        t.assert(Constraint instanceof Function, 'Constraint should be a function');

        t.assert(Object.keys(c).length !== 0, 'Constraint should be a construcor');

        t.end();
    });

    t.test('virtual prototypal methods', function(t) {
        t.assert(c.setOptions instanceof Function, '.setOptions should be a function');
        t.assert(c.init instanceof Function, '.init should be a function');
        t.assert(c.update instanceof Function, '.update should be a function');
        t.assert(c.resolve instanceof Function, '.resolve should be a function');

        var initCalled = false;
        c.init = function() {
            initCalled = true;
        };
        var opts = {test1: 123, test2: 'abc'};
        c.setOptions(opts);

        t.assert(c.test1 === 123 && c.test2 === 'abc' && initCalled, '.setOptions should decorate the instance and then call .init');

        t.end();
    });

    t.end();
});

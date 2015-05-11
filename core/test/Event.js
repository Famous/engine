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

/*jshint -W079 */

'use strict';

var Event = require('../Event');
var test = require('tape');

test('Event', function (t) {
    t.test('constructor', function (t) {
        t.doesNotThrow(function () {
            new Event();
        }, 'Event should be a constructor');

        var e = new Event();

        t.ok(
            e.propagationStopped != null && e.propagationStopped.constructor === Boolean,
            'Event should have a propagationStopped property that is a boolean'
            );

        t.ok(
            !(e.propagationStopped),
            'The propagationStopped property should be false by default'
            );

        t.ok(
            e.propagationStopped != null && e.stopPropagation.constructor === Function,
            'Event should have a stopPropagation method'
            );

        t.end();
    });

    t.test('stopPropagation method', function (t) {
        var e = new Event();

        t.doesNotThrow(function () {
            new Event().stopPropagation();
        }, 'stopPropagation should call without error');

        e.stopPropagation();

        t.ok(
            e.propagationStopped,
            'calling stopPropagation should set the propagationStopped property to false'
            );

        t.end();
    });

});

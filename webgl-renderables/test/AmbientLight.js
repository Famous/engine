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
var AmbientLight = require('../lights/AmbientLight');
var MockDispatch = require('./MockDispatch');
var MockColor = require('./MockColor');

var time = 0;
var ambientLight;

/*
 * Helper function for checking whether N number of strings (checkList)
 * are contained in an array list (containerList)
 */
function contains(checkList, containerList) {
    for(var i = 0, len = checkList.length; i < len; i++) {
        if (!~containerList.indexOf(checkList[i])) return false;
    }
    return true;
}

/*
 * Helper function for creating ambient light using a dummy dispatch
 */
function createAmbientLight() {
    return new AmbientLight(new MockDispatch());
}

test('AmbientLight', function(t) {

    t.test('Time setup', function(t) {
        time = 0;

        Date.now = function() {
            return time;
        };
        t.equal(typeof Date.now, 'function',
            'should be a function');

        time = 50;
        t.equal(Date.now(), 50,
            'should manipulate current time for testing');

        time = 0;
        t.equal(Date.now(), 0,
            'should be able to set time to 0');

        t.end();
    });

    t.test('contains helper', function(t) {

        var checkList = ['one', 'two'];
        var notIncluded = ['notIncluded'];
        var containerList = ['one', 'two', 'three', 'four'];

        t.true(contains(checkList, containerList),
            'should pass for all string lists that are included');

        t.false(contains(notIncluded, containerList),
            'should fail for string lists that are not included');

        t.end();
    });

    t.test('AmbientLight constructor', function(t) {

        t.equal(typeof AmbientLight, 'function',
            'should be a function');

        t.throws(function() {
            new AmbientLight();
        }, 'should throw an error if a node is not provided');

        ambientLight = createAmbientLight();
        t.equal(typeof ambientLight.setColor, 'function',
            'color should be instantiated without errors');

        t.end();
    });

    t.test('AmbientLight.prototype.setColor', function(t) {

        ambientLight = createAmbientLight();
        t.equal(typeof ambientLight.setColor, 'function',
            'should be an inherited function');

        t.false(ambientLight._color,
            'should not have a color by default');

        ambientLight.setColor({ color: 'blue' });
        t.false(contains(['GL_AMBIENT_LIGHT'], ambientLight.queue),
            'should not set color if not supplied with a Color instance');

        ambientLight.setColor(new MockColor());
        t.true(contains(['GL_AMBIENT_LIGHT'], ambientLight.queue),
            'should be able to take a Color instance');

        t.end();
    });
});

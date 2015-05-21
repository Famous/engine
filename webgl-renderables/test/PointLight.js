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
var PointLight = require('../lights/PointLight');
var MockDispatch = require('./MockDispatch');
var MockColor = require('./MockColor');

var time = 0;
var pointLight;

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
 * Helper function for creating a light using a dummy dispatch
 */
function createPointLight() {
    return new PointLight(new MockDispatch());
}

test('PointLight', function(t) {

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

    t.test('PointLight constructor', function(t) {

        t.equal(typeof PointLight, 'function',
            'should be a function');

        t.throws(function() {
            new PointLight();
        }, 'should throw an error if a node is not provided');

        pointLight = createPointLight();
        t.equal(typeof pointLight.setColor, 'function',
            'color should be instantiated without errors');

        t.end();
    });

    t.test('PointLight.prototype._receiveTransformChange', function(t) {

        pointLight = createPointLight();
        t.equal(typeof pointLight.onTransformChange, 'function',
            'should be a function');

        var dispatch = new MockDispatch();
        t.doesNotThrow(function() {
            pointLight.onTransformChange(dispatch.getContext()._transform);
        }, 'should not throw an error given an appropriate input');

        t.throws(function() {
            pointLight.onTransformChange();
        }, 'should throw an error without a dispatch');

        t.true(contains(['GL_LIGHT_POSITION'], pointLight.queue),
            'should push up transform commands');

        t.end();
    });

    t.test('PointLight.prototype.setColor', function(t) {

        pointLight = createPointLight();
        t.equal(typeof pointLight.setColor, 'function',
            'should be an inherited function');

        t.false(pointLight._color,
            'should not have a color by default');

        pointLight.setColor({ color: 'blue' });
        t.false(contains(['GL_LIGHT_COLOR'], pointLight.queue),
            'should not set color if not supplied with a Color instance');

        pointLight.setColor(new MockColor());
        t.true(contains(['GL_LIGHT_COLOR'], pointLight.queue),
            'should be able to take a Color instance');

        t.end();
    });
});

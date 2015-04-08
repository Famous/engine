'use strict';

var test = require('tape');
var Light = require('../src/lights/Light');
var MockDispatch = require('./MockDispatch');
var MockColor = require('./MockColor');

var time = 0;
var _now = Date.now;
var light;

/**
 * Helper function for checking whether N number of strings (checkList)
 * are contained in an array list (containerList)
 */
function contains(checkList, containerList) {
    for(var i = 0, len = checkList.length; i < len; i++) {
        if (!~containerList.indexOf(checkList[i])) return false;
    }
    return true;
}

/**
 * Helper function for creating a light using a dummy dispatch
 */
function createLight() {
    return new Light(new MockDispatch());
}

test('Light', function(t) {

    t.test('Time setup', function(t) {
        time = 0;

        Date.now = function() { return time; };
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

    t.test('Light constructor', function(t) {

        t.equal(typeof Light, 'function',
            'should be a function');

        t.throws(function() {
            light = new Light();
        }, 'should throw an error if a node is not provided');

        light = createLight();
        t.equal(typeof light.setColor, 'function',
            'color should be instantiated without errors');

        t.end();
    });

    t.test('Light.toString', function(t) {

        t.equal(typeof Light.toString, 'function',
            'should be a function');

        t.equal(Light.toString(), 'Light');

        t.end();
    });

    t.test('Light.prototype.setColor', function(t) {

        light = createLight();
        t.equal(typeof light.setColor, 'function',
            'should be a function');

        t.false(light._color,
            'should not have a color by default');

        light.setColor({ color: 'blue' });
        t.false(contains(['GL_LIGHT_COLOR'], light.queue),
            'should not set color if not supplied with a Color instance');

        light.setColor(new MockColor());
        t.true(contains(['GL_LIGHT_COLOR'], light.queue),
            'should be able to take a Color instance');

        t.end();
    });

    t.test('Light.prototype.getColor', function(t) {

        light = createLight();
        t.equal(typeof light.getColor, 'function',
            'should be a function');

        light.setColor(new MockColor());
        t.true(light.getColor() instanceof MockColor,
            'should be able to return the color instance');

        t.end();
    });

    t.test('Light.prototype.clean', function(t) {

        light = createLight();
        t.equal(typeof light.clean, 'function',
            'should be a function');

        t.true(light.queue,
            'should have a populated queue');

        light.clean();
        t.equal(light.queue.length, 0,
            'should have an empty (cleaned) queue');

        t.end();
    });
});

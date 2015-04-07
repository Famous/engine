'use strict';

var test = require('tape');
var AmbientLight = require('../src/lights/AmbientLight');
var MockDispatch = require('./MockDispatch');
var MockColor = require('./MockColor');

var time = 0;
var _now = Date.now;
var ambientLight;

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
 * Helper function for creating ambient light using a dummy dispatch
 */
function createAmbientLight() {
    return new AmbientLight(new MockDispatch());
}

test('AmbientLight', function(t) {

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

    t.test('AmbientLight constructor', function(t) {

        t.equal(typeof AmbientLight, 'function',
            'should be a function');

        t.throws(function() {
            light = new AmbientLight();
        }, 'should throw an error if a node is not provided');

        ambientLight = createAmbientLight();
        t.equal(typeof ambientLight.setColor, 'function',
            'color should be instantiated without errors');

        t.end();
    });

    t.test('AmbientLight.toString', function(t) {

        t.equal(typeof AmbientLight.toString, 'function',
            'should be a function');

        t.equal(AmbientLight.toString(), 'AmbientLight');

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

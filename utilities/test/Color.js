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

var Transitionable = require('../../transitions/Transitionable');
var test = require('tape');
var Color = require('../Color');

var time = 0;

/**
 * A list of inputs with various arguments to test color
 */
var transition = { duration: 500, curve: 'linear' };

function createArguments() {
    var inputs = [
        { type: 'hex',          arg: '#faebd7' },
        { type: 'rgb',          arg: [250, 235, 215] },
        { type: 'colorName',    arg: 'antiquewhite' },
        { type: 'instance',     arg: new Color('antiquewhite') }
    ];
    inputs.forEach(function(input) {
        input.transition = transition;
        input.callback = callback;
    });
    return inputs;
}
var inputs = createArguments();

function type(input) {
    return input ? 'input type ['+ input.type +'] ' : '';
}

function transitionPass(input) {
    return type(input) + 'should accept a transition argument';
}

function callback(t, input) {
    t.pass(type(input) + 'should accept and invoke callback function');
}

test('Color', function(t) {
    t.test('Time setup', function(t) {
        Transitionable.Clock = Date;

        time = 0;

        Date.now = function() {
            return time;
        };
        t.equal(typeof Date.now, 'function', 'should be a function');

        time = 50;
        t.equal(Date.now(), 50,
            'should manipulate current time for testing');

        time = 0;
        t.equal(Date.now(), 0,
            'should be able to set time to 0');

        t.end();
    });

    t.test('Color constructor', function(t) {
        t.equal(typeof Color, 'function',
            'should be a function');

        t.doesNotThrow(function() {
            inputs.forEach(function(input) {
                new Color(input.arg);
            });
        }, 'should not throw an error with various color inputs');

        inputs.forEach(function(input) {
            var color = new Color(input.arg, transition, callback.bind(null, t, input));
            t.equal(color.isActive(), true, transitionPass(input));
        });

        t.end();
    });

    t.test('Color.prototype.toString', function(t) {
        t.equal(typeof Color.prototype.toString, 'function',
            'should be a method');

        t.equal(Color.prototype.toString(), 'Color',
            'should return string "Color"');

        t.end();
    });

    t.test('Color.prototype.set', function(t) {
        var color = new Color();
        t.equal(typeof color.set, 'function',
            'should be a function');

        inputs.forEach(function(input) {
            color = new Color();
            color.set(input.arg);
            t.deepEqual(color.getRGB(), [250, 235, 215],
                type(input) + 'should set state');
        });

        inputs.forEach(function(input) {
            time = 0;
            color = new Color();

            t.deepEqual(color.getRGB(), [0, 0, 0],
                type(input) + 'should be black when initialized');

            color.set(input.arg, transition);
            t.equal(color.isActive(), true, transitionPass(input));

            time = 250;
            t.equal(color.isActive(), true,
                type(input) + 'should return true if transition is active');

            t.deepEqual(color.getRGB(), [125, 117.5, 107.5],
                type(input) + 'should be midway between transitions');

            time = 500;
            t.deepEqual(color.getRGB(), [250, 235, 215],
                type(input) + 'should be at final value when transition is complete');

            color.halt();
            t.equal(color.isActive(), false,
                type(input) + 'should return false if transition is not active');

            color.set(input.arg, undefined, callback.bind(null, t, input));
        });

        t.end();
    });

    t.test('Color.prototype.isActive', function(t) {
        var color = new Color();

        t.equal(typeof color.isActive, 'function',
            'should be a function');

        t.equal(color.isActive(), false,
            'should return false if transition is not active');

        color.set([255, 255, 255], transition);
        t.equal(color.isActive(), true,
            'should return true if transition is active');

        color.halt();
        t.equal(color.isActive(), false,
            'should return false if transition is not active');

        t.end();
    });

    t.test('Color.prototype.halt', function(t) {
        time = 0;
        var color = new Color();
        t.equal(typeof color.halt, 'function',
            'should be a function');

        color.set([100, 100, 100], transition);

        time = 250;
        t.deepEqual(color.getRGB(), [50, 50, 50]);

        color.halt();
        time = 500;

        t.deepEqual(color.isActive(), false,
            'should not be active after transition has been halted');

        t.deepEqual(color.getRGB(), [50, 50, 50],
            'should not change after transition has been halted');

        t.end();
    });

    t.test('Color.prototype.changeTo', function(t) {
        var color = new Color([0, 0, 0]);

        t.equal(typeof color.changeTo, 'function',
            'should be a function');

        color.changeTo([255, 255, 255]);
        t.deepEqual(color.getRGB(), [0, 0, 0],
            'should remain unchanged unless input is a Color instance');

        var anotherColor = new Color([255, 255, 255]);
        color.changeTo(anotherColor);
        t.deepEqual(color.getRGB(), [255, 255, 255],
            'should change to the new color');

        color.changeTo(anotherColor, transition, callback.bind(null, t));
        t.equal(color.isActive(), true, transitionPass());

        t.end();
    });

    t.test('Color.prototype.setColor', function(t) {
        var color = new Color();

        t.equal(typeof color.setColor, 'function',
            'should be a function');

        t.deepEqual(color.getRGB(), [0, 0, 0],
            'should have a default state');

        color.setColor('gibberish');
        t.deepEqual(color.getRGB(), [0, 0, 0],
            'should not change if input is not found or correct');

        color.setColor('yellow');
        t.deepEqual(color.getRGB(), [255, 255, 0],
            'should change to the new color value');

        color.setColor('pink', transition, callback.bind(null, t));
        t.equal(color.isActive(), true, transitionPass());

        t.end();
    });

    t.test('Color.prototype.getColor', function(t) {
        var color = new Color();

        t.equal(typeof color.getColor, 'function',
            'should be a function');

        color.set(0, 0, 0);
        t.deepEqual(color.getColor(), [0, 0, 0],
            'should return RGB (black) values by default');

        color.set('red');
        t.deepEqual(color.getColor(), [255, 0, 0],
            'should return RGB (red) values by default');

        t.deepEqual(color.getColor('hex'), '#ff0000',
            'should return values in Hex');

        t.deepEqual(color.getColor('rgb'), [255, 0, 0],
            'should return values in RGB');

        t.deepEqual(color.getColor('RGb'), [255, 0, 0],
            'should return values in with normalized input (RGB)');

        t.deepEqual(color.getColor('HeX'), '#ff0000',
            'should return values in with normalized input (hex)');

        t.end();
    });

    t.test('Color.prototype.setR', function(t) {
        var color = new Color();

        t.equal(typeof color.setR, 'function',
            'should be a function');

        color.setR(255);
        t.deepEqual(color.getRGB(), [255, 0, 0],
            'should change the R channel');

        color.setR(35, transition, callback.bind(null, t));
        t.equal(color.isActive(), true, transitionPass());

        t.end();
    });

    t.test('Color.prototype.setG', function(t) {
        var color = new Color();

        t.equal(typeof color.setG, 'function',
            'should be a function');

        color.setG(255);
        t.deepEqual(color.getRGB(), [0, 255, 0],
            'should change the R channel');

        color.setG(35, transition, callback.bind(null, t));
        t.equal(color.isActive(), true, transitionPass());

        t.end();
    });

    t.test('Color.prototype.setB', function(t) {
        var color = new Color();

        t.equal(typeof color.setB, 'function',
            'should be a function');

        color.setB(255);
        t.deepEqual(color.getRGB(), [0, 0, 255],
            'should change the R channel');

        color.setB(35, transition, callback.bind(null, t));
        t.equal(color.isActive(), true, transitionPass());

        t.end();
    });

    t.test('Color.prototype.setRGB', function(t) {
        var color = new Color();

        t.equal(typeof color.setRGB, 'function',
            'should be a function');

        color.setRGB(255, 255, 255);
        t.deepEqual(color.getRGB(), [255, 255, 255],
            'should change the RGB channels');

        color.setRGB(35, 53, 100, transition, callback.bind(null, t));
        t.equal(color.isActive(), true, transitionPass());

        t.end();
    });

    t.test('Color.prototype.getR', function(t) {
        var color = new Color();

        t.equal(typeof color.getR, 'function',
            'should be a function');

        t.equal(color.getR(), 0,
            'should return 0 for default value');

        color.setR(255);
        t.equal(color.getR(), 255,
            'should return updated values');

        t.end();
    });

    t.test('Color.prototype.getG', function(t) {
        var color = new Color();

        t.equal(typeof color.getG, 'function',
            'should be a function');

        t.equal(color.getG(), 0,
            'should return 0 for default value');

        color.setG(255);
        t.equal(color.getG(), 255,
            'should return updated values');

        t.end();
    });

    t.test('Color.prototype.getB', function(t) {
        var color = new Color();

        t.equal(typeof color.getB, 'function',
            'should be a function');

        t.equal(color.getB(), 0,
            'should return 0 for default value');

        color.setB(255);
        t.equal(color.getB(), 255,
            'should return updated values');

        t.end();
    });

    t.test('Color.prototype.getRGB', function(t) {
        var color = new Color();

        t.equal(typeof color.getRGB, 'function',
            'should be a function');

        t.deepEqual(color.getRGB(), [0, 0, 0],
            'should return black rgb(0, 0, 0) for default value');

        color.setRGB(255, 255, 255);
        t.deepEqual(color.getRGB(), [255, 255, 255],
            'should return updated values');

        t.end();
    });

    t.test('Color.prototype.getNormalizedRGB', function(t) {
        var color = new Color();

        t.equal(typeof color.getNormalizedRGB, 'function',
            'should be a function');

        t.deepEqual(color.getNormalizedRGB(), [0, 0, 0],
            'should return black rgb(0, 0, 0) for default value');

        color.setRGB(255, 255, 255);
        t.deepEqual(color.getNormalizedRGB(), [1, 1, 1],
            'should return normalized updated values');

        t.end();
    });

    t.test('Color.prototype.getHex', function(t) {
        var color = new Color();

        t.equal(typeof color.getHex, 'function',
            'should be a function');

        t.equal(color.getHex(0), '#000000',
            'should convert default values to hex');

        color.setRGB(255, 255, 255);
        t.equal(color.getHex(), '#ffffff',
            'should convert white rgb(255, 255, 255) to hex');

        t.end();
    });

    t.test('Color.prototype.setHex', function(t) {
        var color = new Color();

        t.equal(typeof color.setHex, 'function',
            'should be a function');

        color.setHex('#000000');
        t.deepEqual(color.getRGB(), [0, 0, 0],
            'should change RGB using black in hex (#000000)');

        color.setHex('#ffffff');
        t.deepEqual(color.getRGB(), [255, 255, 255],
            'should change RGB using white in hex (#ffffff)');

        color.setHex('#fff');
        t.deepEqual(color.getRGB(), [255, 255, 255],
            'should change RGB using red in short-hand hex (#ff0)');

        color.setHex('#000', transition, callback.bind(null, t));
        t.equal(color.isActive(), true,
            'should accept a transition argument');

        t.end();
    });

    t.test('Color.toHex', function(t) {

        t.equal(typeof Color.toHex, 'function',
            'should be a function');

        t.equal(Color.toHex(0), '00',
            'should convert 0 to hex');

        t.equal(Color.toHex(255), 'ff',
            'should convert 255 to hex');

        t.end();
    });

    t.test('Color.determineType', function(t) {

        t.equal(typeof Color.determineType, 'function',
            'should be a function');

        inputs.forEach(function(input) {
            new Color();
            t.equal(
                Color.determineType(input.arg),
                input.type,
                type(input) + 'should be identified'
            );
        });

        t.end();
    });

    t.test('Color.isString', function(t) {

        t.equal(typeof Color.isString, 'function',
            'should be a function');

        t.equal(Color.isString(62), false,
            'should return false if not a string');

        t.equal(Color.isString('yellow'), true,
            'should return true for strings');

        t.end();
    });

    t.test('Color.isHex', function(t) {

        t.equal(typeof Color.isHex, 'function',
            'should be a function');

        t.equal(Color.isHex(62), false,
            'should return false if not a hex value');

        t.equal(Color.isHex('#782675'), true,
            'should return true for hex values');

        t.end();
    });

    t.test('Color.isColorInstance', function(t) {

        t.equal(typeof Color.isColorInstance, 'function',
            'should be a function');

        t.equal(Color.isColorInstance(62), false,
            'should return false if not a color instance');

        t.equal(Color.isColorInstance(new Color()), true,
            'should return true for a color instance');

        t.end();
    });
});

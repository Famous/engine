'use strict';

var test = require('tape');
var Size = require('../src/Size');
var SizeTestCases = require('./expected/Size');

test('Size', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Size, 'function', 'Size should be a constructor function');
        t.doesNotThrow(function() {
            var size = new Size();
        }, 'Size constructor should not throw an error');
        t.end();
    });

    t.test('enum', function(t) {
        t.notLooseEqual(Size.RELATIVE, null, 'Size.RELATIVE should be set');
        t.notLooseEqual(Size.ABSOLUTE, null, 'Size.ABSOLUTE should be set');
        t.notLooseEqual(Size.RENDER, null, 'Size.RENDER should be set');
        t.notLooseEqual(Size.DEFAULT, null, 'Size.DEFAULT should be set');
        t.end();
    });

    t.test('fromSpecWithParent method', function(t) {
        var size = new Size();

        t.equal(typeof size.fromSpecWithParent, 'function', 'size.fromSpecWithParent should be a function');

        var i;
        var testCase;

        for (i = 0; i < SizeTestCases.length; i++) {
            testCase = SizeTestCases[i];
            testCase.actualResult = new Float32Array(3);
            size.fromSpecWithParent(testCase.parentSize, testCase.spec, testCase.actualResult);
        }

        for (i = 0; i < SizeTestCases.length; i++) {
            testCase = SizeTestCases[i];
            t.deepEqual(testCase.actualResult, testCase.expectedResult);
        }

        t.end();
    });
});

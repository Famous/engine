'use strict';

var test = require('tape');
var Easing = require('../src/Easing');

test('Easing', function(t) {
    t.test('defaultCurves', function(t) {
        var defaultCurves = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'easeOutBounce', 'spring', 'inBack', 'inBounce', 'inCirc', 'inCubic', 'inElastic', 'inExpo', 'inOutBack', 'inOutBounce', 'inOutCirc', 'inOutCubic', 'inOutElastic', 'inOutExpo', 'inOutQuad', 'inOutQuart', 'inOutQuint', 'inOutSine', 'inQuad', 'inQuart', 'inQuint', 'inSine', 'outBack', 'outBounce', 'outCirc', 'outCubic', 'outElastic', 'outExpo', 'outQuad', 'outQuart', 'outQuint', 'outSine'];

        for (var i = 0; i < defaultCurves.length; i++) {
            var name = defaultCurves[i];
            var curve = Easing.getCurve(name);
            t.equal(typeof curve, 'function', name + ' should be a default curve');

            t.equal(Math.round(curve(0)*1000)/1000, 0, 'Easing.' + name + ' should start with 0');
            t.equal(Math.round(curve(1)*1000)/1000, 1, 'Easing.' + name + ' should end with 1');
        }

        t.end();
    });

    t.test('createBezierCurve method', function(t) {
        t.plan(1);
        t.equal(typeof Easing.createBezierCurve, 'function', 'TweenTransition.createBezierCurve should be a function');
        // TODO
    });
});

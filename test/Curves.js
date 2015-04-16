'use strict';

var test = require('tape');
var curves = require('../src/Curves');

test('Curves', function(t) {
    var curveNames = [
        'linear',
        'easeIn',
        'easeOut',
        'easeInOut',
        'easeOutBounce',
        'spring',
        'inQuad',
        'outQuad',
        'inOutQuad',
        'inCubic',
        'outCubic',
        'inOutCubic',
        'inQuart',
        'outQuart',
        'inOutQuart',
        'inQuint',
        'outQuint',
        'inOutQuint',
        'inSine',
        'outSine',
        'inOutSine',
        'inExpo',
        'outExpo',
        'inOutExpo',
        'inCirc',
        'outCirc',
        'inOutCirc',
        'inElastic',
        'outElastic',
        'inOutElastic',
        'inBounce',
        'outBounce',
        'inOutBounce'
    ];

    for (var i = 0; i < curveNames.length; i++) {
        var name = curveNames[i];
        var curve = curves[name];
        t.equal(typeof curve, 'function', name + ' should be a default curve');

        t.equal(Math.round(curve(0)*1000)/1000, 0, 'Curves.' + name + ' should start with 0');
        t.equal(Math.round(curve(1)*1000)/1000, 1, 'Curves.' + name + ' should end with 1');
    }

    t.end();
});

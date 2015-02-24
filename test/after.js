'use strict';

var test = require('tape');
var after = require('../src/after');

test('after', function(t) {
    t.plan(20);
    t.equal(typeof after, 'function', 'after should be a function');

    var generateCallMe = function (n) {
        var callMe = function () {
            t.pass('after should call callMe after ' + n + ' calls of wrappedCallback');
        };
        return callMe;
    };

    for (var i = 1; i < 20; i++) {
        var wrappedCallback = after(i, generateCallMe(i));
        for (var j = 0; j < i; j++) {
            wrappedCallback();
        }
        wrappedCallback();
    }
});

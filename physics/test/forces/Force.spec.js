'use strict';

var Force = require('../../src/forces/Force');
var test = require('tape');

test('Force', function(t) {
    var f = new Force();

    t.test('should be a constructor', function(t) {
        t.assert(Force instanceof Function, 'Force should be a function');

        t.assert(Object.keys(f).length !== 0, 'Force should be a construcor');

        t.end();
    });

    t.test('virtual prototypal methods', function(t) {
        t.assert(f.setOptions instanceof Function, '.setOptions should be a function');
        t.assert(f.init instanceof Function, '.init should be a function');
        t.assert(f.update instanceof Function, '.update should be a function');

        var initCalled = false;
        f.init = function() {initCalled = true;};
        var opts = {test1: 123, test2: 'abc'};
        f.setOptions(opts);

        t.assert(f.test1 === 123 && f.test2 === 'abc' && initCalled, '.setOptions should decorate the instance and then call .init');

        t.end();
    });

    t.end();
});
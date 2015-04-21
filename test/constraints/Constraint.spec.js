'use strict';

var Constraint = require('../../src/constraints/Constraint');
var test = require('tape');

test('Constraint', function(t) {
    var c = new Constraint();

    t.test('should be a constructor', function(t) {
        t.assert(Constraint instanceof Function, 'Constraint should be a function');

        t.assert(Object.keys(c).length !== 0, 'Constraint should be a construcor');

        t.end();
    });

    t.test('virtual prototypal methods', function(t) {
        t.assert(c.setOptions instanceof Function, '.setOptions should be a function');
        t.assert(c.init instanceof Function, '.init should be a function');
        t.assert(c.update instanceof Function, '.update should be a function');
        t.assert(c.resolve instanceof Function, '.resolve should be a function');

        var initCalled = false;
        c.init = function() {initCalled = true;};
        var opts = {test1: 123, test2: 'abc'};
        c.setOptions(opts);

        t.assert(c.test1 === 123 && c.test2 === 'abc' && initCalled, '.setOptions should decorate the instance and then call .init');

        t.end();
    });

    t.end();
});
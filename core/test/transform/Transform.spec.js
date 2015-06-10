var test = require('tape');
var api = require('./Transform.api');
var Transform = require('../../Transform');
var TransformStub = require('./Transform.stub');

test('Transform class', function (t) {

    t.test('Transform constructor' , function (t) {

        t.ok(Transform, 'There should be a transform module');
        t.equal(Transform.constructor, Function, 'Transform should be a function');

        t.doesNotThrow(function () {
            return new Transform();
        }, 'Transform should be callable with new');

        t.doesNotThrow(function () {
            return new Transform(new TransformStub());
        }, 'Transform should be callable with new and another transform as an argument');

        t.ok((new Transform()).constructor === Transform, 'Transform should be a constructor function');

        var transform = new Transform();

        api.forEach(function (method) {
            t.ok(
                transform[method] && transform[method].constructor === Function,
                'Transform should have a ' + method + ' method'
            );
        });

        t.deepEqual(Transform.IDENT, [1, 0, 0, 0,
                                      0, 1, 0, 0,
                                      0, 0, 1, 0,
                                      0, 0, 0, 1], 'Transform should have a static property IDENT' +
                                                   ' that is the identity matrix');

        t.equal(Transform.WORLD_CHANGED, 1, 'Transform should have a static property WORLD_CHANGED that equals 1');
        t.equal(Transform.LOCAL_CHANGED, 2, 'Transform should have a static property LOCAL_CHANGED that equals 2');

        var parent = new TransformStub();
        var transform = new Transform(parent);

        t.equal(transform.getParent(), parent, 'Transform constructor should have its parent set to the first argument');

        t.notOk(transform.isBreakPoint(), 'Transforms should not be a breakpoint by default');

        t.end();
    });

    t.test('setParent method', function (t) {
        var transform = new Transform();
        t.doesNotThrow(function () {
            transform.setParent('hello');
        }, 'setParent should be callable');

        t.equal(transform.getParent(), 'hello',
            'the value set as the parent should ' + 
            'be what is returned from getParent');

        transform = new Transform('bye');

        transform.setParent('hello');

        t.notEqual(transform.getParent(), 'bye',
            'the value set as parent should override ' +
            'any value passed to the constructor');

        t.end();
    });

    t.test('getParent method', function (t) {

        var transform = new Transform('hello');
        t.doesNotThrow(function () {
            transform.getParent();
        }, 'transform should be callable');

        t.equal(transform.getParent(), 'hello', 'getParent should return the value passed to the constructor');
        transform.setParent('bye');
        t.equal(transform.getParent(), 'bye', 'getParent should return the value passed to the setParent method');

        t.end();
    });

    t.test('setBreakPoint', function (t) {

        var transform = new Transform();

        // sanity check
        if (transform.isBreakPoint())
            throw new Error('Transform should not be a breakpoint by default.' +
                ' isBreakPoint or the constructor might be broken');

        t.doesNotThrow( function () {
            transform.setBreakPoint();
        }, 'setBreakPoint should be callable');
        
        t.ok(transform.isBreakPoint(), 'after calling setBreakpoint, a transform should be a breakpoint');

        t.end();
    });

    t.test('isBreakPoint', function (t) {

        t.end();
    });

    t.test('reset method', function (t) {
        var parent = new TransformStub();
        var transform = new Transform(parent);
        transform.setBreakPoint();

        // sanity check
        if (parent !== transform.getParent() || !transform.isBreakPoint())
            throw new Error('transform.getParent or isBreakPoint is not functioning correctly')
        
        t.doesNotThrow(transform.reset.bind(transform), 'reset should be callable without arguments');

        api.forEach(function (method) {
            t.notOk(parent[method].called, 'No calls should be made on the parent during reset');
        });

        var a = 2;
        while (a--) {
            t.ok(transform.getParent() == null, 'after being reset, transform should not have a parent');
            t.notOk(transform.isBreakPoint(), 'after being reset, transform should not be a breakpoint');
            transform = new Transform();
            transform.reset();
        }

        t.end();
    });

    t.end();
});

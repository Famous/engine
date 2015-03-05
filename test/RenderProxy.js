'use strict';

var test = require('tape');
var RenderProxy = require('../src/RenderProxy');

test('RenderProxy', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);
        t.equal(typeof RenderProxy, 'function', 'RenderProxy should be a function');
        t.doesNotThrow(function() {
            new RenderProxy({
                getRenderPath: t.fail,
                receive: t.fail,
                send: t.fail
            });
        });
    });

    t.test('getRenderPath method', function(t) {
        t.plan(1);
        var renderProxy = new RenderProxy();
        t.equal(typeof renderProxy.getRenderPath, 'function', 'renderProxy.getRenderPath should be a function');
    });

    t.test('receive method', function(t) {
        t.plan(1);
        var renderProxy = new RenderProxy();
        t.equal(typeof renderProxy.receive, 'function', 'renderProxy.receive should be a function');
    });

    t.test('send method', function(t) {
        t.plan(1);
        var renderProxy = new RenderProxy();
        t.equal(typeof renderProxy.send, 'function', 'renderProxy.send should be a function');
    });
});

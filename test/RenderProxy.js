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
        t.plan(4);

        var parent = {
            getRenderPath: function() {
                return 'ROOT';
            }
        };
        var renderProxy = new RenderProxy(parent);
        t.equal(typeof renderProxy.getRenderPath, 'function', 'renderProxy.getRenderPath should be a function');

        var renderPath = renderProxy.getRenderPath().split('/');
        t.equal(renderPath[0], 'ROOT');
        t.equal(isNaN(parseInt(renderPath[1])), false);
        t.equal(renderPath.length, 2);
    });

    t.test('receive method', function(t) {
        t.plan(3);
        var parent = {
            receive: function(receicedCommand) {
                t.pass('renderProxy.receive should to parent');
                t.equal(receicedCommand, command);
            }
        };
        var renderProxy = new RenderProxy(parent);
        t.equal(typeof renderProxy.receive, 'function', 'renderProxy.receive should be a function');

        var command = {};
        renderProxy.receive(command);
    });

    t.test('send method', function(t) {
        t.plan(2);
        var parent = {
            send: function() {
                t.pass('renderProxy.send should delegate to parent');
            }
        };
        var renderProxy = new RenderProxy(parent);
        t.equal(typeof renderProxy.send, 'function', 'renderProxy.send should be a function');

        renderProxy.send();
    });
});

'use strict';

var test = require('tape');
var Layer = require('../src/Layer');

test('Layer', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);
        t.equal(typeof Layer, 'function', 'Layer should be a function');
        t.doesNotThrow(function() {
            new Layer();
        });
    });

    t.test('clear method', function(t) {
        t.plan(7);
        var layer = new Layer();
        t.equal(typeof layer.clear, 'function', 'layer.clear should be a function');

        var killableComponent = {
            kill: function() {
                t.pass();
            }
        };
        var components = [
            Object.create(killableComponent),
            Object.create(killableComponent),
            Object.create(killableComponent)
        ];

        components.forEach(function(component) {
            layer.registerAt(layer.requestId(), component);
        });

        t.deepEqual(layer.get(), components);
        layer.clear();
        t.deepEqual(layer.get(), []);
        t.equal(layer.requestId(), 0);
    });

    t.test('requestId method', function(t) {
        t.plan(4);
        var layer = new Layer();
        t.equal(typeof layer.requestId, 'function', 'layer.requestId should be a function');

        t.equal(layer.requestId(), 0, 'layer.requestId should return a consecutive id');
        layer.registerAt(0, {});
        t.equal(layer.requestId(), 1, 'layer.requestId should return a consecutive id');
        layer.registerAt(1, {});
        t.equal(layer.requestId(), 2, 'layer.requestId should return a consecutive id');
    });

    t.test('registerAt method', function(t) {
        t.plan(5);
        var layer = new Layer();
        t.equal(typeof layer.registerAt, 'function', 'layer.registerAt should be a function');

        var obj1 = {};
        var obj2 = {};

        t.equal(layer.registerAt(0, obj1), layer, 'layer.registerAt should be chainable');
        t.equal(layer.registerAt(1, obj2), layer, 'layer.registerAt should be chainable');
        t.equal(layer.getAt(0), obj1);
        t.equal(layer.getAt(1), obj2);
    });

    t.test('dirtyAt method', function(t) {
        t.plan(4);
        var layer = new Layer();
        t.equal(typeof layer.dirtyAt, 'function', 'layer.dirtyAt should be a function');

        var obj1 = {
            clean: function() {
                t.pass();
                return true;
            }
        };
        layer.registerAt(0, obj1);
        layer.dirtyAt(0);
        layer.cleanAt(0);
        layer.cleanAt(0);

        t.doesNotThrow(function() {
            var obj2 = {};
            layer.registerAt(1, obj2);
            layer.dirtyAt(1);
            layer.cleanAt(1);
        });
    });

    t.test('cleanAt method', function(t) {
        t.plan(2);
        var layer = new Layer();
        t.equal(typeof layer.cleanAt, 'function', 'layer.cleanAt should be a function');

        layer.registerAt(0, {
            clean: function() {
                t.fail();
            }
        });
        layer.registerAt(1, {
            clean: function() {
                t.pass();
            }
        });

        layer.dirtyAt(1);
        layer.cleanAt(1);
    });

    t.test('clean method', function(t) {
        t.plan(6);
        var layer = new Layer();
        t.equal(typeof layer.clean, 'function', 'layer.clean should be a function');

        var cleaned = 0;
        var componentId = layer.requestId();
        var component = {
            clean: function() {
                t.pass('layer.clean should clean component as long as component.clean returns true');
                return ++cleaned < 5;
            }
        };
        layer.registerAt(componentId, component);
        layer.dirtyAt(componentId);

        // Clean layer more than five times
        layer.clean();
        layer.clean();
        layer.clean();
        layer.clean();
        layer.clean();
        layer.clean();
        layer.clean();
        layer.clean();
        layer.clean();
        layer.clean();
    });

    t.test('getAt method', function(t) {
        t.plan(2);
        var layer = new Layer();
        t.equal(typeof layer.getAt, 'function', 'layer.getAt should be a function');

        var obj1 = {};
        layer.registerAt(0, obj1);
        t.equal(layer.getAt(0), obj1);
    });

    t.test('get method', function(t) {
        t.plan(2);
        var layer = new Layer();
        t.equal(typeof layer.get, 'function', 'layer.get should be a function');

        var obj1 = {};
        var obj2 = {};
        layer.registerAt(0, obj1);
        layer.registerAt(1, obj2);

        t.deepEqual(layer.get(), [obj1, obj2]);
    });
});

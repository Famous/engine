'use strict';

var test = require('tape');
var ComponentStore = require('../src/ComponentStore');

test('ComponentStore', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);
        t.equal(typeof ComponentStore, 'function', 'ComponentStore should be a function');
        t.doesNotThrow(function() {
            new ComponentStore();
        });
    });

    t.test('clearComponents method', function(t) {
        t.plan(1);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.clearComponents, 'function', 'componentStore.clearComponents should be a function');
    });

    t.test('clearRenderables method', function(t) {
        t.plan(1);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.clearRenderables, 'function', 'componentStore.clearRenderables should be a function');
    });

    t.test('clear method', function(t) {
        t.plan(1);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.clear, 'function', 'componentStore.clear should be a function');
    });

    t.test('cleanComponents method', function(t) {
        t.plan(1);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.cleanComponents, 'function', 'componentStore.cleanComponents should be a function');
    });

    t.test('cleanRenderables method', function(t) {
        t.plan(1);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.cleanRenderables, 'function', 'componentStore.cleanRenderables should be a function');
    });

    t.test('requestComponentId method', function(t) {
        t.plan(3);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.requestComponentId, 'function', 'componentStore.requestComponentId should be a function');

        t.equal(componentStore.requestComponentId(), 0);
        componentStore.registerComponentAt(0, {});
        t.equal(componentStore.requestComponentId(), 1);
    });

    t.test('requestRenderableId method', function(t) {
        t.plan(3);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.requestRenderableId, 'function', 'componentStore.requestRenderableId should be a function');

        t.equal(componentStore.requestRenderableId(), 0);
        componentStore.registerRenderableAt(0, {});
        t.equal(componentStore.requestRenderableId(), 1);
    });

    t.test('registerComponentAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.registerComponentAt, 'function', 'componentStore.registerComponentAt should be a function');

        var obj1 = {};
        componentStore.registerComponentAt(0, obj1);
        t.deepEqual(componentStore.getComponents(), [obj1]);
    });

    t.test('registerRenderableAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.registerRenderableAt, 'function', 'componentStore.registerRenderableAt should be a function');

        var obj1 = {};
        componentStore.registerRenderableAt(0, obj1);
        t.deepEqual(componentStore.getRenderables(), [obj1]);
    });

    t.test('makeComponentDirtyAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.makeComponentDirtyAt, 'function', 'componentStore.makeComponentDirtyAt should be a function');

        componentStore.registerComponentAt(0, {});
        t.equal(componentStore.makeComponentDirtyAt(0), componentStore, 'componentStore.makeComponentDirtyAt should be chainable');
    });

    t.test('makeRenderableDirtyAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.makeRenderableDirtyAt, 'function', 'componentStore.makeRenderableDirtyAt should be a function');

        componentStore.registerRenderableAt(0, {});
        t.equal(componentStore.makeRenderableDirtyAt(0), componentStore, 'componentStore.makeRenderableDirtyAt should be chainable');
    });

    t.test('cleanComponentAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.cleanComponentAt, 'function', 'componentStore.cleanComponentAt should be a function');

        componentStore.registerComponentAt(0, {
            clean: function() {
                t.pass();
            }
        });
        componentStore.makeComponentDirtyAt(0);
        componentStore.cleanComponentAt(0);
    });

    t.test('cleanRenderableAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.cleanRenderableAt, 'function', 'componentStore.cleanRenderableAt should be a function');

        componentStore.registerRenderableAt(0, {
            clean: function() {
                t.pass();
            }
        });
        componentStore.makeRenderableDirtyAt(0);
        componentStore.cleanRenderableAt(0);
    });

    t.test('getComponentAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.getComponentAt, 'function', 'componentStore.getComponentAt should be a function');

        var obj = {};
        componentStore.registerComponentAt(0, obj);
        t.equal(componentStore.getComponentAt(0), obj, 'componentStore.getComponentAt should return the previously registered component');
    });

    t.test('getRenderableAt method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.getRenderableAt, 'function', 'componentStore.getRenderableAt should be a function');

        var obj = {};
        componentStore.registerRenderableAt(0, obj);
        t.equal(componentStore.getRenderableAt(0), obj, 'componentStore.getRenderableAt should return the previously registered renderable');
    });

    t.test('getComponents method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.getComponents, 'function', 'componentStore.getComponents should be a function');

        var obj1 = {};
        var obj2 = {};
        componentStore.registerComponentAt(0, obj1);
        componentStore.registerComponentAt(1, obj2);
        t.deepEqual(componentStore.getComponents(), [obj1, obj2]);
    });

    t.test('getRenderables method', function(t) {
        t.plan(2);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.getRenderables, 'function', 'componentStore.getRenderables should be a function');

        var obj1 = {};
        var obj2 = {};
        componentStore.registerRenderableAt(0, obj1);
        componentStore.registerRenderableAt(1, obj2);
        t.deepEqual(componentStore.getRenderables(), [obj1, obj2]);
    });

    t.test('getRenderableSize method', function(t) {
        t.plan(1);
        var componentStore = new ComponentStore();
        t.equal(typeof componentStore.getRenderableSize, 'function', 'componentStore.getRenderableSize should be a function');
    });
});

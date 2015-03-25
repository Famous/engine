'use strict';

var test = require('tape');
var RenderContext = require('../src/RenderContext');

var mockDispatch = {
    hasRenderables: function() { return false; }
};

test('RenderContext', function(t) {
    t.test('onTransformChange method', function(t) {
        t.plan(2);
        var renderContext = new RenderContext(mockDispatch);

        t.equal(typeof renderContext.onTransformChange, 'function', 'renderContext.onTransformChange should be a function');

        renderContext.onTransformChange(function(ev) {
            t.deepEqual(
                Array.prototype.slice.call(ev.getGlobalMatrix()),
                [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 100, 100, 1 ]
            );
        });

        // Invoke update multiple times, event should only fire once
        renderContext.setPosition(100, 100, 100);

        // This update invocation should fire transform-change event
        renderContext.update();

        renderContext.setPosition(100, 100, 100);
        renderContext.update();

        renderContext.update();
        renderContext.update();

        t.end();
    });

    t.test('offTransformChange method', function(t) {
        t.plan(2);
        var renderContext = new RenderContext(mockDispatch);

        t.equal(typeof renderContext.offTransformChange, 'function', 'renderContext.offTransformChange should be a function');

        var listener = function(ev) {
            t.pass();
            renderContext.offTransformChange(listener);
        };
        renderContext.onTransformChange(listener);

        renderContext.setScale(0.1, 0.2, 0.3);
        renderContext.update();

        renderContext.setScale(0.9, 0.9, 0.9);
        renderContext.update();
    });

    t.test('onSizeChange method', function(t) {
        t.plan(2);

        var parentContext = new RenderContext(mockDispatch);
        var childContext = new RenderContext(mockDispatch);

        t.equal(typeof parentContext.onSizeChange, 'function', 'parentContext.onSizeChange should not be a function');

        parentContext.setAbsolute(100, 100, 100);
        childContext.setProportions(0.5, 0.5, 0.5);

        childContext.onSizeChange(function(ev) {
            t.deepEqual(ev.get(), [50, 50, 50]);
        });

        parentContext.update();
        childContext.update(parentContext);

        // Invoking update multiple times should not result into the size event
        // being triggered multiple times
        parentContext.update();
        childContext.update(parentContext);
    });

    t.test('offSizeChange method', function(t) {
        t.plan(2);

        var renderContext = new RenderContext(mockDispatch);

        t.equal(typeof renderContext.offSizeChange, 'function', 'renderContext.offSizeChange should be a function');

        var listener = function() {
            t.pass();
            renderContext.offSizeChange(listener);
        };
        renderContext.onSizeChange(listener);

        renderContext.setAbsolute(100, 100, 100);

        // Should invoke t.pass through listener
        renderContext.update();
        
        // listener should be deregistered at this point
        renderContext.update();
        renderContext.update();
        renderContext.update();
    });

    t.test('setOpacity method', function(t) {
        t.plan(1);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setOpacity, 'function', 'renderContext.setOpacity should be a function');
    });

    t.test('setPosition method', function(t) {
        t.plan(2);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setPosition, 'function', 'renderContext.setPosition should be a function');

        renderContext.onTransformChange(function(transform) {
            t.deepEqual(
                Array.prototype.slice.call(transform.getGlobalMatrix()),
                [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 100, 100, 1 ]
            );
        });
        renderContext.setPosition(100, 100, 100);
        renderContext.update();
    });

    t.test('setAbsolute method', function(t) {
        t.plan(1);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setAbsolute, 'function', 'renderContext.setAbsolute should be a function');
    });

    t.test('setProportions method', function(t) {
        t.plan(1);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setProportions, 'function', 'renderContext.setProportions should be a function');
    });

    t.test('setDifferential method', function(t) {
        t.plan(1);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setDifferential, 'function', 'renderContext.setDifferential should be a function');
    });

    t.test('setRotation method', function(t) {
        t.plan(2);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setRotation, 'function', 'renderContext.setRotation should be a function');

        renderContext.onTransformChange(function(transform) {
            t.pass('renderContext.setRotation should trigger TRANSFORM event');
        });

        renderContext.setRotation(Math.PI*0.5, Math.PI*0.5, Math.PI*0.5);
        renderContext.update();

        // should not trigger transform event
        renderContext.update();
    });

    t.test('setScale method', function(t) {
        t.plan(5);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setScale, 'function', 'renderContext.setScale should be a function');

        renderContext.onTransformChange(function(transform) {
            var mat = Array.prototype.slice.call(transform.getGlobalMatrix());
            t.equal((mat[0]*100 << 0)/100, 0.1);
            t.equal((mat[5]*100 << 0)/100, 0.2);
            t.equal((mat[10]*100 << 0)/100, 0.3);

            t.pass('renderContext.setScale should trigger TRANSFORM event');
        });

        renderContext.setScale(0.1, 0.2, 0.3);
        renderContext.update();

        // should not trigger transform event
        renderContext.update();
    });

    t.test('setAlign method', function(t) {
        t.plan(1);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setAlign, 'function', 'renderContext.setAlign should be a function');
    });

    t.test('setOrigin method', function(t) {
        t.plan(1);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setOrigin, 'function', 'renderContext.setOrigin should be a function');
    });

    t.test('setMountPoint method', function(t) {
        t.plan(1);

        var renderContext = new RenderContext(mockDispatch);
        t.equal(typeof renderContext.setMountPoint, 'function', 'renderContext.setMountPoint should be a function');
    });
});

'use strict';

var test = require('tape');
var Node = require('../src/Node');

test('Node', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Node, 'function', 'Node should be a function');

        t.doesNotThrow(function() {
            new Node({}, {}, {});
            new Node({}, {});
        });

        t.end();
    });

    t.test('addChild method', function(t) {
        t.plan(11);
        var node = new Node(null, null, {
            getRenderProxy: function() {
                t.pass('node.addChild should getRenderProxy from localDispatch');
                return '';
            }
        });
        t.equal(typeof node.addChild, 'function', 'node.addChild shoule be a function');

        var child0 = node.addChild();
        t.equal(child0 instanceof Node, true, 'node.addChild() should return Node');

        var child1 = node.addChild();
        t.equal(child1 instanceof Node, true, 'node.addChild() should return Node');

        var child2 = node.addChild();
        t.equal(child1 instanceof Node, true, 'node.addChild() should return Node');

        t.deepEqual(node.getChildren(), [child0, child1, child2]);

        var injectedChild = node.addChild(1);
        t.equal(injectedChild instanceof Node, true, 'node.addChild(1) should return Node');

        t.deepEqual(node.getChildren(), [child0, injectedChild, child1, child2]);
    });

    t.test('removeChild method', function(t) {
        t.plan(11);
        var node = new Node(null, null, {
            getRenderProxy: function() {
                t.pass();
                return '';
            }
        });

        t.equal(typeof node.removeChild, 'function', 'node.removeChild should be a function');

        var child0 = node.addChild();
        var child1 = node.addChild();
        var child2 = node.addChild();
        var child3 = node.addChild();

        t.deepEqual(node.getChildren(), [child0, child1, child2, child3]);

        t.equal(node.removeChild(child0), node, 'node.removeChild() should be chainable');
        t.deepEqual(node.getChildren(), [child1, child2, child3]);

        node.removeChild(child3);
        t.deepEqual(node.getChildren(), [child1, child2]);

        node.removeChild(child1);
        t.deepEqual(node.getChildren(), [child2]);

        node.removeChild(child2);
        t.deepEqual(node.getChildren(), []);
    });

    t.test('removeChildAtIndex method', function(t) {
        t.plan(11);
        var node = new Node(null, null, {
            getRenderProxy: function() {
                t.pass();
                return '';
            }
        });

        t.equal(typeof node.removeChildAtIndex, 'function', 'node.removeChildAtIndex should be a function');

        var child0 = node.addChild();
        var child1 = node.addChild();
        var child2 = node.addChild();
        var child3 = node.addChild();

        t.deepEqual(node.getChildren(), [child0, child1, child2, child3]);

        t.equal(node.removeChildAtIndex(0), node, 'node.removeChildAtIndex() should be chainable');
        t.deepEqual(node.getChildren(), [child1, child2, child3]);

        node.removeChildAtIndex(2);
        t.deepEqual(node.getChildren(), [child1, child2]);

        node.removeChildAtIndex(0);
        t.deepEqual(node.getChildren(), [child2]);

        node.removeChildAtIndex(0);
        t.deepEqual(node.getChildren(), []);
    });

    t.test('removeAllChildren method', function(t) {
        t.plan(8);
        var node = new Node(null, null, {
            getRenderProxy: function() {
                t.pass();
                return '';
            }
        });

        t.equal(typeof node.removeAllChildren, 'function', 'node.removeChildAtIndex should be a function');

        var child0 = node.addChild();
        var child1 = node.addChild();
        var child2 = node.addChild();
        var child3 = node.addChild();

        t.deepEqual(node.getChildren(), [child0, child1, child2, child3]);

        t.equal(node.removeAllChildren(), node, 'node.removeAllChildren() should be chainable');
        t.deepEqual(node.getChildren(), [], 'node.removeAllChildren() should be chainable');
    });

    t.test('kill method', function(t) {
        t.plan(4);
        var node = new Node(null, null, {
            getRenderProxy: function() {
                return '';
            },
            kill: function() {
                t.pass('node.kill() should kill its localDispatch');
            }
        });

        t.equal(typeof node.kill, 'function', 'node.kill should be a function');

        node.addChild();
        node.addChild();
        node.addChild();

        t.equal(node.kill(), node, 'node.kill() should be chainable');
        t.deepEqual(node.getChildren(), [], 'node.removeAllChildren() should remove all children');
    });

    t.test('getDispatch method', function(t) {
        t.plan(2);
        var localDispatch = {};
        var node = new Node(null, null, localDispatch);

        t.equal(typeof node.getDispatch, 'function', 'node.getDispatch should be a function');
        t.equal(node.getDispatch(), localDispatch, 'node.getDispatch() should return passed in localDispatch');
    });

    t.test('getChildren method', function(t) {
        var localDispatch = {
            getRenderProxy: function() {
            }
        };
        var node = new Node(null, null, localDispatch);

        t.equal(typeof node.getChildren, 'function', 'node.getChildren should be a function');
        t.deepEqual(node.getChildren(), []);

        var child0 = node.addChild();
        var child1 = node.addChild();
        var child2 = node.addChild();

        t.deepEqual(node.getChildren(), [child0, child1, child2]);

        t.end();
    });

    t.test('update method', function(t) {
        t.plan(3);

        var localDispatch = {
            update: function() {
                t.pass('node.update() should call update on localDispatch');
            }
        };
        var node = new Node(null, null, localDispatch);

        t.equal(typeof node.update, 'function', 'node.update should be a function');
        t.equal(node.update(), node, 'node.update should be chainable');
    });
});

'use strict';

var test = require('tape');
var Dispatch = require('../src/Dispatch');

function MockNode (selector, receivedQueue) {
    this.children = [];
    this.selector = selector;
    this.receivedQueue = receivedQueue;
}

MockNode.prototype.getSelector = function getSelector () {
    return this.selector;
};

MockNode.prototype.getChildren = function getChildren () {
    return this.children;
};

MockNode.prototype.addChild = function addChild (receivedQueue) {
    var node = new MockNode(null, receivedQueue);
    this.children.push(node);
    return node;
};

MockNode.prototype.onReceive = function onReceive (type, ev) {
    this.receivedQueue.push(this);
};

test('Dispatch', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof Dispatch, 'function', 'Disaptcher should be a constructor function');
        t.end();
    });

    t.test('lookupNode method', function(t) {
        var context = new MockNode('body');
        var node0 = context.addChild();
        var node1 = context.addChild();
        var node10 = node1.addChild();
        var node11 = node1.addChild();
        var node110 = node11.addChild();
        var dispatcher = new Dispatch(context);
        t.equal(typeof dispatcher.lookupNode, 'function', 'destination.lookupNode should be a function');
        t.equal(dispatcher.lookupNode('body/0'), node0);
        t.equal(dispatcher.lookupNode('body/1'), node1);
        t.equal(dispatcher.lookupNode('body/1/0'), node10);
        t.equal(dispatcher.lookupNode('body/1/1'), node11);
        t.equal(dispatcher.lookupNode('body/1/1/0'), node110);
        t.end();
    });

    t.test('dispatch method', function(t) {
        var receivedQueue = [];
        var context = new MockNode('body', receivedQueue);
        var dispatcher = new Dispatch(context);
        t.equal(typeof dispatcher.dispatch, 'function', 'dispatcher.dispatch should be a function');
        var node0 = context.addChild(receivedQueue);
        var node1 = context.addChild(receivedQueue);
        var node2 = context.addChild(receivedQueue);
        var node20 = node2.addChild(receivedQueue);
        var node200 = node20.addChild(receivedQueue);
        var node201 = node20.addChild(receivedQueue);
        dispatcher.dispatch('click', {
            x: 1,
            y: 2
        });

        t.equal(receivedQueue[0], context, 'dispatcher.dispatch should perform breadth-first search');
        t.equal(receivedQueue[1], node0, 'dispatcher.dispatch should perform breadth-first search');
        t.equal(receivedQueue[2], node1, 'dispatcher.dispatch should perform breadth-first search');
        t.equal(receivedQueue[3], node2, 'dispatcher.dispatch should perform breadth-first search');
        t.equal(receivedQueue[4], node20, 'dispatcher.dispatch should perform breadth-first search');
        t.equal(receivedQueue[5], node200, 'dispatcher.dispatch should perform breadth-first search');
        t.equal(receivedQueue[6], node201, 'dispatcher.dispatch should perform breadth-first search');

        t.end();
    });

    t.test('dispatchUIEvent method', function(t) {
        var receivedQueue = [];
        var context = new MockNode('body', receivedQueue);
        var node0 = context.addChild(receivedQueue);
        var node1 = context.addChild(receivedQueue);
        var node00 = node0.addChild(receivedQueue);
        var node001 = node00.addChild(receivedQueue);
        var node01 = node0.addChild(receivedQueue);
        var clickEv = {};
        var dispatcher = new Dispatch(context);
        dispatcher.dispatchUIEvent('body/0', 'click', clickEv);

        t.equal(receivedQueue[0], node0, 'dispatcher.dispatch should bubble events up to parent (upwards)');
        t.equal(receivedQueue[1], context, 'dispatcher.dispatch should bubble events up to parent (upwards)');
        t.equal(receivedQueue.length, 2, 'dispatcher.dispatch should bubble events up to parent (upwards)');
        t.end();
    });
});

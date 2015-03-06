'use strict';

function _identity(input) {
    return input;
}

global.document = {
    createDocumentFragment: _identity,
    createElement: function(nodeName) {
        return {
            nodeName: nodeName,
            style: {}
        };
    }
};

var test = require('tape');
var ElementAllocator = require('../src/ElementAllocator');

test('ElementAllocator', function(t) {
    t.test('constructor without passed in container', function(t) {
        t.plan(1);
        global.document.createDocumentFragment = function() {
            t.pass('ElementAllocator container should default to new document fragment');
        };
        new ElementAllocator();
        global.document.createDocumentFragment = _identity;
    });

    t.test('constructor with passed in container', function(t) {
        t.plan(1);
        global.document.createDocumentFragment = function() {
            t.fail('ElementAllocator container should use passed in container if available');
        };
        t.doesNotThrow(function() {
            new ElementAllocator({});
        });
        global.document.createDocumentFragment = _identity; 
    });

    t.test('allocate method', function(t) {
        t.plan(3);
        var elementAllocator = new ElementAllocator({
            appendChild: function(element) {
                t.equal(element.nodeName, 'div', 'elementAllocator.allocate should not be case sensitive');
            }
        });
        t.equal(typeof elementAllocator.allocate, 'function', 'elemenAllocator.allocate should be a function');
        elementAllocator.allocate('div');
        elementAllocator.allocate('DIV');
    });

    t.test('deallocate method', function(t) {
        t.plan(3);
        var elementAllocator = new ElementAllocator({
            appendChild: _identity
        });
        t.equal(typeof elementAllocator.deallocate, 'function', 'elemenAllocator.deallocate should be a function');

        var el1 = elementAllocator.allocate('div');
        var el2 = elementAllocator.allocate('div');
        elementAllocator.deallocate(el1);
        elementAllocator.deallocate(el2);

        t.equal(elementAllocator.allocate('div'), el2);
        t.equal(elementAllocator.allocate('div'), el1);
    });

    t.test('getNodeCount method', function(t) {
        t.plan(1);
        var elementAllocator = new ElementAllocator({});
        t.equal(typeof elementAllocator.getNodeCount, 'function', 'elemenAllocator.getNodeCount should be a function');
    });

    t.test('setContainer method', function(t) {
        t.plan(2);

        var previousContainerChildren = [];
        var elementAllocator = new ElementAllocator({
            appendChild: function(element) {
                previousContainerChildren.push(element);
            }
        });
        t.equal(typeof elementAllocator.setContainer, 'function', 'elemenAllocator.setContainer should be a function');

        var el1 = elementAllocator.allocate('div');
        var el2 = elementAllocator.allocate('div');

        elementAllocator.deallocate(el1);
        elementAllocator.deallocate(el2);

        var newContainerChildren = [];
        elementAllocator.setContainer({
            appendChild: function(element) {
                newContainerChildren.push(element);
            }
        });

        t.deepEqual(previousContainerChildren, newContainerChildren, 'elementAllocator.setContainer should transfer deallocated elements to new container');
    });

    t.test('getContainer method', function(t) {
        t.plan(2);
        var container = {};
        var elementAllocator = new ElementAllocator(container);
        t.equal(typeof elementAllocator.getContainer, 'function', 'elemenAllocator.getContainer should be a function');
        t.equal(elementAllocator.getContainer(), container);
    });
});

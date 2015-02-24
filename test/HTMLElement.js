'use strict';

var test = require('tape');
var HTMLElement = require('../src/HTMLElement');
var MockDispatch = require('./MockDispatch');

test('HTMLElement', function(t) {
    t.test('contructor', function(t) {
        var mockDispatch = new MockDispatch();
        t.doesNotThrow(function() {
            new HTMLElement(mockDispatch);
        });
        t.end();
    });

    t.test('init method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.init, 'function', 'htmlElement.init should be a function');
    });

    t.test('clean method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.clean, 'function', 'htmlElement.clean should be a function');
    });

    t.test('_receiveTransformChange method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement._receiveTransformChange, 'function', 'htmlElement._receiveTransformChange should be a function');
    });

    t.test('_receiveSizeChange method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement._receiveSizeChange, 'function', 'htmlElement._receiveSizeChange should be a function');
    });

    t.test('_receiveOriginChange method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement._receiveOriginChange, 'function', 'htmlElement._receiveOriginChange should be a function');
    });

    t.test('_receiveOpacityChange method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement._receiveOpacityChange, 'function', 'htmlElement._receiveOpacityChange should be a function');
    });

    t.test('getSize method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.getSize, 'function', 'htmlElement.getSize should be a function');
    });

    t.test('on method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.on, 'function', 'htmlElement.on should be a function');
    });

    t.test('property method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.property, 'function', 'htmlElement.property should be a function');
    });

    t.test('trueSize method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.trueSize, 'function', 'htmlElement.trueSize should be a function');
    });

    t.test('tagName method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.tagName, 'function', 'htmlElement.tagName should be a function');
    });

    t.test('attribute method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.attribute, 'function', 'htmlElement.attribute should be a function');
    });

    t.test('cssClass method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.cssClass, 'function', 'htmlElement.cssClass should be a function');
    });

    t.test('id method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.id, 'function', 'htmlElement.id should be a function');
    });

    t.test('content method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.content, 'function', 'htmlElement.content should be a function');
    });

    t.test('get method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.get, 'function', 'htmlElement.get should be a function');
    });

    t.test('eventListener method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.eventListener, 'function', 'htmlElement.eventListener should be a function');
    });

    t.test('isRenderable method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.isRenderable, 'function', 'htmlElement.isRenderable should be a function');
    });

    t.test('clear method', function(t) {
        t.plan(1);
        var mockDispatch = new MockDispatch();
        var htmlElement = new HTMLElement(mockDispatch);
        t.equal(typeof htmlElement.clear, 'function', 'htmlElement.clear should be a function');
    });
});

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var test = require('tape');
var DOMElement = require('../DOMElement');


var IDENT = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

function createMockNode() {
    return {
        sentDrawCommands: [],
        sendDrawCommand: function(command) {
            this.sentDrawCommands.push(command);
        },
        shown: true,
        isShown: function() {
            return this.shown;
        },
        addedComponent: false,
        addComponent: function() {
            this.addedComponent = true;
        },
        location: 'body/0',
        getLocation: function() {
            return this.location;
        },
        transform: IDENT,
        getTransform: function() {
            return this.transform;
        },
        requestedUpdate: false,
        requestUpdate: function() {
            this.requestedUpdate = true;
        },
        size: [0, 0, 0],
        getSize: function() {
            return this.size;
        },
        sizeMode: [0, 0, 0],
        getSizeMode: function() {
            return this.sizeMode;
        },
        uiEvents: [],
        getUIEvents: function() {
            return this.uiEvents;
        },
        opacity: 1,
        getOpacity: function() {
            return this.opacity;
        }
    };
}

function createMountedDOMElement() {
    var node = createMockNode();
    var domElement = new DOMElement(node);
    domElement.onMount(node, 0);
    domElement.onUpdate();
    node.sentDrawCommands.length = 0;
    return domElement;
}

test('DOMElement', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof DOMElement, 'function', 'DOMElement should be a constructor function');

        t.doesNotThrow(function() {
            new DOMElement();
        }, 'DOMElement constructor should not throw an error when being invoked without a node');

        var addedComponent;

        var component = new DOMElement({
            addComponent: function(actualComponent) {
                addedComponent = actualComponent;
            }
        });

        t.equal(
            addedComponent,
            component,
            'DOMElement should add itself to the passed in node if available'
        );

        t.end();
    });

    t.test('onMount method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.onMount, 'function', 'DOMElement#onMount should be a function');

        t.test('setAttributes', function(t) {
            t.end();
        });

        t.end();
    });

    t.test('getValue method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.getValue, 'function', 'DOMElement#getValue should be a function');

        t.deepEqual(
            domElement.getValue(),
            {
                attributes: {},
                classes: [ 'famous-dom-element' ],
                content: '',
                cutout: true,
                id: undefined,
                properties: {},
                renderSize: { 0: 0, 1: 0 },
                styles: {},
                tagName: 'DIV'
            },
            'DOMElement#getValue should return correct spec for untouched DOMElement'
        );

        domElement.setAttribute('attribute-key', 'attribute-value');
        domElement.addClass('some-class');
        domElement.setContent('some content');
        domElement.setCutoutState(true);
        domElement.setId('some-id');
        domElement.setProperty('border-radius', '3px');

        t.deepEqual(
            domElement.getValue(),
            {
                attributes: {
                    'attribute-key': 'attribute-value',
                    id: 'some-id'
                },
                classes: [ 'famous-dom-element', 'some-class' ],
                content: 'some content',
                cutout: true,
                id: 'some-id',
                properties: {
                    'border-radius': '3px'
                },
                renderSize: { 0: 0, 1: 0 },
                styles: {
                    'border-radius': '3px'
                },
                tagName: 'DIV'
            },
            'DOMElement#getValue should return correct spec for untouched DOMElement'
        );

        t.end();
    });

    t.test('onUpdate method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.onUpdate, 'function', 'DOMElement#onUpdate should be a function');

        domElement.onUpdate();

        var node = createMockNode();

        domElement.onMount(node, 0);

        // TRANSFORM is being sent immediately.
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();

        // tested in onMount
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();

        t.equal(node.sentDrawCommands.length, 0, 'DOMElement#onUpdate should only send draw commands if queue is not empty');

        t.end();
    });

    t.test('onMount method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.onMount, 'function', 'DOMElement#onMount should be a function');

        var node = createMockNode();
        node.location = 'body/1/2/3';

        domElement.onMount(node, 1);

        t.deepEqual(
            node.sentDrawCommands,
            [
                'WITH', node.location,
                'INIT_DOM', 'DIV',
                'ADD_CLASS', 'famous-dom-element',
                'CHANGE_ATTRIBUTE', 'data-fa-path', node.location,
                'CHANGE_SIZE', 0, 0,
                'CHANGE_PROPERTY', 'opacity', 1,
                'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
            ],
            'DOMElement should send draw commands onMount'
        );

        t.end();
    });

    t.test('onDismount method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.onDismount, 'function', 'DOMElement#onDismount should be a function');

        t.end();
    });

    t.test('onShow method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.onShow, 'function', 'DOMElement#onShow should be a function');

        domElement.onShow();
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_PROPERTY', 'display', 'block' ]
        );

        t.end();
    });

    t.test('onHide method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.onHide, 'function', 'DOMElement#onHide should be a function');

        domElement.onHide();
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_PROPERTY', 'display', 'none' ]
        );

        t.end();
    });

    t.test('setCutoutState method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.setCutoutState, 'function', 'DOMElement#setCutoutState should be a function');

        domElement.setCutoutState(false);
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'GL_CUTOUT_STATE', false ]
        );

        domElement._node.sentDrawCommands.length = 0;

        domElement.setCutoutState(true);
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'GL_CUTOUT_STATE', true ]
        );

        t.end();
    });

    t.test('onTransformChange method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.onTransformChange, 'function', 'DOMElement#onTransformChange should be a function');

        domElement.onTransformChange([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_TRANSFORM', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ]
        );

        t.end();
    });

    t.test('onSizeChange method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.onSizeChange, 'function', 'DOMElement#onSizeChange should be a function');

        // RENDER_SIZE
        domElement._node.sizeMode = [2, 1, 2];

        domElement.onSizeChange([100, 200, 300]);

        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_SIZE', false, 200 ],
            'DOMElement#onSizeChange should send false as size if render sized'
        );

        t.end();
    });

    t.test('onOpacityChange method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.onOpacityChange, 'function', 'DOMElement#onOpacityChange should be a function');

        domElement.onOpacityChange(0.5);
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_PROPERTY', 'opacity', 0.5 ],
            'DOMElement#onOpacityChange should send correct draw commands'
        );

        t.end();
    });

    t.test('onAddUIEvent method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.onAddUIEvent, 'function', 'DOMElement#onAddUIEvent should be a function');

        domElement.onAddUIEvent('click');
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'SUBSCRIBE', 'click', true ],
            'DOMElement#onAddUIEvent should send correct SUBSCRIBE command'
        );

        t.end();
    });

    t.test('_subscribe method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement._subscribe, 'function', 'DOMElement#_subscribe should be a function');

        t.end();
    });

    t.test('onSizeModeChange method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.onSizeModeChange, 'function', 'DOMElement#onSizeModeChange should be a function');

        t.end();
    });

    t.test('getRenderSize method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.getRenderSize, 'function', 'DOMElement#getRenderSize should be a function');

        t.end();
    });

    t.test('_requestUpdate method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement._requestUpdate, 'function', 'DOMElement#_requestUpdate should be a function');

        t.end();
    });

    t.test('setId method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.setId, 'function', 'DOMElement#setId should be a function');

        t.end();
    });

    t.test('addClass method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.addClass, 'function', 'DOMElement#addClass should be a function');

        t.end();
    });

    t.test('removeClass method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.removeClass, 'function', 'DOMElement#removeClass should be a function');

        t.end();
    });

    t.test('getClasses method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.getClasses, 'function', 'DOMElement#getClasses should be a function');

        t.end();
    });

    t.test('hasClass method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.hasClass, 'function', 'DOMElement#hasClass should be a function');

        t.end();
    });

    t.test('setAttribute method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.setAttribute, 'function', 'DOMElement#setAttribute should be a function');

        domElement.setAttribute('attr', 'hello');
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_ATTRIBUTE', 'attr', 'hello' ],
            'DOMElement#setAttribute should send correct draw commands'
        );

        t.end();
    });

    t.test('getAttribute method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.getAttribute, 'function', 'DOMElement#getAttribute should be a function');

        domElement.setAttribute('attr', 'test');
        t.equal(domElement.getAttribute('attr'), 'test', 'DOMElement#getAttribute should return correct value when DOMElement is not mounted');

        t.end();
    });

    t.test('setProperty method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.setProperty, 'function', 'DOMElement#setProperty should be a function');

        domElement.setProperty('background', 'red');
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_PROPERTY', 'background', 'red' ],
            'DOMElement#setProperty should send correct draw commands'
        );

        t.end();
    });

    t.test('getProperty method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.getProperty, 'function', 'DOMElement#getProperty should be a function');

        domElement.setProperty('background', 'blue');
        t.equal(domElement.getProperty('background'), 'blue', 'DOMElement#getProperty should return correct value when DOMElement is not mounted');

        t.end();
    });

    t.test('setContent method', function(t) {
        var domElement = createMountedDOMElement();

        t.equal(typeof domElement.setContent, 'function', 'DOMElement#setContent should be a function');

        domElement.setContent('hello world');
        domElement.onUpdate();

        t.deepEqual(
            domElement._node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_CONTENT', 'hello world' ],
            'DOMElement#setContent should send correct draw commands'
        );

        t.end();
    });

    t.test('getContent method', function(t) {
        var domElement = new DOMElement();

        t.equal(typeof domElement.getContent, 'function', 'DOMElement#getContent should be a function');
        t.equal(domElement.getContent(), '', 'DOMElement#getContent should return empty string by default');

        domElement.setContent('hello world');
        t.equal(domElement.getContent(), 'hello world', 'DOMElement#getContent should return correct content for DOMElement of dismounted nodes');

        t.end();
    });

    t.test('on method', function(t) {
        t.plan(2);

        var domElement = new DOMElement();

        t.equal(typeof domElement.on, 'function', 'DOMElement#on should be a function');

        var testPayload = {};

        domElement.on('test-event', function(actualPayload) {
            t.equal(actualPayload, testPayload, 'DOMElement should emit received payload');
        });

        domElement._callbackStore.trigger('test-event', testPayload);
    });

    t.test('onReceive method', function(t) {
        t.plan(4);

        var domElement = new DOMElement();

        t.equal(typeof domElement.onReceive, 'function', 'DOMElement#onReceive should be a function');

        var testPayload = {};

        domElement.on('test-event', function(actualPayload) {
            t.equal(actualPayload, testPayload, 'DOMElement should emit received payload');
        });

        domElement.onReceive('test-event', testPayload);

        var resizePayload = {
            val: [100, 200]
        };

        domElement.on('resize', function(actualPayload) {
            t.equal(actualPayload, resizePayload, 'DOMElement should emit received payload');
        });

        domElement.onReceive('resize', resizePayload);

        t.deepEqual(domElement.getValue().renderSize, [100, 200]);
    });
});

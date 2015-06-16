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
var DOMElement = require('../DOMElement.js');

var IDENT = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

function createMockNode(t) {
    return {
        sentDrawCommands: [],
        sendDrawCommand: function(command) {
            this.sentDrawCommands.push(command);
        },
        shown: true,
        isShown: function() {
            return this.shown;
        },
        addComponent: function() {
            t.pass('should add itself as a component using addComponent');
        },
        location: 'body/0',
        getLocation: function() {
            return this.location;
        },
        transform: IDENT,
        getTransform: function() {
            return this.transform;
        },
        requestUpdate: function() {
            t.pass('should requestUpdate after onMount');
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

test('DOMElement', function(t) {
    t.test('constructor (default options)', function(t) {
        t.equal(typeof DOMElement, 'function', 'DOMElement should be a constructor function');

        t.end();
    });

    t.test('constructor (default options)', function(t) {
        t.comment(
            'Passing in an initial set of properties, attributes and a ' +
            'tagName should result into appropriate commands being enqueued'
        );

        t.end();
    });

    t.test('should get initial spec from node', function(t) {
        /*
        var node = createMockNode(t);

        node.sentDrawCommands = ['EXISTING', 'DRAW', 'COMMANDS'];
        node.shown = false;
        node.location = 'body/4/45/4/5';
        node.transform = [
            0.5, 0, 0, 0,
            0, 0.5, 0, 0,
            0, 0, 0.5, 0,
            0, 0, 0, 0.5
        ];
        node.size = [100, 200, 300];
        node.sizeMode = [1, 1, 1];
        node.uiEvents = [];
        node.opacity = 0.4;

        var domElement = new DOMElement(node);
        domElement.onMount(node, 3);

        t.deepEqual(
            node.sentDrawCommands,
            [ 'EXISTING', 'DRAW', 'COMMANDS', 'WITH', 'body/4/45/4/5', 'INIT_DOM', 'div', 'CHANGE_TRANSFORM', 0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5 ],
            'should sendDrawCommands after initial onUpdate after when ' +
            'mounted using onMount. Should have used Node spec.'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            'should send initial styles on first update. Should take into ' +
            'account size, UI Events etc. from Node'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [],
            'should not send any draw commands after inital update'
        );
        */

        t.end();
    });

    t.test('onMount, onUpdate, onDismount lifecyle', function(t) {
        // t.plan(12);

        /*
        var node = createMockNode(t);
        var domElement = new DOMElement(node);

        t.equal(typeof domElement.onMount, 'function', 'domElement.onMount should be a function');
        t.equal(typeof domElement.onUpdate, 'function', 'domElement.onUpdate should be a function');
        t.equal(typeof domElement.onDismount, 'function', 'domElement.onDismount should be a function');

        t.deepEqual(
            node.sentDrawCommands,
            [],
            'DOMElement should not send any draw commands before being mounted'
        );

        domElement.onMount(node, 0);
        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'INIT_DOM', 'div', 'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
            'DOMElement should send initial set of draw commands once mounted'
        );

        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'INIT_DOM', 'div', 'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 'WITH', 'body/0', 'CHANGE_SIZE', 0, 0, 'ADD_CLASS', 'famous-dom-element', 'CHANGE_PROPERTY', 'display', 'none', 'CHANGE_PROPERTY', 'opacity', 1, 'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0' ],
            'Updateing the node should result into appropriate draw commands ' +
            'being appended to the command queue'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/3', 'DOM', 'CHANGE_SIZE', 0, 0, 'CHANGE_PROPERTY', 'display', true, 'CHANGE_PROPERTY', 'opacity', 1, 'CHANGE_PROPERTY', 'position', 'absolute', 'CHANGE_PROPERTY', '-webkit-transform-origin', '0% 0%', 'CHANGE_PROPERTY', 'transform-origin', '0% 0%', 'CHANGE_PROPERTY', '-webkit-backface-visibility', 'visible', 'CHANGE_PROPERTY', 'backface-visibility', 'visible', 'CHANGE_PROPERTY', '-webkit-transform-style', 'preserve-3d', 'CHANGE_PROPERTY', 'transform-style', 'preserve-3d', 'CHANGE_PROPERTY', '-webkit-tap-highlight-color', 'transparent', 'CHANGE_PROPERTY', 'pointer-events', 'auto', 'CHANGE_PROPERTY', 'z-index', '1', 'CHANGE_PROPERTY', 'box-sizing', 'border-box', 'CHANGE_PROPERTY', '-moz-box-sizing', 'border-box', 'CHANGE_PROPERTY', '-webkit-box-sizing', 'border-box', 'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0' ],
            'should send initial styles on first update'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_ATTRIBUTE', 'data-fa-path', '', 'GL_CUTOUT_STATE', false],
            'Dismounting the node should result into the DOMElement being ' +
            'hidden'
        );
        */
        t.end();
    });

    t.test('on, onReceive method', function(t) {
        var node = createMockNode(t);
        var domElement = new DOMElement(node);

        t.equal(
            typeof domElement.on,
            'function',
            'domElement.on should be a function'
        );

        t.equal(
            typeof domElement.onReceive,
            'function',
            'domElement.onReceive should be a function'
        );

        var actualEvent = {};

        domElement.on('some event', function(receivedEvent) {
            t.equal(
                receivedEvent,
                actualEvent,
                'DOMElement should receive event payload of type "some event"'
            );
        });

        domElement.onReceive('some event', actualEvent);
        t.end();
    });

    t.test('setContent method', function(t) {
        var node = createMockNode(t);
        var domElement = new DOMElement(node);
        t.equal(
            typeof domElement.setContent,
            'function',
            'domElement.setContent should be a function'
        );

        // domElement.onMount(node, 0);
        t.doesNotThrow(function() {
            domElement.setContent('some content');    
        }, 'should not error when passed a String');
        
        t.end();
    });

    t.test('setProperty method', function (t) {
        var node = createMockNode(t);
        var domElement = new DOMElement(node);
        t.equal(
            typeof domElement.setProperty,
            'function',
            'domElement.setProperty should be a function'
        );

        t.doesNotThrow(function() {
            domElement.setProperty('background', 'red');
        }, 'should not fail when passed a key value pair');

        t.end();
    });
});

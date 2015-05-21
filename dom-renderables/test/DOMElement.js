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
        t.plan(7);

        t.equal(typeof DOMElement, 'function', 'DOMElement should be a constructor function');

        var node = createMockNode(t);
        var domElement = new DOMElement(node);
        domElement.onMount(node, 0);

        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'INIT_DOM', 'div', 'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
            'should sendDrawCommands after initial onUpdate after when ' +
            'mounted using onMount'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_SIZE', 0, 0, 'ADD_CLASS', 'famous-dom-element', 'CHANGE_PROPERTY', 'display', 'none', 'CHANGE_PROPERTY', 'opacity', 1, 'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0' ],
            'should send initial styles on first update'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [],
            'should not send any draw commands after inital update'
        );
    });

    t.test('constructor (default options)', function(t) {
        t.comment(
            'Passing in an initial set of properties, attributes and a ' +
            'tagName should result into appropriate commands being enqueued'
        );

        t.plan(6);

        var node = createMockNode(t);
        var domElement = new DOMElement(node, {
            tagName: 'section',
            properties: {
                background: 'red',
                color: 'green'
            },
            attributes: {
                title: 'some title'
            },
            classes: ['some-class'],
            content: '<div>Test</div>'
        });
        domElement.onMount(node, 0);

        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'INIT_DOM', 'section', 'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
            'should sendDrawCommands after initial onUpdate after when ' +
            'mounted using onMount'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_SIZE', 0, 0, 'ADD_CLASS', 'famous-dom-element', 'ADD_CLASS', 'some-class', 'CHANGE_CONTENT', '<div>Test</div>', 'CHANGE_PROPERTY', 'display', 'none', 'CHANGE_PROPERTY', 'opacity', 1, 'CHANGE_PROPERTY', 'background', 'red', 'CHANGE_PROPERTY', 'color', 'green', 'CHANGE_ATTRIBUTE', 'title', 'some title', 'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0' ],
            'should send initial styles on first update'
        );
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [],
            'should not send any draw commands after inital update'
        );
    });

    t.test('should get initial spec from node', function(t) {
        t.plan(6);

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
            [ 'WITH', 'body/4/45/4/5', 'CHANGE_SIZE', 100, 200, 'ADD_CLASS', 'famous-dom-element', 'CHANGE_PROPERTY', 'display', 'block', 'CHANGE_PROPERTY', 'opacity', 0.4, 'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/4/45/4/5' ],
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
    });

    t.test('onMount, onUpdate, onDismount lifecyle', function(t) {
        t.plan(11);

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
        t.deepEqual(node.sentDrawCommands, []);

        domElement.onDismount();
        domElement.onUpdate();
        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'CHANGE_ATTRIBUTE', 'data-fa-path', '' ],
            'Dismounting the node should result into the DOMElement being ' +
            'hidden'
        );
    });

    t.test('on, onReceive method', function(t) {
        t.plan(5);

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
    });

    t.test('setContent method', function(t) {
        t.plan(5);

        var node = createMockNode(t);
        var domElement = new DOMElement(node);
        t.equal(
            typeof domElement.setContent,
            'function',
            'domElement.setContent should be a function'
        );

        domElement.onMount(node, 0);
        domElement.setContent('some content');
        domElement.onUpdate(1);
        t.deepEqual(
            node.sentDrawCommands.slice(node.sentDrawCommands.length - 2),
            ['CHANGE_CONTENT', 'some content' ],
            'should issue CHANGE_CONTENT command'
        );

        node.sentDrawCommands.length = 0;
    });

    t.test('setProperty method', function (t) {
        t.plan(5);

        var node = createMockNode(t);
        var domElement = new DOMElement(node);
        t.equal(
            typeof domElement.setProperty,
            'function',
            'domElement.setProperty should be a function'
        );

        domElement.onMount(node, 0);
        domElement.setProperty('background', 'red');
        domElement.onUpdate(1);

        // TODO
        // Properties are being read from an object. We can't make any
        // assumptions about the order in which commands are being added to the
        // command queue.

        t.deepEqual(
            node.sentDrawCommands,
            [ 'WITH', 'body/0', 'INIT_DOM', 'div', 'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 'WITH', 'body/0', 'CHANGE_SIZE', 0, 0, 'ADD_CLASS', 'famous-dom-element', 'CHANGE_PROPERTY', 'display', 'none', 'CHANGE_PROPERTY', 'opacity', 1, 'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0', 'CHANGE_PROPERTY', 'background', 'red' ],
            'should issue CHANGE_PROPERTY command'
        );
    });
});

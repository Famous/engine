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

function identity(value) {
    return function() {
        return value;
    };
}

function createMockNode(t) {
    return {
        sentDrawCommands: [],
        sendDrawCommand: function(command) {
            this.sentDrawCommands.push(command);
        },
        isShown: identity(true),
        addComponent: function() {
            t.pass('should add itself as a component using addComponent');
        },
        getLocation: identity('body/0'),
        getTransform: identity(IDENT),
        requestUpdate: function() {
            t.pass('should requestUpdate after onMount');
        },
        getSize: identity([0, 0, 0]),
        getSizeMode: identity([0, 0, 0])
    };
}

test('DOMElement', function(t) {
    t.test('constructor (default options)', function(t) {
        t.plan(6);

        t.equal(typeof DOMElement, 'function', 'DOMElement should be a constructor function');

        var node = createMockNode(t);
        var domElement = new DOMElement(node);
        domElement.onMount(node, 0);

        t.deepEqual(node.sentDrawCommands, []);
        domElement.onUpdate();
        t.deepEqual(node.sentDrawCommands, [
            'WITH', 'body/0',
            'DOM',
            'INIT_DOM', 'div',
            'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            'CHANGE_SIZE', 0, 0,
            'ADD_CLASS', 'fa-surface',
            'CHANGE_CONTENT', '',
            'CHANGE_PROPERTY', 'display', true,
            'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0'
        ], 'should sendDrawCommands after initial onUpdate after when mounted using onMount');
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(node.sentDrawCommands, [], 'should not send any draw commands after inital update');
    });
    
    t.test('constructor (custom options), getValue method', function(t) {
        t.plan(6);

        var node = {
            sentDrawCommands: [],
            sendDrawCommand: function(command) {
                this.sentDrawCommands.push(command);
            },
            isShown: identity(false),
            addComponent: function() {
                t.pass('should add itself as a component using addComponent');
            },
            getLocation: identity('body/0/1/2'),
            getTransform: identity([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                50, 100, 0, 1
            ]),
            requestUpdate: function() {
                t.pass('should requestUpdate after onMount');
            },
            getSize: identity([50, 100, 200]),
            getSizeMode: identity([2, 2, 2])
        };
        var options = {
            properties: {
                background: 'red',
                'font-family': 'Helvetica'
            },
            attributes: {
                href: 'http://famo.us'
            },
            id: 'link',
            tagName: 'a',
            content: 'famo.us',
            classes: ['red-background']
        };
        var domElement = new DOMElement(node, options);
        domElement.onMount(node, 0);

        t.deepEqual(node.sentDrawCommands, []);
        domElement.onUpdate();
        t.deepEqual(node.sentDrawCommands, [
            'WITH', 'body/0/1/2',
            'DOM',
            'INIT_DOM', 'a',
            'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 50, 100, 0, 1,
            'CHANGE_SIZE', false, false,
            'ADD_CLASS', 'fa-surface',
            'ADD_CLASS', 'red-background',
            'CHANGE_CONTENT', 'famo.us',
            'CHANGE_PROPERTY', 'background', 'red',
            'CHANGE_PROPERTY', 'font-family', 'Helvetica',
            'CHANGE_ATTRIBUTE', 'href', 'http://famo.us',
            'CHANGE_ATTRIBUTE', 'id', 'link',
            'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0/1/2'
        ], 'should sendDrawCommands after initial onUpdate after when mounted using onMount');
        node.sentDrawCommands.length = 0;
        domElement.onUpdate();
        t.deepEqual(node.sentDrawCommands, [], 'should not send any draw commands after inital update'); 

        t.deepEqual(domElement.getValue(), {
            attributes: {
                'data-fa-path': 'body/0/1/2',
                href: 'http://famo.us',
                id: 'link'
            },
            classes: [
                'fa-surface',
                'red-background'
            ],
            content: 'famo.us',
            styles: {
                background: 'red',
                display: false,
                'font-family': 'Helvetica'
            }
        });
    });

    t.test('onMount, onUpdate, onDismount lifecyle', function(t) {
        t.plan(10);

        var node = createMockNode(t);
        var domElement = new DOMElement(node);

        t.equal(typeof domElement.onMount, 'function', 'domElement.onMount should be a function');
        t.equal(typeof domElement.onUpdate, 'function', 'domElement.onUpdate should be a function');
        t.equal(typeof domElement.onDismount, 'function', 'domElement.onDismount should be a function');

        domElement.onMount(node, 0);
        t.deepEqual(node.sentDrawCommands, []);
        
        domElement.onUpdate();
        t.deepEqual(node.sentDrawCommands, [
            'WITH', 'body/0',
            'DOM',
            'INIT_DOM', 'div',
            'CHANGE_TRANSFORM', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            'CHANGE_SIZE', 0, 0,
            'ADD_CLASS', 'fa-surface',
            'CHANGE_CONTENT', '',
            'CHANGE_PROPERTY', 'display', true,
            'CHANGE_ATTRIBUTE', 'data-fa-path', 'body/0'
        ]);
        node.sentDrawCommands.length = 0;

        domElement.onUpdate();
        t.deepEqual(node.sentDrawCommands, []);

        domElement.onDismount();
        domElement.onUpdate();
        t.deepEqual(node.sentDrawCommands, [
            'WITH', 'body/0',
            'DOM',
            'CHANGE_PROPERTY',
            'display', 'none',
            'CHANGE_ATTRIBUTE', 'data-fa-path', ''
        ]);
    });

    t.test('on, onReceive method', function(t) {
        t.plan(4);

        var node = createMockNode(t);
        var domElement = new DOMElement(node);

        t.equal(typeof domElement.on, 'function', 'domElement.on should be a function');
        t.equal(typeof domElement.onReceive, 'function', 'domElement.onReceive should be a function');

        var actualEvent = {};

        domElement.on('some event', function(receivedEvent) {
            t.equal(receivedEvent, actualEvent);
        });

        domElement.onReceive('some event', actualEvent);
    });
});

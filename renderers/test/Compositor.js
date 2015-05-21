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
var Compositor = require('../Compositor');
var Context = require('../Context');

var elOne = document.createElement('div');
    elOne.id = 'one';
var elTwo = document.createElement('div');
    elTwo.id = 'two';
var elThree = document.createElement('div');
    elThree.id = 'three';

document.body.appendChild(elOne);
document.body.appendChild(elTwo);
document.body.appendChild(elThree);

test('Compositor', function(t) {
    t.test('constructor', function(t) {
        var compositor = new Compositor();

        t.ok(compositor._contexts, 'Should have an _contexts property');
        t.ok(compositor._outCommands, 'Should have an _outCommands property');
        t.ok(compositor._inCommands, 'Should have an _inCommands property');

        t.end();
    });

    t.test('sendEvent method', function(t) {
        var compositor = new Compositor();

        var eventPayload = {};
        var path = 'body/1/2/3';
        var eventName = 'click';

        compositor.sendEvent(path, eventName, eventPayload);

        shouldInclude(compositor._outCommands, t, 'WITH');
        shouldInclude(compositor._outCommands, t, path);
        shouldInclude(compositor._outCommands, t, 'TRIGGER');
        shouldInclude(compositor._outCommands, t, eventName);
        shouldInclude(compositor._outCommands, t, eventPayload);

        t.end();
    });

    t.test('handleWith method', function(t) {
        var compositor = new Compositor();
        var path = 'body/1/2/3';
        var wasCalled = false;

        compositor._inCommands.push(path);
        compositor._contexts.body = new Context('body', compositor);
        compositor._contexts.body.receive = function() {
            wasCalled = true;
        };
        compositor.handleWith(0, compositor._inCommands);

        t.equals(
            wasCalled,
            true,
            'Should call receive on retreived context'
        );

        t.end();
    });

    t.test('getOrSetContext method', function(t) {
        var compositor = new Compositor();
        var selector = 'body';

        compositor.getOrSetContext(selector);

        t.ok(
            compositor._contexts[selector],
            'Should create a new Context when one does not exist at selector'
        );

        var context = compositor.getOrSetContext(selector);

        t.ok(
            context === compositor._contexts[selector],
            'Should retreive already created context at selector'
        );

        t.end();
    });

    t.test('giveSizeFor method', function(t) {
        var compositor = new Compositor();
        var selector = 'body';

        compositor._inCommands.push(selector);

        t.end();
    });

    t.test('sendResize method', function(t) {
        var compositor = new Compositor();

        var selector = 'body';
        var size = [255, 255];

        compositor.sendResize('body', size);

        shouldInclude(compositor._outCommands, t, 'WITH');
        shouldInclude(compositor._outCommands, t, selector);
        shouldInclude(compositor._outCommands, t, 'TRIGGER');
        shouldInclude(compositor._outCommands, t, 'CONTEXT_RESIZE');
        shouldInclude(compositor._outCommands, t, size);

        t.end();
    });

    t.test('invoke method', function(t) {
        t.end();
    });

    t.test('drawCommands method', function(t) {
        var compositor = new Compositor();

        var paths = ['#one/1/2/3', '#two/1/2/3', '#three/1/2/3'];
        var contexts = [
            compositor.getOrSetContext('#one'),
            compositor.getOrSetContext('#two'),
            compositor.getOrSetContext('#three')
        ];

        var draw = function () {
            this.hasBeenDrawn = true;
        };

        for (var i = 0; i < contexts.length; i++) {
            contexts[i].draw = draw;
        }

        compositor._inCommands.push('WITH', paths[0], 'WITH', paths[1], 'WITH', paths[2]);
        compositor.drawCommands();

        t.ok(
            contexts[0].hasBeenDrawn && contexts[1].hasBeenDrawn && contexts[1].hasBeenDrawn,
            'Should call draw on all registered contexts'
        );

        t.end();
    });

    t.test('receiveCommands method', function(t) {
        var compositor = new Compositor();
        var commands = [1, 2, 3];

        compositor.receiveCommands(commands);

        t.equals(
            compositor._inCommands.length,
            3,
            'Command queue should be correct length'
        );

        shouldInclude(compositor._inCommands, t, 1);
        shouldInclude(compositor._inCommands, t, 2);
        shouldInclude(compositor._inCommands, t, 3);

        t.end();
    });

    t.test('clearCommands method', function(t) {
        var compositor = new Compositor();

        compositor._inCommands = [1, 2, 3];
        compositor._inCommands.index = 2;
        compositor._outCommands = [1, 2, 3];

        compositor.clearCommands();

        t.equals(
            compositor._inCommands.length,
            0,
            'Should clear inCommands'
        );

        t.equals(
            compositor._outCommands.length,
            0,
            'Should clear outCommands'
        );

        t.end();
    });

    t.end();
});

function shouldInclude (arr, t, target) {
    return t.ok(
        ~arr.indexOf(target),
        'Should push a ' + target + ' command to the outCommands array'
    );
}

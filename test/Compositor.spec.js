'use strict';

var test = require('tape');
var Compositor = require('../src/Compositor');
var Context = require('../src/Context');

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

    t.test('Compositor.prototype.sendEvent', function(t) {
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

    t.test('Compositor.prototype.handleWith', function(t) {
        var compositor = new Compositor();
        var path = 'body/1/2/3';
        var wasCalled = false;
        
        compositor._inCommands.push(path);
        compositor._contexts['body'] = new Context('body', compositor);
        compositor._contexts['body'].receive = function() { wasCalled = true; };
        compositor.handleWith(0, compositor._inCommands);

        t.equals(
            wasCalled,
            true,
            'Should call receive on retreived context'
        );

        t.end();
    });

    t.test('Compositor.prototype.getOrSetContext', function(t) {
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

    t.test('Compositor.prototype.giveSizeFor', function(t) {
        var compositor = new Compositor();
        var selector = 'body';

        compositor._inCommands.push(selector);

        t.end();
    });

    t.test('Compositor.prototype.sendResize', function(t) {
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

    t.test('Compositor.prototype._wrapProxyFunction', function(t) {
        var compositor = new Compositor();
        var id = 0;
        var returned = compositor._wrapProxyFunction(id);

        t.equals(
            typeof returned,
            'function',
            'Should return a function.'
        );

        returned(1, 2, 3);

        shouldInclude(compositor._outCommands, t, 'INVOKE');
        shouldInclude(compositor._outCommands, t, id);

        t.end();
    });

    t.test('Compositor.prototype.invoke', function(t) {
        t.end();
    });

    t.test('Compositor.prototype.drawCommands', function(t) {
        var compositor = new Compositor();

        var paths = ['#one/1/2/3', '#two/1/2/3', '#three/1/2/3'];
        var contexts = [
            compositor.getOrSetContext('#one'),
            compositor.getOrSetContext('#two'),
            compositor.getOrSetContext('#three')
        ];

        for (var i = 0; i < contexts.length; i++) {
            contexts[i].draw = function() {
                this.hasBeenDrawn = true;
            }
        }

        compositor._inCommands.push('WITH', paths[0], 'WITH', paths[1], 'WITH', paths[2]);
        compositor.drawCommands();
        
        t.ok(
            contexts[0].hasBeenDrawn && contexts[1].hasBeenDrawn && contexts[1].hasBeenDrawn,
            'Should call draw on all registered contexts'
        );

        t.end();
    });

    t.test('Compositor.prototype.receiveCommands', function(t) {
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

    t.test('Compositor.prototype.clearCommands', function(t) {
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

function shouldInclude (arr, t, target, deep) {
    return t.ok(
        ~arr.indexOf(target),
        'Should push a ' + target + ' command to the outCommands array'
    );
}
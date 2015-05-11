
var Event = require('../Event');
var test = require('tape');

function TestPayload () {
    this.t1 = 5;
    this.t2 = {};
}

test('Event', function (t) {
    t.test('constructor', function (t) {
        t.doesNotThrow(function () {
            new Event();
        }, 'Event should be a constructor');

        var e = new Event();

        t.ok(
            e.propagationStopped != null && e.propagationStopped.constructor === Boolean,
            'Event should have a propagationStopped property that is a boolean'
            );

        t.ok(
            !(e.propagationStopped),
            'The propagationStopped property should be false by default'
            );

        t.ok(
            e.propagationStopped != null && e.stopPropagation.constructor === Function,
            'Event should have a stopPropagation method'
            );

        t.end();
    });

    t.test('stopPropagation method', function (t) {
        var e = new Event();

        t.doesNotThrow(function () {
            new Event().stopPropagation();
        }, 'stopPropagation should call without error');

        e.stopPropagation();

        t.ok(
            e.propagationStopped,
            'calling stopPropagation should set the propagationStopped property to false'
            );

        t.end();
    });

});

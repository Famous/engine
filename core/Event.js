'use strict';

/**
 * The Event class adds the stopPropagation functionality
 * to the UIEvents within the scene graph.
 *
 * @constructor Event
 */
function Event () {
    this.propagationStopped = false;
    this.stopPropagation = stopPropagation;
}

/**
 * stopPropagation ends the bubbling of the event in the
 * scene graph.
 *
 * @method stopPropagation
 */
function stopPropagation () {
    this.propagationStopped = true;
}

module.exports = Event;


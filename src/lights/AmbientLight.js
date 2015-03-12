'use strict';

/**
 * Module dependencies
 */
var Light = require('./Light');


/**
 * AmbientLight Component
 */
var AmbientLight = function AmbientLight(dispatch) {
    Light.call(this, dispatch);

    this.commands = {
        color: 'GL_AMBIENT_LIGHT'
    };
};

AmbientLight.toString = function toString() {
    return 'AmbientLight';
};

AmbientLight.prototype = Object.create(Light.prototype);
AmbientLight.prototype.constructor = AmbientLight;


/**
 * Expose
 */
module.exports = AmbientLight;

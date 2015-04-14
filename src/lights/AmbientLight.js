'use strict';

var Light = require('./Light');


/**
 * AmbientLight extends the functionality of Light. It sets the ambience in
 * the scene. Ambience is a light source that emits light in the entire
 * scene, evenly.
 *
 * @class AmbientLight
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved
 * from the corresponding Render Node
 */
function AmbientLight(node) {
    Light.call(this, node);
    this.commands.color = 'GL_AMBIENT_LIGHT';
};

/**
* Returns the definition of the Class: 'AmbientLight'
*
* @method toString
* @return {string} definition
*/
AmbientLight.toString = function toString() {
    return 'AmbientLight';
};

/**
 * Extends Light constructor
 */
AmbientLight.prototype = Object.create(Light.prototype);

/**
 * Sets AmbientLight as the constructor
 */
AmbientLight.prototype.constructor = AmbientLight;

module.exports = AmbientLight;

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

var Light = require('./Light');
var Color = require('../../utilities/Color');

var ComponentFactory = require('../../components/ComponentFactory');
ComponentFactory.register(AmbientLight);


/**
 * AmbientLight extends the functionality of Light. It sets the ambience in
 * the scene. Ambience is a light source that emits light in the entire
 * scene, evenly.
 *
 * @class AmbientLight
 * @constructor
 * @component
 * @augments Light
 *
 * @param {Node} node LocalDispatch to be retrieved from the corresponding Render Node
 *
 * @return {undefined} undefined
 */
function AmbientLight(node, options) {
    Light.call(this, node, options);
    this.commands.color = 'GL_AMBIENT_LIGHT';
}

/**
 * Extends Light constructor
 */
AmbientLight.prototype = Object.create(Light.prototype);

/**
 * Sets AmbientLight as the constructor
 */
AmbientLight.prototype.constructor = AmbientLight;

/**
 * Serializes the AmbientLight.  This version is intended as a human editable and
 * diff friendly file format.
 *
 * @method serialize
 *
 * @return {Object}     Serialized representation.
 */

AmbientLight.prototype._serialize = function _serialize() {
    var json = { _type:"AmbientLight", _version:1 };
    this._serializeLight(json);
    return json; 
}

/**
 * Deserialize the AmbientLight.
 *
 * @method deserialize
 *
 * @param  {Object} json representation to deserialize
 * @param  {Object} overlayDefaults whether to reset to default values when properties are not provided.
 *                  (Currently unimplemented.)
 *
 * @return {Node} this
 */
AmbientLight.prototype._deserialize = function _deserialize(json, overlayDefaults) {
    if(json._type !== 'AmbientLight' || json._version != 1)
        throw new Error('expected JSON serialized AmbientLight version 1');
    debugger;
    this._deserializeLight(json, overlayDefaults);
}

module.exports = AmbientLight;

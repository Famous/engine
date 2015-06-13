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
ComponentFactory.register(PointLight);

/**
 * PointLight extends the functionality of Light. PointLight is a light source
 * that emits light in all directions from a point in space.
 *
 * @class PointLight
 * @constructor
 * @component
 * @augments Light
 *
 * @param {Node} node LocalDispatch to be retrieved from the corresponding Render Node
 *
 * @return {undefined} undefined
 */
function PointLight(node, options) {
    Light.call(this, node, options);
    this.commands.position = 'GL_LIGHT_POSITION';
    this.onTransformChange(node.getTransform());
}

/**
 * Extends Light constructor
 */
PointLight.prototype = Object.create(Light.prototype);

/**
 * Sets PointLight as the constructor
 */
PointLight.prototype.constructor = PointLight;

/**
 * Receives transform change updates from the scene graph.
 *
 * @private
 *
 * @param {Array} transform Transform matrix
 *
 * @return {undefined} undefined
 */
PointLight.prototype.onTransformChange = function onTransformChange (transform) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this.queue.push(this.commands.position);
    this.queue.push(transform[12]);
    this.queue.push(transform[13]);
    this.queue.push(transform[14]);
};

/**
 * Serializes the PointLight.  This version is intended as a human editable and
 * diff friendly file format.
 *
 * @method serialize
 *
 * @return {Object}     Serialized representation.
 */

PointLight.prototype._serialize = function _serialize() {
    var json = { _type:"PointLight", _version:1 };
    this._serializeLight(json);
    return json; 
}

/**
 * Deserialize the PointLight.
 *
 * @method deserialize
 *
 * @param  {Object} json representation to deserialize
 * @param  {Object} overlayDefaults whether to reset to default values when properties are not provided.
 *                  (Currently unimplemented.)
 *
 * @return {Node} this
 */
PointLight.prototype._deserialize = function _deserialize(json, overlayDefaults) {
    if(json._type !== 'PointLight' || json._version != 1)
        throw new Error('expected JSON serialized PointLight version 1');
    this._deserializeLight(json, overlayDefaults);
}

module.exports = PointLight;

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
function AmbientLight(node) {
    Light.call(this, node);
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

module.exports = AmbientLight;

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

function MockDispatch() {}

MockDispatch.prototype.addRenderable = function addRenderable() {};

MockDispatch.prototype.addComponent = function addComponent() {};

MockDispatch.prototype.getRenderPath = function getRenderPath() {
    return 'body/0/1';
};

MockDispatch.prototype.getContext = function getContext() {
    return {
        _origin: [50, 50, 50],
        _opacity: { value: 1 },
        _size: {
            getTopDownSize: function() {
                return [100, 100, 100];
            }
        },
        _transform: {
            _matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        }
    };
};

MockDispatch.prototype.sendDrawCommand = function sendDrawCommand() {
    return this;
};

MockDispatch.prototype.dirtyRenderable = function dirtyRenderable() {};

MockDispatch.prototype.dirtyComponent = function dirtyComponent() {};

MockDispatch.prototype.onTransformChange = function onTransformChange() {};

MockDispatch.prototype.onSizeChange = function onSizeChange() {};

MockDispatch.prototype.onOpacityChange = function onOpacityChange() {};

MockDispatch.prototype.onOriginChange = function onOriginChange() {};

MockDispatch.prototype.requestUpdate = function() {};
MockDispatch.prototype.getTransform = function() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

module.exports = MockDispatch;

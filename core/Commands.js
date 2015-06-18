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

/**
 * An enumeration of the commands in our command queue.
 */
var Commands = {
    INIT_DOM: 0,
    DOM_RENDER_SIZE: 1,
    CHANGE_TRANSFORM: 2,
    CHANGE_SIZE: 3,
    CHANGE_PROPERTY: 4,
    CHANGE_CONTENT: 5,
    CHANGE_ATTRIBUTE: 6,
    ADD_CLASS: 7,
    REMOVE_CLASS: 8,
    SUBSCRIBE: 9,
    GL_SET_DRAW_OPTIONS: 10,
    GL_AMBIENT_LIGHT: 11,
    GL_LIGHT_POSITION: 12,
    GL_LIGHT_COLOR: 13,
    MATERIAL_INPUT: 14,
    GL_SET_GEOMETRY: 15,
    GL_UNIFORMS: 16,
    GL_BUFFER_DATA: 17,
    GL_CUTOUT_STATE: 18,
    GL_MESH_VISIBILITY: 19,
    GL_REMOVE_MESH: 20,
    PINHOLE_PROJECTION: 21,
    ORTHOGRAPHIC_PROJECTION: 22,
    CHANGE_VIEW_TRANSFORM: 23,
    WITH: 24,
    FRAME: 25,
    ENGINE: 26,
    START: 27,
    STOP: 28,
    TIME: 29,
    TRIGGER: 30,
    NEED_SIZE_FOR: 31,
    DOM: 32,
    READY: 33,
    ALLOW_DEFAULT: 34,
    PREVENT_DEFAULT: 35,
    UNSUBSCRIBE: 36,
    prettyPrint: function (buffer, start, finish) {
        var result = '';
        for (var i = start ? start : 0, len = finish ? finish : buffer.length ; i < len ; i++)
            i = commandPrinters[i](buffer, i, result);
        return result;
    }
};

var commandPrinters = [
    function init_dom (buffer, i, result) {
        result += i + '. INIT_DOM\n    tagName: ' + buffer[i + 1] + '\n';
        return i + 1;
    }, function dom_render_size (buffer, i, result) {
        result += i + '. DOM_RENDER_SIZE\n    selector: ' + buffer[i + 1] + '\n';
        return i + 1;
    }, function change_transform (buffer, i, result) {
        result += i + '. CHANGE_TRANSFORM\n    val: ';
        for (var j = 0 ; j < 16 ; j++) result += buffer[i + j] + ', ';
        result += '\n';
        return i + 16;
    }, function change_size (buffer, i, result) {
        result += i + '. CHANGE_SIZE\n    x: ' + buffer[i + 1] + ', y: ' + buffer[i + 2] + '\n';
        return i + 2;
    }, function change_property (buffer, i, result) {
        result += i + '. CHANGE_PROPERTY\n    key: ' + buffer[i + 1] + ', value: ' + buffer[i + 2] + '\n';
        return i + 2;
    }, function change_content (buffer, i, result) {
        result += i + '. CHANGE_CONTENT\n    content: ' + buffer[i + 1] + '\n';
        return i + 1;
    }, function change_attribute (buffer, i, result) {
        result += i + '. CHANGE_ATTRIBUTE\n    key: ' + buffer[i + 1] + ', value: ' + buffer[i + 2] + '\n';
        return i + 2;
    }];

module.exports = Commands;


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
    prettyPrint: function (buffer, start, count) {
        var callback;
        start = start ? start : 0;
        var data = {
            i: start,
            result: ''
        };
        for (var len = count ? count + start : buffer.length ; data.i < len ; data.i++) {
            callback = commandPrinters[buffer[data.i]];
            if (!callback) throw new Error('PARSE ERROR: no command registered for: ' + buffer[data.i]);
            callback(buffer, data);
        }
        return data.result;
    }
};

var commandPrinters = [];

commandPrinters[Commands.INIT_DOM] = function init_dom (buffer, data) {
    data.result += data.i + '. INIT_DOM\n    tagName: ' + buffer[++data.i] + '\n\n';
}; 

commandPrinters[Commands.DOM_RENDER_SIZE] = function dom_render_size (buffer, data) {
    data.result += data.i + '. DOM_RENDER_SIZE\n    selector: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_TRANSFORM] = function change_transform (buffer, data) {
    data.result += data.i + '. CHANGE_TRANSFORM\n    val: [';
    for (var j = 0 ; j < 16 ; j++) data.result += buffer[++data.i] + (j < 15 ? ', ' : '');
    data.result += ']\n\n';
};

commandPrinters[Commands.CHANGE_SIZE] = function change_size (buffer, data) {
    data.result += data.i + '. CHANGE_SIZE\n    x: ' + buffer[++data.i] + ', y: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_PROPERTY] = function change_property (buffer, data) {
    data.result += data.i + '. CHANGE_PROPERTY\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_CONTENT] = function change_content (buffer, data) {
    data.result += data.i + '. CHANGE_CONTENT\n    content: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_ATTRIBUTE] = function change_attribute (buffer, data) {
    data.result += data.i + '. CHANGE_ATTRIBUTE\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ADD_CLASS] = function add_class (buffer, data) {
    data.result += data.i + '. ADD_CLASS\n    className: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.REMOVE_CLASS] = function remove_class (buffer, data) {
    data.result += data.i + '. REMOVE_CLASS\n    className: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.SUBSCRIBE] = function subscribe (buffer, data) {
    data.result += data.i + '. SUBSCRIBE\n    event: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_SET_DRAW_OPTIONS] = function gl_set_draw_options (buffer, data) {
    data.result += data.i + '. GL_SET_DRAW_OPTIONS\n    options: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_AMBIENT_LIGHT] = function gl_ambient_light (buffer, data) {
    data.result += data.i + '. GL_AMBIENT_LIGHT\n    r: ' + buffer[++data.i] + 'g: ' + buffer[++data.i] + 'b: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_LIGHT_POSITION] = function gl_light_position (buffer, data) {
    data.result += data.i + '. GL_LIGHT_POSITION\n    x: ' + buffer[++data.i] + 'y: ' + buffer[++data.i] + 'z: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_LIGHT_COLOR] = function gl_light_color (buffer, data) {
    data.result += data.i + '. GL_LIGHT_COLOR\n    r: ' + buffer[++data.i] + 'g: ' + buffer[++data.i] + 'b: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.MATERIAL_INPUT] = function material_input (buffer, data) {
    data.result += data.i + '. MATERIAL_INPUT\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_SET_GEOMETRY] = function gl_set_geometry (buffer, data) {
    data.result += data.i + '. GL_SET_GEOMETRY\n   x: ' + buffer[++data.i] + ', y: ' + buffer[++data.i] + ', z: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_UNIFORMS] = function gl_uniforms (buffer, data) {
    data.result += data.i + '. GL_UNIFORMS\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_BUFFER_DATA] = function gl_buffer_data (buffer, data) {
    data.result += data.i + '. GL_BUFFER_DATA\n    data: ';
    for (var i = 0; i < 5 ; i++) data.result += buffer[++data.i] + ', ';
    data.result += '\n\n';
};

commandPrinters[Commands.GL_CUTOUT_STATE] = function gl_cutout_state (buffer, data) {
    data.result += data.i + '. GL_CUTOUT_STATE\n    state: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_MESH_VISIBILITY] = function gl_mesh_visibility (buffer, data) {
    data.result += data.i + '. GL_MESH_VISIBILITY\n    visibility: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_REMOVE_MESH] = function gl_remove_mesh (buffer, data) {
    data.result += data.i + '. GL_REMOVE_MESH\n\n';
};

commandPrinters[Commands.PINHOLE_PROJECTION] = function pinhole_projection (buffer, data) {
    data.result += data.i + '. PINHOLE_PROJECTION\n    depth: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ORTHOGRAPHIC_PROJECTION] = function orthographic_projection (buffer, data) {
    data.result += data.i + '. ORTHOGRAPHIC_PROJECTION\n';
};

commandPrinters[Commands.CHANGE_VIEW_TRANSFORM] = function change_view_transform (buffer, data) {
    data.result += data.i + '. CHANGE_VIEW_TRANSFORM\n   value: [';
    for (var i = 0; i < 16 ; i++) data.result += buffer[++data.i] + (i < 15 ? ', ' : '');
    data.result += ']\n\n';
};

commandPrinters[Commands.PREVENT_DEFAULT] = function prevent_default (buffer, data) {
    data.result += data.i + '. PREVENT_DEFAULT\n    value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ALLOW_DEFAULT] = function allow_default (buffer, data) {
    data.result += data.i + '. ALLOW_DEFAULT\n    value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.READY] = function ready (buffer, data) {
    data.result += data.i + '. READY\n\n';
};

commandPrinters[Commands.WITH] = function w (buffer, data) {
    data.result += data.i + '. **WITH**\n     path: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.TIME] = function time (buffer, data) {
    data.result += data.i + '. TIME\n     ms: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.NEED_SIZE_FOR] = function need_size_for (buffer, data) {
    data.result += data.i + '. NEED_SIZE_FOR\n    selector: ' + buffer[++data.i] + '\n\n';
};

module.exports = Commands;


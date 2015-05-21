'use strict';

function Commands () {
    this.INIT_DOM = 0;
    this.DOM_RENDER_SIZE = 1;
    this.CHANGE_TRANSFORM = 2;
    this.CHANGE_SIZE = 3;
    this.CHANGE_PROPERTY = 4;
    this.CHANGE_CONTENT = 5;
    this.CHANGE_ATTRIBUTE = 6;
    this.ADD_CLASS = 7;
    this.REMOVE_CLASS = 8;
    this.SUBSCRIBE = 9;
    this.GL_SET_DRAW_OPTIONS = 10;
    this.GL_AMBIENT_LIGHT = 11;
    this.GL_LIGHT_POSITION = 12;
    this.GL_LIGHT_COLOR = 13;
    this.MATERIAL_INPUT = 14;
    this.GL_SET_GEOMETRY = 15;
    this.GL_UNIFORMS = 16;
    this.GL_BUFFER_DATA = 17;
    this.GL_CUTOUT_STATE = 18;
    this.GL_MESH_VISIBILITY = 19;
    this.GL_REMOVE_MESH = 20;
    this.PINHOLE_PROJECTION = 21;
    this.ORTHOGRAPHIC_PROJECTION = 22;
    this.CHANGE_VIEW_TRANSFORM = 23;
    this.WITH = 24;
    this.FRAME = 25;
    this.ENGINE = 26;
    this.START = 27;
    this.STOP = 28;
    this.TIME = 29;
    this.TRIGGER = 30;
    this.NEED_SIZE_FOR = 31;
    this.DOM = 32;
    this._args = [];
    this.initArgs();
}

Commands.prototype.initArgs = function initArgs () {
    this._args[this.INIT_DOM] = 1;
    this._args[this.DOM_RENDER_SIZE] = 1;
    this._args[this.CHANGE_TRANSFORM] = 16;
    this._args[this.CHANGE_SIZE] = 2;
    this._args[this.CHANGE_PROPERTY] = 2;
    this._args[this.CHANGE_CONTENT] = 1;
    this._args[this.CHANGE_ATTRIBUTE] = 2;
    this._args[this.ADD_CLASS] = 1;
    this._args[this.REMOVE_CLASS] = 1;
    this._args[this.SUBSCRIBE] = 2;
    this._args[this.GL_SET_DRAW_OPTIONS] = 1;
    this._args[this.GL_AMBIENT_LIGHT] = 3;
    this._args[this.GL_LIGHT_POSITION] = 3;
    this._args[this.GL_LIGHT_COLOR] = 3;
    this._args[this.MATERIAL_INPUT] = 2;
    this._args[this.GL_SET_GEOMETRY] = 3;
    this._args[this.GL_UNIFORMS] = 2;
    this._args[this.GL_BUFFER_DATA] = 5;
    this._args[this.GL_CUTOUT_STATE] = 1;
    this._args[this.GL_MESH_VISIBILITY] = 1;
    this._args[this.GL_REMOVE_MESH] = 0;
    this._args[this.PINHOLE_PROJECTION] = 1;
    this._args[this.ORTHOGRAPHIC_PROJECTION] = 0;
    this._args[this.CHANGE_VIEW_TRANSFORM] = 16;
};

module.exports = new Commands();

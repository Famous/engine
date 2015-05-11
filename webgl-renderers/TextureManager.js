'use strict';

var Texture = require('./Texture');
var Checkerboard = require('./Checkerboard');
var Clock = require('../core').Famous.getClock();

/**
 * Handles loading, binding, and resampling of textures for WebGLRenderer.
 *
 * @class TextureManager
 * @constructor
 *
 * @param {WebGL_Context} gl Context used to create and bind textures.
 */
function TextureManager(gl) {
    this.registry = [];
    this._needsResample = [];

    this._activeTexture = 0;
    this._boundTexture;

    this.gl = gl;
}

TextureManager.prototype.update = function update() {
    var time = Clock.getTime();
    var registryLength = this.registry.length;

    for (var i = 1; i < registryLength; i++) {
        var texture = this.registry[i];

        if (texture && texture.isLoaded && texture.resampleRate) {
            if (time - texture.lastResample > texture.resampleRate) {
                if (!this._needsResample[texture.id]) {
                    this._needsResample[texture.id] = true;
                    texture.lastResample = time;
                }
            }
        }
    }
}

TextureManager.prototype.register = function register(input, slot) {
    var source = input.data;
    var textureId = input.id;
    var options = input.options || {};
    var texture = this.registry[textureId];
    var isLoaded = false;

    if (!texture) {

        texture = new Texture(this.gl, options);
        texture.setImage(Checkerboard);

        // Handle array

        if (Array.isArray(source) || source instanceof Uint8Array || source instanceof Float32Array) {
            this.bindTexture(textureId);
            texture.setArray(source);
            isLoaded = true;
        }

        // Handle video

        else if (window && source instanceof window.HTMLVideoElement) {
            source.addEventListener('loadeddata', function() {
                this.bindTexture(textureId);
                texture.setImage(source);

                this.registry[textureId].isLoaded = true;
                this.registry[textureId].source = source;
            }.bind(this));

        }

        // Handle image url

        else if ('string' === typeof source) {
            loadImage(source, function (img) {
                this.bindTexture(textureId);
                texture.setImage(img);

                this.registry[textureId].isLoaded = true;
                this.registry[textureId].source = img;
            }.bind(this));
        }

        // Add texture to registry

        this.registry[textureId] = {
            resampleRate: options.resampleRate || null,
            lastResample: Clock.getTime(),
            isLoaded: isLoaded,
            texture: texture,
            source: source,
            id: textureId,
            slot: slot
        }
    }

    return textureId;
}

/**
 * Loads an image from a string or Image object and executes a callback function.
 *
 * @method loadImage
 * @private
 *
 * @param {Object | String} img The input image data to load as an asset.
 * @param {Function} callback The callback function to be fired when
 * the image has finished loading.
 *
 * @return {Object} Image object being loaded.
 */
function loadImage (input, callback) {
    var image = (typeof input === 'string' ? new Image() : input) || {};
        image.crossOrigin = 'anonymous';

    if (!image.src) image.src = input;
    if (!image.complete) image.onload = function () { callback(image); };
    else callback(image);

    return image;
}

TextureManager.prototype.bindTexture = function bindTexture(id) {
    var spec = this.registry[id];

    if (this._activeTexture !== spec.slot) {
        this.gl.activeTexture(this.gl.TEXTURE0 + spec.slot);
        this._activeTexture = spec.slot;
    }

    if (this._boundTexture !== id) {
        this._boundTexture = id;
        spec.texture.bind();
    }

    if (this._needsResample[spec.id]) {

        // TODO: Account for resampling of arrays.

        spec.texture.setImage(spec.source);
        this._needsResample[spec.id] = false;
    }
}

module.exports = TextureManager;
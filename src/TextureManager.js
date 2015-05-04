var Texture = require('./Texture');
var Checkerboard = require('./Checkerboard');
var Clock = require('famous-core').Famous.getClock();

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
        if (this.registry[i].isLoaded && this.registry[i].resampleRate) {
			if (time - this.registry[i].lastResample > this.registry[i].resampleRate) {
				if (!this._needsResample[this.registry[i].texture.id]) {
					this._needsResample[this.registry[i].texture.id] = true;
					this.registry[i].lastResample = time;
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

        // Set correct texture slot.

        this.gl.activeTexture(this.gl.TEXTURE0 + slot);

        // Handle array

        if (Array.isArray(source) || source instanceof Uint8Array || source instanceof Float32Array) {
            texture = new Texture(this.gl, options);
            texture.setArray(source);
            isLoaded = true;
        }

        // Handle video

        else if (window && source instanceof window.HTMLVideoElement) {
            texture = new Texture(this.gl, options);
            texture.setImage(Checkerboard);
            source.addEventListener('loadeddata', function() {
                this.gl.activeTexture(this.gl.TEXTURE0 + slot);
                texture.bind();

                texture.setImage(source);
                this.registry[textureId].isLoaded = true;
                this.registry[textureId].source = source;
            }.bind(this));
        }

        // Handle image url

        else if ('string' === typeof source) {
            texture = new Texture(this.gl, options);
            texture.setImage(Checkerboard);
            loadImage(source, function (img) {
                this.gl.activeTexture(this.gl.TEXTURE0 + slot);
                texture.bind();

                texture.setImage(img);
                this.registry[textureId].isLoaded = true;
                this.registry[textureId].source = img;
            }.bind(this));
        }

        // Add texture to registry

        this.registry[textureId] = {
        	resampleRate: options.resampleRate || null,
        	isLoaded: isLoaded,
        	texture: texture,
        	source: source,
        	lastResample: Clock.getTime()
        }
    }

    return textureId;
}

function loadImage (input, callback) {
    var image = (typeof input === 'string' ? new Image() : input) || {};
        image.crossOrigin = 'anonymous';

    if (!image.src) image.src = input;
    if (!image.complete) image.onload = function () { callback(image); };
    else callback(image);

    return image;
}

TextureManager.prototype.bindTextures = function bindTextures(textures) {
    for (var i = 0; i < textures.length; i++) {
        var id = textures[i];
        var spec = this.registry[id];

        if (this._activeTexture !== i) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this._activeTexture = i;
        }

    	if (this._boundTexture !== id) {
            this._boundTexture = id;
            spec.texture.bind();
        }

    	if (this._needsResample[spec.texture.id]) {

            // TODO: Account for resampling of arrays.

    		spec.texture.setImage(spec.source);
            this._needsResample[spec.texture.id] = false;
    	}
    }
}

module.exports = TextureManager;
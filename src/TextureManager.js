var Texture = require('./Texture');
var Checkerboard = require('./Checkerboard');
var Clock = require('famous-core').Famous.getClock();

function TextureManager(gl) {
	this.registry = [];
	this._updates = [];

    this._activeTexture;

	this.gl = gl;
}

TextureManager.prototype.update = function update() {
	var time = Clock.getTime();
	var registryLength = this.registry.length;

	for (var i = 1; i < registryLength; i++) {
        if (this.registry[i].isLoaded && this.registry[i].resampleRate) {
			if (time - this.registry[i].lastResample > this.registry[i].resampleRate) {
				if (!this._updates[this.registry[i].texture.id]) {
					this._updates[this.registry[i].texture.id] = true;
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
    var setter;

    if (!texture) {

        // Set correct texture slot.

        this.gl.activeTexture(this.gl.TEXTURE0 + slot);

        // Handle array

        if (Array.isArray(source) || source instanceof Uint8Array || source instanceof Float32Array) {
            texture = new Texture(this.gl, options);
            setter = 'setArray';
            texture[setter](source);
            isLoaded = true;
        }

        // Handle video

        else if (window && source instanceof window.HTMLVideoElement) {
            texture = new Texture(this.gl, options);
            setter = 'setImage';
            texture.setImage(Checkerboard);
            source.addEventListener('loadeddata', function() {
                this.gl.activeTexture(this.gl.TEXTURE0 + slot);
                texture.bind();

                texture[setter](source);
                this.registry[textureId].isLoaded = true;
                this.registry[textureId].source = source;
            }.bind(this));
        }

        // Handle image url

        else if ('string' === typeof source) {
            texture = new Texture(this.gl, options);
            texture.setImage(Checkerboard);
            setter = 'setImage';
            loadImage(source, function (img) {
                this.gl.activeTexture(this.gl.TEXTURE0 + slot);
                texture.bind();

                texture[setter](img);
                this.registry[textureId].isLoaded = true;
                this.registry[textureId].source = img;
            }.bind(this));
        }

        // Add texture to registry

        this.registry[textureId] = {
        	resampleRate: options.resampleRate || null,
        	isLoaded: isLoaded,
            setter: setter,
        	texture: texture,
        	source: source,
        	lastResample: Clock.getTime()
        }
    }

    return textureId;
}

function loadImage (img, callback) {
    var obj = (typeof img === 'string' ? new Image() : img) || {};
    obj.crossOrigin = 'anonymous';
    if (! obj.src) obj.src = img;
    if (! obj.complete) obj.onload = function () { callback(obj); };
    else callback(obj);
    return obj;
}

TextureManager.prototype.bindTextures = function bindTextures(textures) {
    for (var i = 0; i < textures.length; i++) {
        var id = textures[i];
        var spec = this.registry[id];

        this.gl.activeTexture(this.gl.TEXTURE0 + i);
    	spec.texture.bind();

    	if (this._updates[spec.texture.id]) {
    		spec.texture[spec.setter](spec.source);
    	}
    }
}

TextureManager.prototype.get = function get(id) {
	return this.registry[id].texture;
}

module.exports = TextureManager;
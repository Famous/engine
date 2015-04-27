var Texture = require('./Texture');
var Checkerboard = require('./Checkerboard');

function TextureManager(gl) {
	this.registry = [];
	this._updates = [];

	this.gl = gl;
}

TextureManager.prototype.update = function update() {
	var time = Date.now();
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

TextureManager.prototype.register = function register(input) {
    var source = input.data;
    var textureId = input.id;
    var options = input.options || {};
    var texture = this.registry[textureId];
    var isLoaded = false;

    if (!texture) {
        if (Array.isArray(source) || source instanceof Uint8Array || source instanceof Float32Array) {
            texture = new Texture(this.gl, options);
            texture.setArray(source);
            isLoaded = true;
        }

        else if (window && source instanceof window.HTMLVideoElement) {
            texture = new Texture(this.gl, options);
            texture.src = texture;
            texture.setImage(Checkerboard);
            source.addEventListener('loadeddata', function() {
                texture.setImage(source);
                this.registry[textureId].loaded = true;
                this.registry[textureId].source = img;

            }.bind(this));
        }

        else if ('string' === typeof source) {
            texture = new Texture(this.gl, options);
            texture.setImage(Checkerboard);
            loadImage(source, function (img) {
                texture.setImage(img);
                this.registry[textureId].loaded = true;
                this.registry[textureId].source = img;
            }.bind(this));
        }

        this.registry[textureId] = {
        	resampleRate: options.resampleRate || null,
        	isLoaded: isLoaded,
        	texture: texture,
        	source: source,
        	lastResample: Date.now()
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

TextureManager.prototype.bind = function bind(id) {
	this.registry[id].texture.bind();

	if (this._updates[this.registry[id].texture.id]) {
		this.registry[id].texture.setArray(this.registry[id].source);
	}
}

TextureManager.prototype.get = function get(id) {
	return this.registry[id].texture;
}

module.exports = TextureManager;
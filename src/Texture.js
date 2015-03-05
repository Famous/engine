'use strict';

/**
 * Texture is a private class that stores image data
 * to be accessed from a shader or used as a render target.
 *
 * @class Texture
 * @constructor
 * 
 */

function Texture(gl, options) {
    options = options || {};
    this.id = gl.createTexture();
    this.width = options.width || 255;
    this.height = options.height || 255;
    this.format = options.format || gl.RGBA;
    this.type = options.type || gl.UNSIGNED_BYTE;
    this.gl = gl;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[options.magFilter] || gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[options.minFilter] || gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[options.wrapS] || gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[options.wrapS] || gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, null);

    if (options.mipmap) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }
}

/**
 * Binds this texture as the selected target
 *
 * @method setOrigin
 * @chainable
 *
 * @param {Number} the texture slot in which to upload the data
 */

Texture.prototype.bind = function bind(unit) {
    this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
};

/**
 * Erases the texture data in the given texture slot
 *
 * @method unbind
 * @chainable
 *
 * @param {Number} the texture slot in which to clean the data
 */

Texture.prototype.unbind = function unbind(unit) {
    this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
};


/**
 * Replaces the image data in the texture with the given image.
 *
 * @method setImage
 * @chainable
 *
 * @param {Image} the Img object to upload pixel data from
 */

Texture.prototype.setImage = function setImage(img) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.format, this.type, img);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return this;
};

/**
 * Dumps the rgb-pixel contents of a texture into an array for debugging purposes
 *
 * @method readBack
 * @chainable
 *
 * @param {Number} x-offset between texture coordinates and snapshot
 * @param {Number} y-offset between texture coordinates and snapshot
 * @param {Number} x-depth of the snapshot
 * @param {Number} y-depth of the snapshot
 */

Texture.prototype.readBack = function readBack(x, y, width, height) {
    var gl = this.gl;
    var pixels;
    x = x || 0;
    y = y || 0;
    width = width || this.width;
    height = height || this.height;
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
        pixels = new Uint8Array(width * height * 4);
        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    }
    return pixels;
};

module.exports = Texture;

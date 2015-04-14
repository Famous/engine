var methods = [
    { name: "activeTexture" },
    { name: "attachShader" },
    { name: "bindAttribLocation" },
    { name: "bindBuffer" },
    { name: "bindFramebuffer" },
    { name: "bindRenderbuffer" },
    { name: "bindTexture" },
    { name: "blendColor" },
    { name: "blendEquation" },
    { name: "blendEquationSeparate" },
    { name: "blendFunc" },
    { name: "blendFuncSeparate" },
    { name: "bufferData" },
    { name: "bufferSubData" },
    { name: "clear" },
    { name: "clearColor" },
    { name: "clearDepth" },
    { name: "clearStencil" },
    { name: "colorMask" },
    { name: "compileShader" },
    { name: "compressedTexImage2D" },
    { name: "compressedTexSubImage2D" },
    { name: "copyTexImage2D" },
    { name: "copyTexSubImage2D" },
    { name: "createFramebuffer" },
    { name: "createRenderbuffer" },
    { name: "createShader" },
    { name: "cullFace" },
    { name: "deleteBuffer" },
    { name: "deleteFramebuffer" },
    { name: "deleteProgram" },
    { name: "deleteRenderbuffer" },
    { name: "deleteShader" },
    { name: "deleteTexture" },
    { name: "depthFunc" },
    { name: "depthMask" },
    { name: "depthRange" },
    { name: "detachShader" },
    { name: "disable" },
    { name: "disableVertexAttribArray" },
    { name: "drawArrays" },
    { name: "drawElements" },
    { name: "enable" },
    { name: "enableVertexAttribArray" },
    { name: "finish" },
    { name: "flush" },
    { name: "framebufferRenderbuffer" },
    { name: "framebufferTexture2D" },
    { name: "frontFace" },
    { name: "generateMipmap" },
    { name: "getActiveAttrib" },
    { name: "getActiveUniform" },
    { name: "getAttachedShaders" },
    { name: "getAttribLocation" },
    { name: "getBufferParameter" },
    { name: "getContextAttributes" },
    { name: "getError" },
    { name: "getExtension" },
    { name: "getFramebufferAttachmentParameter" },
    { name: "getParameter" },
    { name: "getProgramInfoLog" },
    { name: "getRenderbufferParameter" },
    { name: "getShaderInfoLog" },
    { name: "getShaderPrecisionFormat" },
    { name: "getShaderSource" },
    { name: "getSupportedExtensions" },
    { name: "getTexParameter" },
    { name: "getUniform" },
    { name: "getVertexAttrib" },
    { name: "getVertexAttribOffset" },
    { name: "hint" },
    { name: "isBuffer" },
    { name: "isContextLost" },
    { name: "isEnabled" },
    { name: "isFramebuffer" },
    { name: "isProgram" },
    { name: "isRenderbuffer" },
    { name: "isShader" },
    { name: "isTexture" },
    { name: "lineWidth" },
    { name: "linkProgram" },
    { name: "pixelStorei" },
    { name: "polygonOffset" },
    { name: "readPixels" },
    { name: "renderbufferStorage" },
    { name: "sampleCoverage" },
    { name: "scissor" },
    { name: "shaderSource" },
    { name: "stencilFunc" },
    { name: "stencilFuncSeparate" },
    { name: "stencilMask" },
    { name: "stencilMaskSeparate" },
    { name: "stencilOp" },
    { name: "stencilOpSeparate" },
    { name: "texParameterf" },
    { name: "texParameteri" },
    { name: "texImage2D" },
    { name: "texSubImage2D" },
    { name: "uniform1f" },
    { name: "uniform1fv" },
    { name: "uniform1i" },
    { name: "uniform1iv" },
    { name: "uniform2f" },
    { name: "uniform2fv" },
    { name: "uniform2i" },
    { name: "uniform2iv" },
    { name: "uniform3f" },
    { name: "uniform3fv" },
    { name: "uniform3i" },
    { name: "uniform3iv" },
    { name: "uniform4f" },
    { name: "uniform4fv" },
    { name: "uniform4i" },
    { name: "uniform4iv" },
    { name: "uniformMatrix2fv" },
    { name: "uniformMatrix3fv" },
    { name: "uniformMatrix4fv" },
    { name: "useProgram" },
    { name: "validateProgram" },
    { name: "vertexAttrib1f" },
    { name: "vertexAttrib1fv" },
    { name: "vertexAttrib2f" },
    { name: "vertexAttrib2fv" },
    { name: "vertexAttrib3f" },
    { name: "vertexAttrib3fv" },
    { name: "vertexAttrib4f" },
    { name: "vertexAttrib4fv" },
    { name: "vertexAttribPointer" },
    { name: "viewport" },
    { name: "getShaderParameter", returnFn: returnTrue },
    { name: "getProgramParameter", returnFn: returnTrue },
    { name: "createProgram", returnFn: returnObject },
    { name: "createTexture", returnFn: returnObject },
    { name: "createBuffer", returnFn: returnObject },
    { name: "checkFramebufferStatus", returnFn: returnBound.bind(36053) /* FRAMEBUFFER_COMPLETE */ }
];

function returnTrue() {
    return true;
}

function returnObject() {
    return {};
}

function returnBound() {
    return this;
}

function WebGLTestingContext() {
    var i;
    var uniformLocations = 1;
    
    for (var i = 0; i < methods.length; i++) {
        this[methods[i].name] = function (i) {
            this[methods[i].name].callCount++;
            this[methods[i].name].history.push(
                Array.prototype.slice.call(arguments, 1)
            );

            if (methods[i].returnFn)
                return methods[i].returnFn();

        }.bind(this, i);

        this[methods[i].name].callCount = 0;
        this[methods[i].name].history = [];
    }

    this.getUniformLocation = function getUniformLocation() {
        this.getUniformLocation.callCount = this.getUniformLocation.callCount++ || 1;
        return uniformLocations++;
    }.bind(this);
}

WebGLTestingContext.prototype.TEXTURE0 = 33984;
WebGLTestingContext.prototype.FRAMEBUFFER_COMPLETE = 36053;
WebGLTestingContext.prototype.ELEMENT_ARRAY_BUFFER = 34963;

module.exports = WebGLTestingContext;

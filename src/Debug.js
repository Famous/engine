/**
 * Takes the original rendering contexts' compiler function
 * and augments it with added functionality for parsing and
 * displaying errors.
 *
 * @method debug
 *
 * @returns {Function}
 */
module.exports = function Debug() {
    return _augmentFunction(
        this.gl.compileShader,
        function(shader) {
            if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
                var errors = this.getShaderInfoLog(shader);
                var source = this.getShaderSource(shader);
                _processErrors(errors, source);
            }
        }
    );
}

/**
 * Takes a function, keeps the reference and replaces it by a closure that
 * executes the original function and the provided callback.
 *
 * @param {Function} Function
 * @param {Function} Callback
 * @return {Function}
 */
function _augmentFunction(func, callback) {
    return function() {
        var res = func.apply(this, arguments);
        callback.apply(this, arguments);
        return res;
    }
}

/**
 * Parses errors and failed source code from shaders in order
 * to build displayable error blocks.
 *
 * @param {String} Errors
 * @param {String} Source
 */
function _processErrors(errors, source) {

    var css = '#shaderReport{ box-sizing: border-box; position: absolute; left: 0; top: 0; \
        right: 0; font-family: monaco, monospace; font-size: 12px; z-index: 1000; \
        background-color: #b70000; color: #fff; white-space: normal; \
        text-shadow: 0 -1px 0 rgba(0,0,0,.6); line-height: 1.2em; list-style-type: none; \
        padding: 0; margin: 0; max-height: 300px; overflow: auto; } \
        #shaderReport li{ padding: 20px 10px; border-top: 1px solid rgba( 255, 255, 255, .2 ); \
        border-bottom: 1px solid rgba( 0, 0, 0, .2 ) } \
        #shaderReport li p{ padding: 0; margin: 0 } \
        #shaderReport li:nth-child(odd){ background-color: #9D0B0B }\
        #shaderReport li p:first-child{ color: #fff }';

    var el = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(el);
    el.textContent = css;

    var report = document.createElement('ul');
    report.setAttribute('id', 'shaderReport');
    document.body.appendChild(report);

    var re = /ERROR: [\d]+:([\d]+): (.+)/gmi;
    var lines = source.split('\n');

    var m;
    while ((m = re.exec(errors)) != null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        var li = document.createElement('li');
        var code = '<p>ERROR "<b>' + m[2] + '</b>" in line ' + m[1] + '</p>'
        code += '<p>' + lines[m[1] - 1].replace(/^[ \t]+/g, '') + '</p>';
        li.innerHTML = code;
        report.appendChild(li);
    }
}

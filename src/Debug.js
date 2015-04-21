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
 * Inspired by Jaume Sanchez Elias.
 *
 * @param {String} Errors
 * @param {String} Source
 */
function _processErrors(errors, source) {

    var css = 'body,html{background:#e3e3e3;font-family:monaco,monospace;font-size:14px;line-height:1.7em}'
            + '#shaderReport{left:0;top:0;right:0;box-sizing:border-box;position:absolute;z-index:1000;color:'
            + '#222;padding:15px;white-space:normal;list-style-type:none;margin:50px auto;max-width:1200px}'
            + '#shaderReport li{background-color:#fff;margin:13px 0;box-shadow:0 1px 2px rgba(0,0,0,.15);'
            + 'padding:20px 30px;border-radius:2px;border-left:20px solid #e01111}span{color:#e01111;'
            + 'text-decoration:underline;font-weight:700}#shaderReport li p{padding:0;margin:0}'
            + '#shaderReport li:nth-child(even){background-color:#f4f4f4}'
            + '#shaderReport li p:first-child{margin-bottom:10px;color:#666}';

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
        if (m.index === re.lastIndex) re.lastIndex++;
        var li = document.createElement('li');
        var code = '<p><span>ERROR</span> "' + m[2] + '" in line ' + m[1] + '</p>'
        code += '<p><b>' + lines[m[1] - 1].replace(/^[ \t]+/g, '') + '</b></p>';
        li.innerHTML = code;
        report.appendChild(li);
    }
}

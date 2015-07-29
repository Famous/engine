var replaceMethod = require('replace-method');
var codegen = require('escodegen');
var esprima = require('esprima');
var through = require('through');

/**
 * Browserify transform used for transforming `assert()` function calls.
 *
 * @param  {String} file                Original filename of the current source
 *                                      file.
 * @param  {Object} options             Configuration object.
 * @param  {Boolean} [stripErrors=true] Boolean value indicating if the error
 *                                      messages should be excluded from the
 *                                      bundle.
 * @param  {Boolean} [preCheck=true]    Avoid `assert` function call.
 * @return {Stream}                     `through` stream.
 */
var optimizeAssertionsTransform = function(file, options) {
    options = options || {};

    if (options.stripErrors == null)
        options.stripErrors = true;

    if (options.preCheck == null)
        options.preCheck = true;

    var stream = through(write, end);
    var source = '';

    function write(chunk) {
        source += chunk;
    }

    function end() {
        var ast;

        try {
            ast = esprima.parse(source);
        }
        catch (e) {
            return stream.emit('error', e);
        }

        var src = replaceMethod(ast);
        src.replace(['assert'], function(node) {
            if (options.stripErrors) {
                node.arguments.length = 1;
            }

            if (options.preCheck) {
                node = {
                    'type': 'IfStatement',
                    'test': {
                        'type': 'UnaryExpression',
                        'operator': '!',
                        'argument': node.arguments[0],
                        'prefix': true
                    },
                    'consequent': node,
                    'alternate': null
                };
            }

            return node;
        });

        var code;

        try {
            code = codegen.generate(ast);
        }
        catch (e) {
            return stream.emit('error', e);
        }

        stream.queue(code);
        stream.queue(null);
    }

    return stream;
};

module.exports = optimizeAssertionsTransform;

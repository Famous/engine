'use strict';

var test = require('tape');
var path = require('path');
var glob = require('glob');
require('colors');

var characterStack = [];
var messageStack = [''];
var succeeded = 0;
var failed = 0;

function log (message) {
    console.log(characterStack.join(' ') + message);
}

function logCharacterStack () {
    console.log(characterStack.join(' '));
}

function pushCharacterStack () {
    characterStack.push('\\'.cyan);
    logCharacterStack();
    characterStack.pop();
    characterStack.push('|'.cyan);
}

function popCharacterStack () {
    characterStack.pop();
    characterStack.push('/'.cyan);
    logCharacterStack();
    characterStack.pop();
    logCharacterStack();
}

function handleAssertion (row) {
    log('operator is "' + row.operator + '"');
    switch (row.operator) {
        case 'equal': log('expected ' + row.expected + ' but received ' + row.actual); break;
        case 'notOk': log('expected ' + row.actual + ' to be falsy'); break;
        case 'ok': log('expected ' + row.actual + ' to be truthy'); break;
        case 'notEqual': log('expected ' + row.expected + ' to not be equal to ' + row.actual); break;
        case 'throws': log('error expected to throw but did not'); break;
        case 'doesNotThrow': log('no error expected to throw but error was thrown'); break;
        default: throw new Error('operator: ' + row.operator + ' unknown');
    }
}

function handleFile (file) {
    if (messageStack[0] !== file) {
        while (characterStack.length) popCharacterStack();
        messageStack[0] = file;
    }
}

test.createStream({objectMode: true}).on('data', function (row) {
        if (!row.ok) {
            switch (row.type) {
                case 'test':
                    messageStack.push(row.name);
                    break;
                case 'end':
                    messageStack.pop();
                    if (characterStack.length) popCharacterStack();
                    break;
                case 'assert':
                    failed++;
                    handleFile(row.file.substring(0, row.file.indexOf(':')).bold.magenta);

                    while (characterStack.length < messageStack.length) {
                        log(messageStack[characterStack.length].underline);
                        pushCharacterStack();
                    }

                    while (characterStack.length > messageStack.length) {
                        popCharacterStack();
                    }

                    log(' ' + 'not ok'.underline.red + ' at line ' + (row.line + '').bold);

                    characterStack.push('- '.cyan);
                    log(row.name.yellow);
                    
                    handleAssertion(row);

                    characterStack.pop();

                    logCharacterStack();

                    break;
            }
        } else succeeded++;
});

if (process.argv.length > 3) {

    console.log(
        '\n\n\n\n\n', 
        '\n\n beginning test suite'.underline.green + '\n', 
        '\n\nfor files:\n-> ' + process.argv.slice(2).map(function (file) {
            return file.cyan;
        }).join('\n-> ') + '\n\n\n\n\n'
    );

    process.argv.slice(2).forEach(function (file) {
        require(path.resolve(file));
    });

}
else if (process.argv.length === 3) {

    process.argv.slice(2).forEach(function (arg) {

        var files = glob.sync(arg);

        console.log(
            '\n\n\n\n\n', 
            '\n\n beginning test suite'.underline.green + '\n', 
            '\n\nfor files:\n-> ' + files.map(function (file) {
                return file.cyan;
            }).join('\n-> ') + '\n\n\n\n\n'
        );
        
        files.forEach(function (file) {
            require(path.resolve(file));
        });

    });

}

process.on('beforeExit', function () {
    while (characterStack.length) popCharacterStack();

    console.log('ok'.underline.green + ': ' + succeeded);
    console.log('not ok'.underline.red + ': ' + failed);
    var percent = succeeded / (failed + succeeded); 
    console.log('\n' + 'Percent ok'.underline + ': ' + (percent * 100) + '%');
    if (percent === 1) console.log('\n\n all tests ok'.underline.green + '\n\n\n\n\n');
    else console.log('\n\n some tests not ok'.underline.red + '\n\n\n\n\n');


    if (percent !== 1) throw new Error();
});


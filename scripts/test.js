'use strict';

var istanbul = require('istanbul');
var test = require('tape');
var path = require('path');
var colors = require('colors');

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
};

function handleAssertion (row) {
    log('operator is "' + row.operator + '"');
    switch (row.operator) {
        case 'equal': log('expected ' + row.expected + ' but received ' + row.actual); break;
        case 'notOk': log('expected ' + row.actual + ' to be falsy'); break;
        case 'ok': log('expected ' + row.actual + ' to be truthy'); break;
        case 'notEqual': log('expected ' + row.expected + ' to not be equal to ' + row.actual); break;
        case 'throws': log(row.actual); break;
        case 'doesNotThrow': log(row.actual); break;
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

process.argv.slice(2).forEach(function (file, i, files) {
    require(path.resolve(file));
});


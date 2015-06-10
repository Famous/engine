'use strict';

var test = require('tape');
var path = require('path');
var colors = require('colors');

var characterStack = [];
var messageStack = [''];
var loggedStack = [];
var succeeded = 0;
var failed = 0;

function log (message) {
    console.log(characterStack.join(' ') + message);
}

function logCharacterStack () {
    console.log(characterStack.join(' '));
}

function handleAssertion (row) {
    log('operator is "' + row.operator + '"');
    switch (row.operator) {
        case 'equal': log('expected ' + row.expected + ' but received ' + row.actual); break;
        case 'notOk': log('expected ' + row.expected + ' to be falsy'); break;
        case 'ok': log('expected ' + row.expected + ' to be truthy'); break;
        default: throw new Error('operator: ' + row.operator + ' unknown');
    }
}

function handleFile (file) {
    if (messageStack[0] !== file) {
        while (characterStack.length) {
            characterStack.pop();
            characterStack.push('/');
            logCharacterStack();
            characterStack.pop();
        }
        messageStack[0] = file;
    }
}

test.createStream({objectMode: true}).on('data', function (row) {
        if (!row.ok) {
            switch (row.type) {
                case 'test':
                    messageStack.push(row.name);
                    loggedStack.push(false);
                    break;
                case 'end':
                    characterStack.pop();
                    messageStack.pop();
                    if (loggedStack.pop()) {
                        characterStack.push('/'.cyan);
                        logCharacterStack();
                        characterStack.pop();
                        logCharacterStack();
                    }
                    break;
                case 'assert':
                    failed++;
                    handleFile(row.file.substring(0, row.file.indexOf(':')).bold.magenta);

                    while (characterStack.length < messageStack.length) {
                        log(messageStack[characterStack.length].underline);
                        characterStack.push('\\'.cyan);
                        logCharacterStack();
                        characterStack.pop();
                        characterStack.push('|'.cyan);
                    }

                    while (characterStack.length > messageStack.length) {
                        characterStack.pop();
                        characterStack.push('/'.cyan);
                        logCharacterStack();
                        characterStack.pop();
                    }

                    log(' ' + 'not ok'.underline.red + ' at line ' + (row.line + '').bold);

                    characterStack.push('- '.cyan);
                    log(row.name.yellow);
                    
                    handleAssertion(row);

                    characterStack.pop();

                    logCharacterStack();

                    loggedStack = loggedStack.map(function () {
                        return true;
                    });

                    break;
            }
        } else succeeded++;
});

process.argv.slice(2).forEach(function (file, i, files) {
    require(path.resolve(file));
});


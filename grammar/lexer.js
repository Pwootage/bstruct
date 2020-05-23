const moo = require('moo');
const fs = require('fs')

const lexer = moo.compile({
    ws: {match: /[ \t\r\n]+/, lineBreaks: true},
    identifier: {match: /(?:[a-zA-Z_][a-zA-Z0-9_]*)(?:::[a-zA-Z_][a-zA-Z0-9_]*)*/, type: moo.keywords({
        keyword: ['struct', 'size', 'enum'],
    })},
    int: /(?:0[xX][0-9A-Fa-f]+)|(?:0[bB][01]+)|(?:0)|(?:[1-9][0-9]*)/,
    equals: '=',
    doublecolon: '::',
    colon: ':',
    splat: '*',
    percent: '%',
    lcurly: '{',
    rcurly: '}',
    langle: '<',
    rangle: '>',
    lparen: '(',
    rparen: ')',
    lsquare: '[',
    rsquare: ']',
    comma: ',',
    quot: /["']/
});

// let test = require('fs').readFileSync('./example.bs', {encoding: 'utf-8'});
// lexer.reset(test);
// for (let token of lexer) {
    // console.log(token);
// }

module.exports = lexer;
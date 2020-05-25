import moo from 'moo';
export const lexer = moo.compile({
    ws: {match: /[ \t\r\n]+/, lineBreaks: true},
    comment: /\/\/.*?$/,
    identifier: {match: /(?:[a-zA-Z_][a-zA-Z0-9_]*)(?:::[a-zA-Z_][a-zA-Z0-9_]*)*/, type: moo.keywords({
        // keyword: ['struct', 'size', 'enum'],
    })},
    hex_int: /0[xX][0-9A-Fa-f]+/,
    binary_int: /0[bB][01]+/,
    decimal_int: /(?:0)|(?:[1-9][0-9]*)/,
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

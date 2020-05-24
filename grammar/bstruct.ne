@preprocessor typescript

@{% 
import moo from 'moo';
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
}) as any;
%}
@lexer lexer

# Import our AST constructors
@{%
import {BStruct} from './ast/BStruct';
import {BEnum, BEnumValue} from './ast/BEnum';
import {BTemplateValues} from './ast/BTemplateValues';
import {BIdentifier} from './ast/BIdentifier';
import {BMember} from './ast/BMember';
import {BInt} from './ast/BInt';
import {BExtends} from './ast/BExtends';
import {BType} from './ast/BType';
import {BRootStatement} from './ast/BRootStatement';
import {BTemplatableInt} from './ast/BTemplatableInt';

%}

# Root
start -> _ root_statement (__ root_statement):* _
    {% ([,first, others]) => [first, ...others.map((v: any[]) => v[1] as BRootStatement)] %}

root_statement -> 
      struct_decl {% id %}
    | enum_decl {% id %}

# Struct and it's members
struct_decl -> "struct" __ identifier (_ template_values):? (_ extends_decl):? _ "{" _ 
        (size_decl _):?
        (struct_member _):*
    "}" 
    {% ([ , ,name,template,ext, , , ,size,members]) => new BStruct(name, template?template[1]:null, ext?ext[1]:null, size, members.map((v: any[]) => v[0] as BMember)) %}

extends_decl -> ":" _ type (_ "," _ type):* {% ([,,first,others]) => {
    let res = [first];
    if (others) for (let o of others) res.push(o[3]);
    return res;
} %}

size_decl -> "size" __ templatable_int 
    {% ([,,v]) => v as BTemplatableInt %}

struct_member -> type __ identifier (__ templatable_int):?
    {% ([type, ,name,offset]) => new BMember(type, name, offset?offset[1]:null) %}

type -> pointer_indicator identifier template_values:? array_size:? 
    {% ([ptr, name, template, array_size]) => new BType(ptr, name, template, array_size) %}

pointer_indicator -> ("*" _):? {% ([v]) => !!v %}

array_size -> "[" _ templatable_int _ "]" 
    {% ([,,v]) => v as BTemplatableInt %}

# Enum and it's values
enum_decl -> "enum" __ identifier _ (":" _ identifier _):? "{" _
        (enum_value (_ "," _ enum_value):*):?
    _ "}" 
    {% ([ , ,name, , ext, , , values]) => new BEnum(name, [values[0],...values[1].map((v: any[]) => v[3])], ext?ext[2]:null) %}

enum_value -> identifier (_ "=" _ int):? 
    {% ([name, value]) => new BEnumValue(name, value?value[3]:null) %}

# templating
template_values -> "<" _ identifier _ ("," _ identifier _):* ">"
    {% ([ , ,first, ,others]) => [first,...others.map((v: any[]) => v[2])] as BTemplateValues %}

templatable_int -> 
      int {% ([v]) => v as BInt %}
    | identifier {% ([v]) => v as BIdentifier %}

#primitives

identifier -> %identifier {% ([v]) => v as BIdentifier %}

_ -> null | %ws {% () => null %}
__ -> %ws {% () => null %}

int -> %int {% ([v]) => v as BInt %}
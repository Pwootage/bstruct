@preprocessor typescript

@{% 
import {lexer} from './bstruct-lexer';
const _lexer = lexer as any;
%}
@lexer _lexer

# Import our AST constructors
@{%
import {ASTStruct} from './ast/ASTStruct';
import {ASTEnum, ASTEnumValue} from './ast/ASTEnum';
import {ASTTemplateValues} from './ast/ASTTemplateValues';
import {ASTIdentifier} from './ast/ASTIdentifier';
import {ASTMember} from './ast/ASTMember';
import {ASTInt} from './ast/ASTInt';
import {ASTExtends} from './ast/ASTExtends';
import {ASTType} from './ast/ASTType';
import {ASTRootStatement} from './ast/ASTRootStatement';
%}

# Root
start -> _ root_statement (__ root_statement):* _
    {% ([,first, others]) => [first, ...others.map((v: any[]) => v[1] as ASTRootStatement)] %}

root_statement -> 
      struct_decl {% id %}
    | enum_decl {% id %}

# Struct and it's members
struct_decl -> "struct" __ identifier (_ template_values):? (_ extends_decl):? _ "{" _ 
        (size_decl _):?
        (struct_member _):*
    "}" 
    {% ([ , ,name,template,ext, , , ,size,members]) => new ASTStruct(name, template?template[1]:null, ext?ext[1]:null, size, members.map((v: any[]) => v[0] as ASTMember)) %}

extends_decl -> ":" _ type (_ "," _ type):* {% ([,,first,others]) => {
    let res = [first];
    if (others) for (let o of others) res.push(o[3]);
    return res;
} %}

size_decl -> "size" __ int 
    {% ([,,v]) => v %}

struct_member -> type __ identifier (__ int):?
    {% ([type, ,name,offset]) => new ASTMember(type, name, offset?offset[1]:null) %}

type -> pointer_indicator identifier template_values:? array_size:? 
    {% ([ptr, name, template, array_size]) => new ASTType(ptr, name, template, array_size) %}

pointer_indicator -> ("*" _):? {% ([v]) => !!v %}

array_size -> "[" _ int _ "]" 
    {% ([,,v]) => v %}

# Enum and it's values
enum_decl -> "enum" __ identifier _ (":" _ identifier _):? "{" _
        (enum_value (_ "," _ enum_value):*):?
    _ "}" 
    {% ([ , ,name, , ext, , , values]) => new ASTEnum(name, [values[0],...values[1].map((v) => v[3])], ext?ext[2]:null) %}

enum_value -> identifier (_ "=" _ int):? 
    {% ([name, value]) => new ASTEnumValue(name, value?value[3]:null) %}

# templating
template_values -> "<" _ identifier _ ("," _ identifier _):* ">"
    {% (arr) => [arr[2],...arr[4].map((v) => v[2])] %}

#primitives

identifier -> %identifier {% id %}

_ -> null | __
__ -> (%ws | %comment):+ {% () => null %}

int -> 
      %hex_int {% ([v]) => {return{type: 'hex', value: parseInt(v)};} %}
    | %binary_int {% ([v]) => {return{type: 'binary', value: parseInt(v)};} %}
    | %decimal_int {% ([v]) => {return{type: 'decimal', value: parseInt(v)};} %}
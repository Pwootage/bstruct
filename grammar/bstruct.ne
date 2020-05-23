@{% const lexer = require('./lexer'); %}
@{% const _s = require('./value.js'); %}
@{% function _l(n) { return (arr) => arr[n || 0]; } %}
@{% function _v(n) { return (arr) => arr[n || 0].value; } %}
@lexer lexer

# Root
start -> _ root_statement (__ root_statement):* _
    {% ([,first, others]) => [first, ...others.map(([,v]) => v)] %}

root_statement -> 
      struct_decl {% id %}
    | enum_decl {% id %}

# Struct and it's members
struct_decl -> "struct" __ identifier (_ template_values):? (_ extends_decl):? _ "{" _ 
        (size_decl _):?
        (struct_member _):*
    "}" 
    {% ([ , ,name,template,ext, , , ,size,members]) => {
        return {type: 'struct', name, template:template?template[1]:null, ext:ext?ext[1]:null, size, members:members.map(([v]) => v)};
    } %}

extends_decl -> ":" _ type (_ "," _ type):* {% ([,,first,others]) => {
    let res = [first];
    if (others) for (let o of others) res.push(o[3]);
    return res;
} %}

size_decl -> "size" __ templatable_int {% _l(2) %}

struct_member -> type __ identifier (__ templatable_int):?
    {% ([type, ,name,offset]) => {
        return {type: 'member', member_type:type,name,offset:offset?offset[1]:0}
    } %}

type -> pointer_indicator identifier template_values:? array_size:? 
    {% _s('type', ['pointer','name','template','array_size']) %}

pointer_indicator -> ("*" _):? {% ([v]) => !!v %}

array_size -> "[" _ templatable_int _ "]" {% _l(2) %}

# Enum and it's values
enum_decl -> "enum" __ identifier _ (":" _ identifier _):? "{" _
        (enum_value (_ "," _ enum_value):*):?
    _ "}" {% ([ , ,name, , ext, , , values]) => {
        return {type: 'enum', name, values:[values[0],...values[1].map(([ , , ,v]) => v)], ext:ext?ext[2]:null};
    } %}

enum_value -> identifier (_ "=" _ int):? {% ([name, value]) => {
        return {type: 'enum_value', name: name, value:value?value[3]:null};
    }%}

# templating
template_values -> "<" _ identifier _ ("," _ identifier _):* ">"
    {% ([ , ,first, ,others]) => [first,...others.map(([,,v])=> v)] %}

templatable_int -> 
      int {% id %}
    | identifier {% id %}

#primitives

identifier -> %identifier {% id %}

_ -> null | %ws {% () => null %}
__ -> %ws {% () => null %}

int -> %int {% id %}
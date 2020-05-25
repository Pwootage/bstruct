import { ASTInt } from "../ast/ASTInt";
import { ASTIdentifier } from "../ast/ASTIdentifier";
import { TypeLookup } from "./TypeLookup";
export type BPrimitive = {
    type: 'primitive';
    name: ASTIdentifier;
    size: ASTInt;
};
function gen_id(name: string): ASTIdentifier {
    return {
        type: 'identifier',
        value: name,
        text: name,
        offset: -1,
        line: -1,
        col: -1,
        lineBreaks: 0
    };
}
export const PU8: BPrimitive = { type: 'primitive', name: gen_id('u8'), size: { type: 'decimal', value: 1 } };
export const PU16: BPrimitive = { type: 'primitive', name: gen_id('u16'), size: { type: 'decimal', value: 2 } };
export const PU32: BPrimitive = { type: 'primitive', name: gen_id('u32'), size: { type: 'decimal', value: 4 } };
export const PU64: BPrimitive = { type: 'primitive', name: gen_id('u64'), size: { type: 'decimal', value: 8 } };
export const PI8: BPrimitive = { type: 'primitive', name: gen_id('i8'), size: { type: 'decimal', value: 1 } };
export const PI16: BPrimitive = { type: 'primitive', name: gen_id('i16'), size: { type: 'decimal', value: 2 } };
export const PI32: BPrimitive = { type: 'primitive', name: gen_id('i32'), size: { type: 'decimal', value: 4 } };
export const PI64: BPrimitive = { type: 'primitive', name: gen_id('i64'), size: { type: 'decimal', value: 8 } };
export const PF32: BPrimitive = { type: 'primitive', name: gen_id('f32'), size: { type: 'decimal', value: 4 } };
export const PF64: BPrimitive = { type: 'primitive', name: gen_id('f64'), size: { type: 'decimal', value: 8 } };
export const primitives: BPrimitive[] = [
    PU8,
    PU16,
    PU32,
    PU64,
    PI8,
    PI16,
    PI32,
    PI64,
    PF32,
    PF64
];

export const primitiveLookup = new TypeLookup<BPrimitive>();
primitives.forEach(v => primitiveLookup.register(v));
import { ASTEnum } from "../ast/ASTEnum";
import { ASTInt } from "../ast/ASTInt";
import { ASTIdentifier } from "../ast/ASTIdentifier";

export class BEnumValue {
    constructor(
        public name: ASTIdentifier,
        public value: ASTInt
    ) {
    }
}

export class BEnum {
    values: BEnumValue[] = []
    constructor(
        public name: ASTIdentifier,
        public ext: BPrimitive
    ) {
    }

    registerValue(name: ASTIdentifier, value: ASTInt | null = null) {
        if (value == null) {
            if (this.values.length > 0) {
                let lastVal = this.values[this.values.length - 1].value;
                value = {type: lastVal.type, value: lastVal.value + 1};
            } else {
                value = {type: 'decimal', value: 0};
            }
        }
        this.values.push(new BEnumValue(name, value))
    }
}


export class BStruct {
    size: ASTInt | null = null;
    constructor(
        public name: ASTIdentifier
    ) {
    }
}

export type BPrimitive = {type: 'primitive', name: ASTIdentifier, size: ASTInt};

function gen_id(name: string): ASTIdentifier {
    return {
        type: 'identifier',
        value: name,
        text: name,
        offset: -1,
        line: -1,
        col: -1,
        lineBreaks: 0
    }
}

export const PU8: BPrimitive = { type: 'primitive', name: gen_id('u8'), size: {type: 'decimal', value: 1} };
export const PU16: BPrimitive = { type: 'primitive', name: gen_id('u16'), size: {type: 'decimal', value: 2} };
export const PU32: BPrimitive = { type: 'primitive', name: gen_id('u32'), size: {type: 'decimal', value: 4} };
export const PU64: BPrimitive = { type: 'primitive', name: gen_id('u64'), size: {type: 'decimal', value: 8} };
export const PI8: BPrimitive = { type: 'primitive', name: gen_id('i8'), size: {type: 'decimal', value: 1} };
export const PI16: BPrimitive = { type: 'primitive', name: gen_id('i16'), size: {type: 'decimal', value: 2} };
export const PI32: BPrimitive = { type: 'primitive', name: gen_id('i32'), size: {type: 'decimal', value: 4} };
export const PI64: BPrimitive = { type: 'primitive', name: gen_id('i64'), size: {type: 'decimal', value: 8} };
export const PF32: BPrimitive = { type: 'primitive', name: gen_id('f32'), size: {type: 'decimal', value: 4} };
export const PF64: BPrimitive = { type: 'primitive', name: gen_id('f64'), size: {type: 'decimal', value: 8} };

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

interface NamedValue {
    name: ASTIdentifier;
}
export class TypeLookup<T extends NamedValue> {
    private table = new Map<string, T>();
    constructor() {
    }
    register(v: T) {
        this.table.set(v.name.value, v);
    }
    lookup(id: ASTIdentifier): T | null {
        return this.table.get(id.value) ?? null;
    }
}

export const primitiveLookup = new TypeLookup<BPrimitive>();
primitives.forEach(v => primitiveLookup.register(v));

export type BType = BEnum | BStruct | BPrimitive;
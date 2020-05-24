import { ASTRootStatement } from "./ast/ASTRootStatement";
import { ASTStruct } from "./ast/ASTStruct";
import { ASTEnum } from "./ast/ASTEnum";
import { Token } from "nearley";
import { ASTIdentifier } from "./ast/ASTIdentifier";
import { ASTInt } from "./ast/ASTInt";
import { lookup } from "dns";
import { ASTMember } from "./ast/ASTMember";
import { ASTTemplatableInt } from "./ast/ASTTemplatableInt";

type BPrimitive = {type: 'primitive', name: ASTIdentifier, size: ASTInt};
type BDefinition = ASTStruct | ASTEnum | BPrimitive;

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

function gen_int(size: number): ASTInt {
    return {
        type: 'decimal',
        value: size
    };
}

const primitives: BPrimitive[] = [
    { type: 'primitive', name: gen_id('u8'), size: gen_int(1) },
    { type: 'primitive', name: gen_id('u16'), size: gen_int(2) },
    { type: 'primitive', name: gen_id('u32'), size: gen_int(4) },
    { type: 'primitive', name: gen_id('u64'), size: gen_int(8) },
    { type: 'primitive', name: gen_id('i8'), size: gen_int(1) },
    { type: 'primitive', name: gen_id('i16'), size: gen_int(2) },
    { type: 'primitive', name: gen_id('i32'), size: gen_int(4) },
    { type: 'primitive', name: gen_id('i64'), size: gen_int(8) },
    { type: 'primitive', name: gen_id('f32'), size: gen_int(4) },
    { type: 'primitive', name: gen_id('f64'), size: gen_int(8) },
];

class TypeLookup {
    private table = new Map<string, BDefinition>();

    constructor() {
    }

    register(v: BDefinition) {
        this.table.set(v.name.value, v);
    }

    lookup(id: ASTIdentifier): BDefinition | null {
        return this.table.get(id.value) ?? null;
    }

    lookupSize(id: ASTIdentifier): ASTTemplatableInt | null {
        let v = this.table.get(id.value);
        if (v == null) return null;
        if (v instanceof ASTEnum) {
            if (v.ext == null) {
                return gen_int(4);
            } else {
                return this.lookupSize(v.ext);
            }
        } else {
            return v.size;
        }
    }
}

export class Linker {
    structs: ASTStruct[] = [];
    enums: ASTEnum[] = [];
    
    lookup = new TypeLookup();

    constructor(
        statements: ASTRootStatement[]
    ) {
        for (let statement of statements) {
            if (statement instanceof ASTEnum) {
                this.enums.push(statement)
                this.lookup.register(statement);
            } else {
                this.structs.push(statement)
                this.lookup.register(statement);
            }
        }
    }

    link() {
        
    }

    private linkPass() {

    }
}
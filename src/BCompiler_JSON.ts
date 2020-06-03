import { BEnum } from "./build/BEnum";
import { BStruct, BStructMember } from "./build/BStruct";

export interface CompiledEnum {
    name: string;
    size: number;
    values: CompiledEnumValue[];
}

export interface CompiledEnumValue {
    name: string;
    value: number;
}

export interface CompiledStruct {
    name: string;
    size: number;
    extends?: string[];
    members: CompiledMember[];
}

export interface CompiledMember {
    name: string;
    type: string;
    offset: number;
    bit?: number;
    bitLength?: number;
    arrayLength? :number;
    pointer?: boolean;
}

export class BCompiler_JSON {
    constructor() {
    }

    compileEnum(e: BEnum): CompiledEnum {
        return {
            name: e.name.value,
            size: e.size.value,
            values: e.values.map(v => {
                return {
                    name: v.name.value,
                    value: v.value.value
                };
            })
        };
    }

    compileStruct(s: BStruct): CompiledStruct {
        let res: CompiledStruct = {
            name: s.name.value,
            size: s.size!!.value,
            members: s.members.map(v => this.compileMember(v))
        };

        if (s.ext.length>0)  {
            res.extends = s.ext.map(v => v.name.value);
        }
        return res;
    }

    private compileMember(m: BStructMember): CompiledMember {
        let res: CompiledMember = {
            name: m.name.value,
            type: m.type.name.value,
            offset: m.offset.value,
            bit: m.bit?.value,
            bitLength: m.bitLength?.value
        };
        if (m.pointer) {
            res.pointer = true;
        }
        if (m.arrayLength) {
            res.arrayLength = m.arrayLength;
        }
        return res;
    }
}
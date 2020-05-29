import { BEnum } from "./build/BEnum";
import { BStruct, BStructMember } from "./build/BStruct";

export class BCompiler_010 {
    primitiveMap = {
        'i8': 'byte',
        'i16': 'int16',
        'i32': 'int32',
        'i64': 'int64',
        'u8': 'ubyte',
        'u16': 'uint16',
        'u32': 'uint32',
        'u64': 'uint64',
        'f32': 'float',
        'f64': 'double'
    }

    private compiledStructs = new Set<string>();
    private structLookup = new Map<string, BStruct>();

    constructor(
        private enums: BEnum[], 
        private structs: BStruct[]
    ) {
        for (const struct of structs) {
            this.structLookup.set(struct.name.value, struct);
        }
    }

    compile(): string {
        let res = `// generated by bstructc ${new Date().toISOString()}\n`;
        res += 'BigEndian();\n';
        res += 'DisplayFormatHex();\n';
        // enums first

        for (const e of this.enums) {
            res += this.compileEnum(e);
        }

        for (const e of this.structs) {
            res += this.compileStruct(e);
        }

        return res;
    }

    private compileEnum(e: BEnum): string {
        let res = '';
        res += `enum <${this.primitiveMap[e.ext.name.value]}> ${e.name} { \n`;
        for (const v of e.values) {
            res += `\t${e.name}_${v.name.value} = ${v.value.value},\n`;
        }
        res += `};\n`;
        return res;
    }

    private compileStruct(s: BStruct): string {
        if (this.compiledStructs.has(s.name.value)) {
            return ''; // Alaredy compiled
        }
        this.compiledStructs.add(s.name.value);
        let res = '';
        // Get the deps in first
        for (const m of s.members) {
            const type = this.structLookup.get(m.type.name.value);
            if (type != null) {
                res += this.compileStruct(type);
            }
        }

        if (s.ext && s.ext.length > 0) {
            for (const e of s.ext) {
                const type = this.structLookup.get(e.name.value);
                if (type != null) {
                    res += this.compileStruct(type);
                }
            }
        }

        res += `struct ${this.compileType(s.name.value)};  /* ${s.name.value} */\n`
        res += `typedef struct {\n`;
        res += '\tlocal int _sstart = FTell();\n';

        if (s.ext && s.ext.length > 0) {
            for (const e of s.ext) {
                res += `\tFSeek(_sstart + 0); `
                res += `\t${e.name.value} super;\n`;
            }
        }
        
        for (const m of s.members) {
            res += this.compileMember(m);
        }

        res += `\tFSeek(_sstart + ${s.size?.value});\n`

        res += `} ${this.compileType(s.name.value)} <size=${s.size!!.value}>;  /* ${s.name.value} */\n`;
        return res;
    }

    private compileMember(m: BStructMember): string {
        let res = '';
        res += `\tFSeek(_sstart + ${m.offset.value}); `

        let t = this.compileType(m.type.name.value);

        if (m.pointer) {
            res += `local uint32 _p_${m.name.value} = ReadUInt() & 0x7FFFFFFF; `
            // res += `Printf("ptr value ${m.name.value}: %x|%x\n",_sstart + ${m.offset.value}, _p_${m.name.value}); `
            res += `FSeek(_p_${m.name.value});`
            res += `\t${t} p_${m.name.value}; /* ${m.type.name.value} */\n`
        } else if (m.arrayLength) {
            res += `\t${t} ${m.name.value}[${m.arrayLength}]; /* ${m.type.name.value} */\n`
        } else {
            res += `\t${t} ${m.name.value}; /* ${m.type.name.value} */\n`
        }

        // let res: CompiledMember = {
        //     name: m.name.value,
        //     type: m.type.name.value,
        //     offset: m.offset.value
        // };
        // if (m.pointer) {
        //     res.pointer = true;
        // }
        // if (m.arrayLength) {
        //     res.arrayLength = m.arrayLength;
        // }
        return res;
    }

    private compileType(typeName: string) {
        let res: string = this.primitiveMap[typeName] || typeName;
        // res = res
        //     .replace(/</g, '_s_')
        //     .replace(/>/g, '_e_')
        //     .replace(/[, ]+/g, '_c_')
        //     .replace(/::/g, '_m_');
        res = res
            .replace(/</g, '_s')
            .replace(/>/g, 'e_')
            .replace(/[, ]+/g, '_')
            .replace(/::/g, '_');
        return res;
    }
}

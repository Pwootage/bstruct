import { BEnum } from "./build/BEnum";
import { ASTInt } from "./ast/ASTInt";
import { BStruct, BStructMember } from "./build/BStruct";
import { BPointer, BArray } from "./build/BType";

export class BCompiler_Typescript {
    constructor() {
    }

    compileInt(i: ASTInt): string {
        switch(i.type) {
            case 'binary':
                return '0b' + i.value.toString(2)
            case 'decimal':
                return i.value.toString(10);
            case 'hex':
                return '0x' + i.value.toString(16)
        }
    }

    compileEnum(e: BEnum): string {
        let res = '';
        res += `enum ${e.name.value} {\n`;
        for (let v of e.values) {
            res += `\t${v.name.value} = ${this.compileInt(v.value)},\n`
        }
        res += `}\n`;
        return res;
    }

    compileStruct(s: BStruct): string {
        let res = '';
        res += `class ${s.name.value} {\n`;
        res += `\tsize = ${this.compileInt(s.size!!)};\n`
        // Superclasses
        res += this.compileSuperCalls(s.ext);
        // Members
        for (let m of s.members) {
            res += this.compileMember(m);
        }
        res += `}\n`;
        return res;
    }

    private compileMember(m: BStructMember) {
        let res = '';
        if (m.type instanceof BPointer) {
            let pointerType = `BPointer<${m.type.type.name.value}>`;
            res += `\t${m.name.value}(): ${pointerType} {\n`;
            res += `\t\treturn new ${pointerType}(this.offset + ${this.compileInt(m.offset)});\n`;
            res += `\t}\n`;
        } else if (m.type instanceof BArray) {
            let arrayType = `BArray<${m.type.type.name.value}>`;
            res += `\t${m.name.value}(): ${arrayType} {\n`;
            res += `\t\treturn new ${arrayType}(this.offset + ${this.compileInt(m.offset)}, ${this.compileInt(m.type.length)});\n`;
            res += `\t}\n`;
        } else {
            res += `\t${m.name.value}(): ${m.type.name.value} {\n`;
            res += `\t\treturn new ${m.type.name.value}(this.offset + ${this.compileInt(m.offset)});\n`;
            res += `\t}\n`;
        }
        return res;
    }

    private compileSuperCalls(ext: BStruct[]): string {
        let res = '';
        for (let e of ext) {
            res += this.compileSuperCall(e);
            res += this.compileSuperCalls(e.ext);
        }
        return res;
    }

    private compileSuperCall(ext: BStruct): string {
        let res = '';
        res += `\tsuper_${ext.name.value}(): ${ext.name.value} {\n`;
        res += `\t\treturn new ${ext.name.value}(this.offset);\n`;
        res += `\t}\n`;
        return res;
    }
}
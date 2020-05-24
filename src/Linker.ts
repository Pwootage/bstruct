import { ASTRootStatement } from "./ast/ASTRootStatement";
import { ASTEnum } from "./ast/ASTEnum";
import { BStruct, BEnum, BPrimitive, TypeLookup, primitiveLookup, PU32, BType } from "./build/BType";

export class Linker {
    structs: BStruct[] = [];
    enums: BEnum[] = [];
    
    lookup = new TypeLookup<BType>();

    constructor() {}

    link(statements: ASTRootStatement[]) {
        for (let statement of statements) {
            if (statement instanceof ASTEnum) {
                this.linkEnum(statement);
            } else {
                //TODO
            }
        }
    }

    private linkEnum(astEnum: ASTEnum) {
        let ext: BPrimitive;
        if (astEnum.ext != null) {
            let primitive = primitiveLookup.lookup(astEnum.ext)
            if (
                primitive == null || 
                !(primitive.name.value[0] == 'i' || primitive.name.value[0] == 'u') 
             ) {
                throw new Error(`Must use an integer type as the superclass of an enum: ${JSON.stringify(astEnum)}`);
            }
            ext = primitive;
        } else {
            ext = PU32;
        }
        const res = new BEnum(astEnum.name, ext);

        for (let value of astEnum.values) {
            res.registerValue(value.name, value.value);
        }

        this.enums.push(res)
    }

    private linkPass() {

    }
}
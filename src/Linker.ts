import { ASTRootStatement } from "./ast/ASTRootStatement";
import { ASTEnum } from "./ast/ASTEnum";
import { BType, BPointer } from "./build/BType";
import { BStruct, BStructMember } from "./build/BStruct";
import { TypeLookup } from "./build/TypeLookup";
import { BPrimitive, PU32, primitiveLookup, primitives } from "./build/BPrimitive";
import { BEnum } from "./build/BEnum";
import { ASTStruct } from "./ast/ASTStruct";
import { ASTMember } from "./ast/ASTMember";
import { ASTInt } from "./ast/ASTInt";

export class Linker {
    structs: BStruct[] = [];
    enums: BEnum[] = [];
    
    lookup = new TypeLookup<BType>();

    private linkStack: BType[] = [];

    constructor() {
        primitives.forEach((v) => this.lookup.register(v));
    }

    link(statements: ASTRootStatement[]) {
        // pass 1: register structs, link enums
        for (let statement of statements) {
            if (statement instanceof ASTEnum) {
                this.linkEnum(statement);
            } else {
                this.registerStruct(statement);
            }
        }
        // pass 2: link structs
        for (let struct of this.structs) {
            this.linkStruct(struct);
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

        this.enums.push(res);
        this.lookup.register(res);
    }

    private registerStruct(astClass: ASTStruct) {
        const res = new BStruct(astClass, astClass.name);
        this.structs.push(res);
        this.lookup.register(res);
    }

    private linkStruct(struct: BStruct) {
        if (struct.linkCompleted) {
            return; // Already did this one
        }
        this.linkStack.push(struct)
        if (struct.linkStarted) {
            let errorMessage = this.linkStack.map(v => v.name.value).join('->');
            throw new Error(`Circular reference detected: ${errorMessage}`);
        }
        struct.linkStarted = true;
        // Link our parent(s)
        {
            if (struct.original.ext) {
                for (let s of struct.original.ext) {
                    if (s.pointer) {
                        throw new Error(`Can't extend a pointer`);
                    }
                    let type = this.lookup.lookup(s.name);
                    if (type == null) {
                        throw new Error(`Unknwon type supertype ${s.name.value}`);
                    }
                    if (!(type instanceof BStruct)) {
                        throw new Error(`Structs may only extend structs, not ${s.name.value}`);
                    }
                    this.linkStruct(type);
                    struct.ext.push(type);
                }
            }
        } 
        // Figure out the sizes/offsets of members
        {
            let lastMember: BStructMember | null = null;
            // Last member of our last parent is the previous member, if it exists
            for (let i = struct.ext.length - 1; i >= 0; i--) {
                let parent = struct.ext[i];
                if (parent.members.length > 0) {
                    lastMember = parent.members[parent.members.length - 1];
                }
            }
            for (let member of struct.original.members) {
                // Find the type
                let type = this.lookup.lookup(member.memberType.name);
                if (type == null) throw new Error(`Unknwon type ${member.memberType.name}`);
                if (member.memberType.pointer) {
                    type = new BPointer(type);
                }

                // Find the offset
                let offset = member.offset;
                if (offset == null) {
                    if (lastMember == null) {
                        offset = {type: 'decimal', value: 0};
                    } else {
                        if (lastMember.type instanceof BStruct) {
                            this.linkStruct(lastMember.type);
                        }
                        if (lastMember.type.size == null) {
                            throw new Error(`Failed to resolve size of ${struct.name.value}.${member.name.value}`);
                        }
                        offset = {
                            type: lastMember.offset.type, 
                            value: lastMember.offset.value + lastMember.type.size.value
                        };
                    }
                }
                //TODO
                let template = member.memberType.template;

                let newMember = new BStructMember(type, member.name, offset);
                struct.members.push(newMember);
                lastMember = newMember;
            }
        }
        // Figure out our size
        {
            if (struct.original.size !== null) {
                struct.size = struct.original.size
            } else if (struct.members.length == 0) {
                struct.size = {type: 'decimal', value: 0};
            } else {
                let lastMember = struct.members[struct.members.length - 1];
                if (lastMember.type instanceof BStruct) {
                    this.linkStruct(lastMember.type);
                }
                if (lastMember.type.size == null) {
                    throw new Error(`Failed to resolve the size of ${struct.name.value}.${lastMember.name.value}`);
                }
                struct.size = {
                    type: lastMember.offset.type, 
                    value: lastMember.offset.value + lastMember.type.size.value
                };
            }
        }
        this.linkStack.pop();
        struct.linkCompleted = true;
    }

    private linkPass() {

    }
}
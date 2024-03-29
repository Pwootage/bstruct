import { ASTRootStatement } from "./ast/ASTRootStatement";
import { ASTEnum } from "./ast/ASTEnum";
import { BType } from "./build/BType";
import { BStruct, BStructMember } from "./build/BStruct";
import { TypeLookup } from "./build/TypeLookup";
import { BPrimitive, PU32, primitiveLookup, primitives } from "./build/BPrimitive";
import { BEnum } from "./build/BEnum";
import { ASTStruct } from "./ast/ASTStruct";
import { ASTMember } from "./ast/ASTMember";
import { ASTInt } from "./ast/ASTInt";
import { ASTTemplateValues } from "./ast/ASTTemplateValues";
import { ASTIdentifier } from "./ast/ASTIdentifier";
import { stringify } from "querystring";
import { ASTType } from "./ast/ASTType";

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

        // pass 3: remove non-specialized templated structs
        this.structs = this.structs.filter((v) => !v.templated || v.specialized);
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
        if (struct.templated) {
            return; // Link templates only at specialization
        }

        this.linkStack.push(struct)
        if (struct.linkStarted) {
            let errorMessage = this.linkStack.map(v => v.name.value).join('->');
            throw new Error(`Circular reference detected: ${errorMessage}`);
        }
        struct.linkStarted = true;
        // Copy over the vtable if it exists
        struct.vtable = struct.original.vtable;
        // Link our parent(s)
        {
            if (struct.original.ext) {
                if (struct.original.ext.length > 1) {
                    throw new Error(`Multiple inhereitance doesn't work right now`);
                }
                for (let s of struct.original.ext) {
                    if (s.pointer) {
                        throw new Error(`Can't extend a pointer`);
                    }
                    if (s.template != null) {
                        throw new Error(`Extending templated classes is not currently supported`);
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
                let pointer = member.memberType.pointer;
                let arraySize: number | null = member.memberType.arraySize?.value;

                if (type == null) throw new Error(`Unknwon type ${member.memberType.name.value}`);
                if (member.memberType.template) {
                    if (!(type instanceof BStruct)) {
                        throw new Error(`Can't specialize non-struct ${type.name.value}; ${struct.name.value}.${member.name.value}`);
                    }
                    
                    try {
                        type = this.specializeStruct(type, member.memberType.template);
                    } catch (err: any) {
                        throw new Error(`Error when specializing ${struct.name.value}.${member.name.value}: ${err.stack}`);
                    }
                }

                // Find the offset
                let offset = member.offset;
                if (offset == null) {
                    if (lastMember == null) {
                        offset = {type: 'decimal', value: 0};
                    } else {
                        offset = {
                            type: lastMember.offset.type, 
                            value: lastMember.offset.value + this.getMemberSize(lastMember)
                        };
                    }
                }

                let newMember = new BStructMember(
                    type, 
                    member.name,
                    offset,
                    member.bit,
                    member.bitLength,
                    pointer,
                    arraySize
                );
                struct.members.push(newMember);
                lastMember = newMember;
            }
        }
        // Figure out our size
        {
            if (struct.name.text == 'CScriptPlayerActor') {
                debugger;
            }
            if (struct.original.size !== null) {
                struct.size = struct.original.size
            } else if (struct.members.length == 0) {
                // Size is parent size, if ti exists
                if (struct.ext.length >= 1) {
                    const parent = struct.ext[struct.ext.length - 1];
                    struct.size = {
                        type: parent.size!.type, 
                        value: parent.size!.value
                    };
                } else {
                    struct.size = {type: 'decimal', value: 0};
                }
            } else {
                let lastMember = struct.members[struct.members.length - 1];
                struct.size = {
                    type: lastMember.offset.type, 
                    value: lastMember.offset.value + this.getMemberSize(lastMember)
                };
            }
        }
        this.linkStack.pop();
        struct.linkCompleted = true;
    }

    private getMemberSize(lastMember: BStructMember): number {
        if (lastMember.type instanceof BStruct) {
            this.linkStruct(lastMember.type);
        }

        if (lastMember.pointer) {
            return 4;
        }
        
        if (lastMember.type.size == null) {
            throw new Error(`Failed to resolve the size of ${lastMember.name.value}`);
        }
        let size = lastMember.type.size.value;
        if (lastMember.arrayLength != null && lastMember.arrayLength > 0) {
            size = size * lastMember.arrayLength;
        }
        return size;
    }

    private specializeStruct(type: BStruct, template: ASTTemplateValues): BStruct {
        if (!type.templated || type.original.template == null) {
            throw new Error(`Attempt to specialize class ${type.name.value}, which is not specializable`);
        }
        if (type.original.template.length != template.length) {
            throw new Error(`Incorrect parameter count specializing ${type.name.value}`);
        }
        let specializedIdentifier: ASTIdentifier = this.getSpecializedIdentifier(type.name, template);
        let res = this.lookup.lookup(specializedIdentifier);
        if (res != null) {
            if (!(res instanceof BStruct) || !res.specialized) {
                throw new Error(`Existing non-specialized type ${res.name.value}`);
            }
            return res;
        }
        let mappings = new Map<string, ASTIdentifier>()
        for (let i = 0; i < template.length; i++) {
            let target = template[i];
            let destStruct = this.lookup.lookup(target.name);
            if (destStruct == null) {
                throw new Error(`Unknown type ${target.name.value}`);
            }
            if (target.template != null) {
                if (!(destStruct instanceof BStruct)) {
                    throw new Error(`Can't specialize non-struct ${type.name.value}`);
            }

                destStruct = this.specializeStruct(destStruct, target.template);
            }
            mappings.set(type.original.template[i].value, destStruct?.name);
        }
        res = new BStruct(
            new ASTStruct(
                specializedIdentifier, 
                null,
                type.original.ext,
                type.original.size,
                type.original.vtable,
                type.original.members.map(member => {
                    const newType = this.substituteTypes(mappings, member.memberType);
                    return new ASTMember(
                        newType,
                        member.name,
                        member.offset,
                        member.bit,
                        member.bitLength
                    )
                })
            ),
            specializedIdentifier
        );
        res.specialized = true;
        this.structs.push(res);
        this.lookup.register(res);
        this.linkStruct(res);
        return res;
    }

    private substituteTypes(mappings: Map<string, ASTIdentifier>, typ: ASTType): ASTType {
        let typeName = mappings.get(typ.name.value)
            ?? typ.name;
        let template: ASTTemplateValues | null = null;
        if (typ.template) {
            template = typ.template?.map(v => this.substituteTypes(mappings, v))
        }
        const newType = new ASTType(
            typ.pointer, 
            typeName,
            template,
            typ.arraySize
        );
        return newType;
    }

    private getSpecializedIdentifier(name: ASTIdentifier, template: ASTTemplateValues): ASTIdentifier {
        return {
            ...name,
            value: `${name.value}<${template.map(v => {
                if (v.template) {
                    return this.getSpecializedIdentifier(v.name, v.template).value
                } else {
                    return v.name.value
                }
            }).join(', ')}>`
        };
    }
}
import { BEnum } from "./BEnum";
import { BPrimitive } from "./BPrimitive";
import { BStruct } from "./BStruct";
import { ASTInt } from "../ast/ASTInt";
import { ASTIdentifier } from "../ast/ASTIdentifier";

export class BPointer {
    size: ASTInt = {type: 'decimal', value: 4};
    name: ASTIdentifier;
    constructor(
        public type: BType
    ) {
        this.name = {
            ...type.name,
            value: '*' + type.name.value
        };
    }
}

export type BType = BEnum | BStruct | BPrimitive | BPointer;
import { ASTIdentifier } from "./ASTIdentifier";
import { ASTInt } from "./ASTInt";

export class ASTEnumValue {
    constructor(
        public name: ASTIdentifier,
        public value: ASTInt
    ) {
    }
}

export class ASTEnum {
    constructor(
        public name: ASTIdentifier,
        public values: ASTEnumValue[],
        public ext: ASTIdentifier | null
    ) {
    }
}
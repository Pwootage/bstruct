import { ASTInt } from "../ast/ASTInt";
import { ASTIdentifier } from "../ast/ASTIdentifier";
import { BType } from "./BType";
import { ASTStruct } from "../ast/ASTStruct";

export class BStruct {
    specialized = false;
    linkStarted = false;
    linkCompleted = false;
    size: ASTInt | null = null;
    templated = false;
    ext: BStruct[] = [];
    members: BStructMember[] = [];

    constructor(public original: ASTStruct, public name: ASTIdentifier) {
    }
}

export class BStructMember {
    constructor(
        public type: BType,
        public name: ASTIdentifier,
        public offset: ASTInt,
        public pointer: boolean,
        public arrayLength: number | null
    ) {
    }
}
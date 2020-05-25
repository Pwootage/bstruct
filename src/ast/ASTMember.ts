import { ASTType } from "./ASTType";
import { ASTIdentifier } from "./ASTIdentifier";
import { ASTInt } from "./ASTInt";

export class ASTMember {
    constructor(
        public memberType: ASTType,
        public name: ASTIdentifier,
        public offset: ASTInt | null
    ) {

    }
}
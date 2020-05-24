import { ASTType } from "./ASTType";
import { ASTIdentifier } from "./ASTIdentifier";
import { ASTTemplatableInt } from "./ASTTemplatableInt";

export class ASTMember {
    constructor(
        public memberType: ASTType,
        public name: ASTIdentifier,
        public offset: ASTTemplatableInt | null
    ) {

    }
}
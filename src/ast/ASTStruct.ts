import { ASTIdentifier } from "./ASTIdentifier";
import { ASTExtends } from "./ASTExtends";
import { ASTInt } from "./ASTInt";
import { ASTMember } from "./ASTMember";
import { ASTTemplateDefs } from "./ASTTemplateDefs";

export class ASTStruct {
    constructor(
        public name: ASTIdentifier,
        public template: ASTTemplateDefs | null,
        public ext: ASTExtends | null,
        public size: ASTInt | null,
        public members: ASTMember[]
    ) {
    }
}
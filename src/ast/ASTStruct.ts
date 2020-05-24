import { ASTIdentifier } from "./ASTIdentifier";
import { ASTTemplateValues } from "./ASTTemplateValues";
import { ASTExtends } from "./ASTExtends";
import { ASTInt } from "./ASTInt";
import { ASTTemplatableInt } from "./ASTTemplatableInt";
import { ASTMember } from "./ASTMember";

export class ASTStruct {
    constructor(
        public name: ASTIdentifier,
        public template: ASTTemplateValues | null,
        public ext: ASTExtends | null,
        public size: ASTTemplatableInt | null,
        public members: ASTMember[]
    ) {
    }
}
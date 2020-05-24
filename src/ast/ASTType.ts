import { ASTIdentifier } from "./ASTIdentifier";
import { ASTTemplateValues } from "./ASTTemplateValues";
import { ASTTemplatableInt } from "./ASTTemplatableInt";

export class ASTType {
    constructor(
        public pointer: boolean,
        public name: ASTIdentifier,
        public template: ASTTemplateValues | null,
        public arraySize: ASTTemplatableInt
    ) {

    }
}
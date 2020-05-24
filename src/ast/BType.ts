import { BIdentifier } from "./BIdentifier";
import { BTemplateValues } from "./BTemplateValues";
import { BTemplatableInt } from "./BTemplatableInt";

export class BType {
    constructor(
        public pointer: boolean,
        public name: BIdentifier,
        public template: BTemplateValues | null,
        public arraySize: BTemplatableInt
    ) {

    }
}
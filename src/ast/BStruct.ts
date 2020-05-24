import { BIdentifier } from "./BIdentifier";
import { BTemplateValues } from "./BTemplateValues";
import { BExtends } from "./BExtends";
import { BInt } from "./BInt";
import { BTemplatableInt } from "./BTemplatableInt";
import { BMember } from "./BMember";

export class BStruct {
    constructor(
        public name: BIdentifier,
        public template: BTemplateValues | null,
        public ext: BExtends | null,
        public size: BTemplatableInt | null,
        public members: BMember[]
    ) {

    }
}
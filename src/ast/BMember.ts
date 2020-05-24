import { BType } from "./BType";
import { BIdentifier } from "./BIdentifier";
import { BTemplatableInt } from "./BTemplatableInt";

export class BMember {
    constructor(
        public memberType: BType,
        public name: BIdentifier,
        public offset: BTemplatableInt | null
    ) {

    }
}
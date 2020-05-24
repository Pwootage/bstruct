import { BIdentifier } from "./BIdentifier";
import { BInt } from "./BInt";

export class BEnumValue {
    constructor(
        public name: BIdentifier,
        public value: BInt
    ) {
    }
}

export class BEnum {
    constructor(
        public name: BIdentifier,
        public values: BEnumValue[],
        public ext: BIdentifier
    ) {
    }
}
import { ASTInt } from "../ast/ASTInt";
import { ASTIdentifier } from "../ast/ASTIdentifier";
import { BPrimitive } from "./BPrimitive";

export class BEnumValue {
    constructor(
        public name: ASTIdentifier,
        public value: ASTInt
    ) {
    }
}

export class BEnum {
    values: BEnumValue[] = [];
    size: ASTInt;
    constructor(public name: ASTIdentifier, public ext: BPrimitive) {
        this.size = ext.size;
    }

    registerValue(name: ASTIdentifier, value: ASTInt | null = null) {
        if (value == null) {
            if (this.values.length > 0) {
                let lastVal = this.values[this.values.length - 1].value;
                value = { type: lastVal.type, value: lastVal.value + 1 };
            }
            else {
                value = { type: 'decimal', value: 0 };
            }
        }
        this.values.push(new BEnumValue(name, value));
    }
}

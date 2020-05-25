import { ASTIdentifier } from "../ast/ASTIdentifier";
interface NamedValue {
    name: ASTIdentifier;
}
export class TypeLookup<T extends NamedValue> {
    private table = new Map<string, T>();
    constructor() {
    }
    register(v: T) {
        this.table.set(v.name.value, v);
    }
    lookup(id: ASTIdentifier): T | null {
        return this.table.get(id.value) ?? null;
    }
}

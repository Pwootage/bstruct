import {Linker} from "./Linker";
import {BCompiler_JSON} from "./BCompiler_JSON";
import {BCompiler_010} from "./BCompiler_010";
import {ASTRootStatement} from "./ast/ASTRootStatement";
import {Grammar, Parser} from "nearley";
import grammar from "./bstruct-grammar";

export type BstructFormat = 'json' | '010';

export function compileBstructSources(srcs: string[], format: BstructFormat) {
    const allStatements = srcs.flatMap(src => compileSource(src));

    // Parsed to an AST, now convert those to linked/specialized classes
    const linker = new Linker();
    linker.link(allStatements);

    // Alrighty, time to output
    if (format == 'json') {
        let compiler = new BCompiler_JSON();
        let enums = linker.enums.map(v => compiler.compileEnum(v));
        let structs = linker.structs.map(v => compiler.compileStruct(v));
        let json = {
            enums: enums,
            structs: structs
        };
        let output = JSON.stringify(json, null, 2);
        return output;
    } else if (format == '010') {
        let compiler = new BCompiler_010(linker.enums, linker.structs);
        let output = compiler.compile();
        // if (args["suffix-file"]) {
        //     output += await fs.readFile(args["suffix-file"]);
        // }
        return output;
    } else {
        console.error(`Unknown output format ${format}`);
    }
}

function compileSource(src: string): ASTRootStatement[] {
    const parser = new Parser(Grammar.fromCompiled(grammar as any));
    parser.feed(src);
    return parser.results[0];
}
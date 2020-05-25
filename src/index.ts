import {Parser, Grammar} from 'nearley';
import grammar from './bstruct-grammar';
import fs, { link } from 'fs';
import yargs from 'yargs';
import { ASTRootStatement } from './ast/ASTRootStatement';
import glob from 'glob';
import {promisify} from 'util';
import {lexer} from './bstruct-lexer';
import { Linker } from './Linker';
import { BCompiler_Typescript } from './BCompiler_Typescript';
const globPromise = promisify(glob);

function compileSource(src: string): ASTRootStatement[] {
    lexer.reset(src);
    for (let t of lexer) {
        console.log(t);
    }

    const parser = new Parser(Grammar.fromCompiled(grammar as any));
    parser.feed(src);
    return parser.results[0];
}

async function main() {
    const args = yargs
        .option('i', {
            demandOption: true,
            type: 'string',
            describe: 'Input file globs',
            array: true
        })
        .option('o', {
            alias: 'outDir',
            demandOption: true,
            type: 'string',
            describe: 'Output directory'
        })
        .help()
        .argv;
 
    const allFiles = (await Promise.all(
        args.i.map(v => globPromise(v))
    )).flat();
    const allStatements = (await Promise.all(
        allFiles.map(async file => {
            const src = await promisify(fs.readFile)(file, {encoding: 'utf-8'})
            return compileSource(src);
        })
    )).flat();
    
    console.log(allStatements);

    // Parsed to an AST, now convert those to linked/specialized classes
    const linker = new Linker();
    linker.link(allStatements);

    // Alrighty, time to output
    let compiler = new BCompiler_Typescript();
    let output = '';
    for (let e of linker.enums) {
        output += compiler.compileEnum(e);
    }
    for (let s of linker.structs) {
        output += compiler.compileStruct(s);
    }
    console.log(output);
}

main().then(() => {
    console.log("Done");
}).catch(err => {
    console.error("Error compiling", err.stack);
});
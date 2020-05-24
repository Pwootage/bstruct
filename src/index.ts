import {Parser, Grammar} from 'nearley';
import grammar from './bstruct-grammar';
import fs from 'fs';
import yargs from 'yargs';
import { BRootStatement } from './ast/BRootStatement';

function compileSource(src: string): BRootStatement[] {
    const parser = new Parser(Grammar.fromCompiled(grammar as any));
    parser.feed(src);
    return parser.results;
}

function main() {
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
    
    let src = fs.readFileSync('examples/example.bs', {encoding: 'utf-8'});
    let res = compileSource(src);
    console.log(res);
}

main();
#!/usr/bin/env node

import {Parser, Grammar} from 'nearley';
import grammar from './bstruct-grammar';
import fs from 'fs';
import yargs from 'yargs';
import { ASTRootStatement } from './ast/ASTRootStatement';
import glob from 'glob';
import {promisify} from 'util';
import { Linker } from './Linker';
import { BCompiler_JSON } from './BCompiler_JSON';
const globPromise = promisify(glob);

function compileSource(src: string): ASTRootStatement[] {
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
            alias: 'out-file',
            demandOption: true,
            type: 'string',
            describe: 'Output file'
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
    let compiler = new BCompiler_JSON();
    let enums = linker.enums.map(v => compiler.compileEnum(v));
    let structs = linker.structs.map(v => compiler.compileStruct(v));
    let json = {
        enums: enums,
        structs: structs
    };
    let output = JSON.stringify(json, null, 2);
    await promisify(fs.writeFile)(args.o, output);
}

main().then(() => {
    console.log("Done");
}).catch(err => {
    console.error("Error compiling", err.stack);
});
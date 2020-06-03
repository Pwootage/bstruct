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
import { deserialize } from 'v8';
import { BCompiler_010 } from './BCompiler_010';
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
        .option('suffix-file', {
            type: 'string',
            describe: 'File to append to the 010 output'
        })
        .option('format', {
            type: 'string',
            choices: ['json', '010'],
            describe: 'Format to write',
            default: 'json'
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

    // Parsed to an AST, now convert those to linked/specialized classes
    const linker = new Linker();
    linker.link(allStatements);

    // Alrighty, time to output
    if (args.format == 'json') {
        let compiler = new BCompiler_JSON();
        let enums = linker.enums.map(v => compiler.compileEnum(v));
        let structs = linker.structs.map(v => compiler.compileStruct(v));
        let json = {
            enums: enums,
            structs: structs
        };
        let output = JSON.stringify(json, null, 2);
        await promisify(fs.writeFile)(args.o, output);
    } else if (args.format == '010') {
        let compiler = new BCompiler_010(linker.enums, linker.structs);
        let output = compiler.compile();
        if (args["suffix-file"]) {
            output += fs.readFileSync(args["suffix-file"]);
        }
        await promisify(fs.writeFile)(args.o, output);
    } else {
        console.error(`Unknown output format ${args.format}`);
    }
}

main().then(() => {
    console.log("Done");
}).catch(err => {
    console.error("Error compiling", err.stack);
});
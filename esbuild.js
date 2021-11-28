require('esbuild').buildSync({
    entryPoints: ['src/BStruct.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['esnext'],
    format: 'esm',
    outfile: 'lib/BStruct.lib.js',
})
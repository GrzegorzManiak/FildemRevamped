// esbuild.config.js
const path = require('path');
const fs = require('fs');
const Zip = require('adm-zip');
const { exec } = require('child_process');
const uuid = 'FildemRevamped@grzegorz.ie';


const FMR_DEST = 'Gggm@grzegorz.ie';
const FMR_ROOT = path.join(process.cwd(), '../../dist/gnome');
const FMR_PACKAGE = path.join(process.cwd(), `./package/`);

console.log('FMR_ROOT', FMR_ROOT);
console.log('FMR_PACKAGE', FMR_PACKAGE);


console.log('Building extension');

require('esbuild').build({
    entryPoints: [
        {
            in: './src/extension.ts',
            out: './extension',
        },

        {
            in: './src/prefs.ts',
            out: './prefs',
        }
    ],
    bundle: true,
    external: [
        'resource:///*',
        'imports.gi/*',
        'gi:/*',
        '@girs/*'
    ],

    outdir: '../../dist/gnome',

    // -- GNOME Specifc options
    platform: 'node',
    format: 'esm',
    target: ['node14'],

}).catch(() => {
    console.log('Build failed');

}).then(() => {
    console.log('Build succeeded');

    // -- Get extension.js and prefs.js
    const extension = fs.readFileSync(path.join(FMR_ROOT, 'extension.js'), 'utf-8'),
        prefs = fs.readFileSync(path.join(FMR_ROOT, 'prefs.js'), 'utf-8'),
        zip = new Zip();

    // -- Add the contents of the dist folder to the zip
    zip.addLocalFolder(FMR_PACKAGE, '.');

    // -- Add the extension.js and prefs.js to the zip
    zip.addFile('extension.js', Buffer.alloc(extension.length, extension));
    zip.addFile('prefs.js', Buffer.alloc(prefs.length, prefs));

    // -- Save the zip
    zip.writeZip(path.join(FMR_ROOT, `${FMR_DEST}.zip`));
    console.log('Zip saved');
});
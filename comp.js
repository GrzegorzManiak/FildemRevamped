// -- Custom Webpack plugin that will compress the code into a valid gnome extension
//    and inject it into the extension folder
// FROM: https://github.com/gjsify/gnome-shell/blob/main/examples/hello-world/esbuild.js

const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const metadata = require("./gnome-src/metadata.json");
const { exec } = require("child_process");

const fmr_root = 'FildemRevamped@grzegorz.ie';
const src_path = path.join(__dirname, "gnome-src");

function gse_build(options) {
    console.log("Building Gnome Shell Extension");

    // -- Create the zip
    const zip = new AdmZip();
    const zipFilename = `${fmr_root}.zip`;

    // -- Compile schemas
    compile_schemas(zip).then(() => {
        console.log("Schemas compiled");


        // -- Files to copy over into the fmr_root folder
        const files = [
            "metadata.json",
            "stylesheet.css",
        ];

        // -- Copy files into the zip
        files.forEach((file) => {
            // -- Create the path
            const f_path = path.join(src_path, file);

            // -- Ensure the file exists, just skip it if it doesn't
            if (!fs.existsSync(f_path)) { return; }

            // -- Add the file to the zip
            zip.addLocalFile(f_path);
        });
        
        zip.addLocalFolder(fmr_root);
        zip.writeZip(zipFilename);
        console.log(`Build complete. Zip file: ${zipFilename}\n`);


        // -- Enable the extension
        const install_cmd = `gnome-extensions install -f ${metadata.uuid}.zip`;
        console.log(`Installing extension with: ${install_cmd}`);

        // -- Run the command
        exec(install_cmd, (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (error) { console.log(`error: ${error.message}`); }
        });
    });
}


function compile_schemas(zip) {
    const schemas_path = path.join(src_path, "schemas");

    return new Promise((resolve, reject) => {
        const schema_cmd = `glib-compile-schemas ${schemas_path}`;

        console.log(`Compiling schema with: ${schema_cmd}`);

        // -- Run the command
        exec(schema_cmd, (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (error) { 
                console.log(`error: ${error.message}`); 
                return reject();
            }

            // -- Check if the compiled schema exists
            const compiled_schema_path = path.join(schemas_path, "gschemas.compiled");
            if (!fs.existsSync(compiled_schema_path)) { 
                console.log("Compiled schema doesn't exist");
                return resolve();
            }

            // -- Add the schema to the zip
            zip.addLocalFile(path.join(schemas_path, "gschemas.compiled"));
            return resolve();
        });

        resolve();
    });
}

gse_build();
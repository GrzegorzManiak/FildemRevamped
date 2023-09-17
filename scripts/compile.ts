const path = require('path');
const fs = require('fs');
const zip = require('adm-zip');
const { exec } = require('child_process');
const uuid = 'FildemRevamped@grzegorz.ie';


/**
 * This script is injected at the end of the main extension bundle
 * Its used to expose the extension to gnome-shell, theres probably
 * a better way to do this but 5H Of webpack config later and I
 * still cant figure it out.
 */
const api_expose_script = `
    /**
     * INJECTED BY COMP.TS SCRIPT
     */

    function init(meta) {
        global.log('Initializing extension');
        lib.EntryPoint.init(meta);
    };

    function enable() {
        global.log('Enabling extension');
        lib.EntryPoint.enable();
    };

    function disable() {
        global.log('Disabling extension');
        lib.EntryPoint.disable();
    };
`;

const FMR_DEST = 'FildemRevamped@grzegorz.ie';
const FMR_ROOT = path.join(process.cwd(), 'gnome-src');
const copy_files = [
    "metadata.json",
    "stylesheet.css",
];



/**
 * @name build_zip
 * Builds the zip file for the extension, it adds all the 
 * files and directories that we know wont be modified later
 * on.
 * 
 * @returns {zip} The zip file
 */
const build_zip = (): typeof zip => {
    // -- Create the zip
    const zip_file = new zip();

    // -- Append all root files into a src folder
    zip_file.addLocalFolder(FMR_ROOT, 'src');

    // -- Append all the files listed in copy_files
    copy_files.forEach(file => {

        // -- Create the full path
        const full_path = path.join(FMR_ROOT, file);

        // -- Check if the file exists
        if (!fs.existsSync(full_path)) return;
        zip_file.addLocalFile(full_path);
    });

    // -- Return the zip
    return zip_file;
};



/**
 * @name compile_schemas
 * Compiles the schemas for the extension, it runs the
 * glib-compile-schemas command on the schemas directory
 * And adds them to the zip at the schemas directory.
 * 
 * @param {zip} zip_file - The zip file to add the schemas to
 * 
 * @returns {Promise<void>} Nothing
 */
const compile_schemas = async (zip_file: typeof zip): Promise<void> => {
    // -- Create the schemas directory
    const schemas_dir = path.join(FMR_ROOT, 'schemas');
    if (!fs.existsSync(schemas_dir)) return;

    // -- Compile the schemas
    return new Promise((resolve, reject) => exec(`glib-compile-schemas ${schemas_dir}`, (err, stdout, stderr) => {

        // -- Check if there was an error
        if (err) return reject(err);

        // -- Add the schemas to the zip (If they exist)
        if (!fs.existsSync(schemas_dir)) return resolve();
        zip_file.addLocalFolder(schemas_dir, 'schemas');

        // -- Resolve the promise
        resolve();
    }));
};



/**
 * @name install_extension
 * Installs the extension to the gnome-shell extensions
 * 
 * @param {string} zip_path - The path to the zip file
 * 
 * @returns {Promise<void>} Nothing
 */
const install_extension = async (zip_path: string): Promise<void> => {
    // -- Structure the commands
    const install_cmd = `gnome-extensions install ${zip_path} --force`,
        enable_cmd = `gnome-extensions enable ${uuid}`;

    // -- Install the extension
    return new Promise((resolve, reject) => 
        exec(install_cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(stderr);
                throw reject(err);
            }
            console.log(stdout);

            // -- Enable the extension
            exec(enable_cmd, (err, stdout, stderr) => {
                if (err) {
                    console.log(stderr);
                    // -- We dont want to throw here as the extension
                    //    will probably not get recognized by the
                    //    gnome-shell instantly
                }
                console.log(stdout);
                return resolve();
            });
    }));
};



/**
 * @name gse_build
 * Builds the extension for gnome-shell, it creates a zip
 * file and writes it to the dest.
 * 
 * @returns {void} Nothing
 */
const gse_build = async () => {
    // -- Build the zip
    console.log('Building zip file');
    const zip_file = build_zip();

    // -- Compile the schemas
    console.log('Compiling schemas');
    const schemas = compile_schemas(zip_file);



    // -- Get the main bundle
    const main_bundle = path.join(FMR_DEST, './dist/extension.js'),
        main_bundle_contents = fs.readFileSync(main_bundle, 'utf-8');
    zip_file.addFile('extension.js', Buffer.from(`${main_bundle_contents}\n${api_expose_script}`));
    

    // -- Add the prefs script
    const prefs_bundle = path.join(FMR_DEST, './dist/prefs.js'),
        prefs_bundle_contents = fs.readFileSync(prefs_bundle, 'utf-8');
    zip_file.addFile('prefs.js', Buffer.from(prefs_bundle_contents));


    // -- Write the zip to the dest
    await schemas;
    console.log('Writing zip file');
    zip_file.writeZip(`${uuid}.zip`);

    // -- Install the extension
    const zip_path = path.join(process.cwd(), `${uuid}.zip`);
    await install_extension(zip_path);

    // -- Remove the zip
    // fs.unlinkSync(zip_path);

    // -- Log that we are done
    console.log('Done!');
};



// -- Build the extension
gse_build();
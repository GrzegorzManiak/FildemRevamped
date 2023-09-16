var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var path = require('path');
var fs = require('fs');
var zip = require('adm-zip');
var exec = require('child_process').exec;
var uuid = 'FildemRevamped@grzegorz.ie';
/**
 * This script is injected at the end of the main extension bundle
 * Its used to expose the extension to gnome-shell, theres probably
 * a better way to do this but 5H Of webpack config later and I
 * still cant figure it out.
 */
var api_expose_script = "\n    /**\n     * INJECTED BY COMP.TS SCRIPT\n     */\n\n    function init(meta) {\n        global.log('Initializing extension');\n        lib.EntryPoint.init(meta);\n    };\n\n    function enable() {\n        global.log('Enabling extension');\n        lib.EntryPoint.enable();\n    };\n\n    function disable() {\n        global.log('Disabling extension');\n        lib.EntryPoint.disable();\n    };\n";
var FMR_DEST = 'FildemRevamped@grzegorz.ie';
var FMR_ROOT = path.join(process.cwd(), 'gnome-src');
var copy_files = [
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
var build_zip = function () {
    // -- Create the zip
    var zip_file = new zip();
    // -- Append all root files into a src folder
    zip_file.addLocalFolder(FMR_ROOT, 'src');
    // -- Append all the files listed in copy_files
    copy_files.forEach(function (file) {
        // -- Create the full path
        var full_path = path.join(FMR_ROOT, file);
        // -- Check if the file exists
        if (!fs.existsSync(full_path))
            return;
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
var compile_schemas = function (zip_file) { return __awaiter(_this, void 0, void 0, function () {
    var schemas_dir;
    return __generator(this, function (_a) {
        schemas_dir = path.join(FMR_ROOT, 'schemas');
        if (!fs.existsSync(schemas_dir))
            return [2 /*return*/];
        // -- Compile the schemas
        return [2 /*return*/, new Promise(function (resolve, reject) { return exec("glib-compile-schemas ".concat(schemas_dir), function (err, stdout, stderr) {
                // -- Check if there was an error
                if (err)
                    return reject(err);
                // -- Add the schemas to the zip (If they exist)
                if (!fs.existsSync(schemas_dir))
                    return resolve();
                zip_file.addLocalFolder(schemas_dir, 'schemas');
                // -- Resolve the promise
                resolve();
            }); })];
    });
}); };
/**
 * @name install_extension
 * Installs the extension to the gnome-shell extensions
 *
 * @param {string} zip_path - The path to the zip file
 *
 * @returns {Promise<void>} Nothing
 */
var install_extension = function (zip_path) { return __awaiter(_this, void 0, void 0, function () {
    var install_cmd, enable_cmd;
    return __generator(this, function (_a) {
        install_cmd = "gnome-extensions install ".concat(zip_path, " --force"), enable_cmd = "gnome-extensions enable ".concat(uuid);
        // -- Install the extension
        return [2 /*return*/, new Promise(function (resolve, reject) {
                return exec(install_cmd, function (err, stdout, stderr) {
                    if (err) {
                        console.log(stderr);
                        throw reject(err);
                    }
                    console.log(stdout);
                    // -- Enable the extension
                    exec(enable_cmd, function (err, stdout, stderr) {
                        if (err) {
                            console.log(stderr);
                            // -- We dont want to throw here as the extension
                            //    will probably not get recognized by the
                            //    gnome-shell instantly
                        }
                        console.log(stdout);
                        return resolve();
                    });
                });
            })];
    });
}); };
/**
 * @name gse_build
 * Builds the extension for gnome-shell, it creates a zip
 * file and writes it to the dest.
 *
 * @returns {void} Nothing
 */
var gse_build = function () { return __awaiter(_this, void 0, void 0, function () {
    var zip_file, schemas, main_bundle, main_bundle_contents, zip_path;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // -- Build the zip
                console.log('Building zip file');
                zip_file = build_zip();
                // -- Compile the schemas
                console.log('Compiling schemas');
                schemas = compile_schemas(zip_file);
                main_bundle = path.join(FMR_DEST, './dist/extension.js'), main_bundle_contents = fs.readFileSync(main_bundle, 'utf-8');
                // -- Add the api expose script
                zip_file.addFile('extension.js', Buffer.from("".concat(main_bundle_contents, "\n").concat(api_expose_script)));
                // -- Write the zip to the dest
                return [4 /*yield*/, schemas];
            case 1:
                // -- Write the zip to the dest
                _a.sent();
                console.log('Writing zip file');
                zip_file.writeZip("".concat(uuid, ".zip"));
                zip_path = path.join(process.cwd(), "".concat(uuid, ".zip"));
                return [4 /*yield*/, install_extension(zip_path)];
            case 2:
                _a.sent();
                // -- Remove the zip
                // fs.unlinkSync(zip_path);
                // -- Log that we are done
                console.log('Done!');
                return [2 /*return*/];
        }
    });
}); };
// -- Build the extension
gse_build();

import { flog } from '../log';
import MenuProxy from './index';

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
import Gjs from '@girs/gjs';

// -- name and path regex
export const name_regex = /name="([a-zA-Z0-9.\\\/]+)"/,
    path_regex = /path="([a-zA-Z0-9.\\\/]+)"/;

/**
 * @name construct_iface_path
 * Constructs the path to the iface file
 * 
 * @param {string} uuid - The uuid of the extension
 * 
 * @returns {string} The path to the iface file
 */
const construct_iface_path = (
    uuid: string
): string => {
    let iface_path = MenuProxy.extension_path.replace('~', GLib.get_home_dir());
    iface_path = iface_path.replace('%uuid%', uuid);
    iface_path += '/' + MenuProxy.iface_file_name;
    return iface_path;
}



/**
 * @name read_iface_file
 * Reads the iface file and returns the parsed xml
 * 
 * @param {string} uuid - The uuid of the extension
 * 
 * @returns {Promise<XMLBuilder.XMLElement>} The parsed xml
 */
export const read_iface_file = (
    uuid: string
): string => {
    // -- Construct the path
    const iface_path = construct_iface_path(uuid);
    flog('INFO', 'iface_path: ', iface_path);

    // -- Attempt to read the file
    try {
        flog('INFO', 'Reading iface file');
        const flc_path = Gio.File.new_for_path(iface_path);

        // -- Load the content into a byte array
        const [, contents] = flc_path.load_contents(null);
        const decoder = new Gjs.byteArray.ByteArray(contents);

        // -- Return the decoded string
        return decoder.toString();  
    }

    catch (e) {
        flog('ERROR', 'There was an error reading the iface file: ', e);
        throw new Error(e);
    }
}



/**
 * @name get_bus_name_path
 * Parses the iface file and returns the parsed xml
 * 
 * @param {string} iface_raw - The raw iface file
 * 
 * @returns {{
 *    bus_name: string; 
 *    path: string;  
 * }} The bus name and path
 */
export const get_bus_name_path = (
    iface_raw: string
): {
    bus_name: string;
    path: string;
} => {

    // -- Get the name and path
    const name = name_regex.exec(iface_raw),
        path = path_regex.exec(iface_raw);

    // -- Check if we got a name and path
    if (!name || !path) {
        flog('ERROR', 'Could not get name or path from iface file');
        throw new Error('Could not get name or path from iface file');
    }

    // -- Return the name and path
    return {
        bus_name: name[1],
        path: path[1],
    };
}
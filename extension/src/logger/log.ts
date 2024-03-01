/**
 * @module log
 * This module contains functions for logging (Just the same as console.log) but it allows
 * us to disable logging in production, save logs etc etc.
 */


import Type from './type';
import Shell from 'gi://Shell';
import DBus from '../dbus/registrar';
const global = Shell.Global.get();


/**
 * @name log_header
 * Logs a header to the console
 * 
 * @example [INFO: 12:00:00]
 * 
 * @param {Type} type - The type of log
 * 
 * @returns {string} The header
 */
export const log_header = (type: Type): string => {
    const date = new Date();
    return `[${type}: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}]`;
};



export default class Logger {

    /**
     * @name log
     * Logs a message to the console
     *
     * @param {Type} type - The type of log
     * @param {Array<unknown>} args - The arguments to log
     *
     * @returns {void} - Nothing, it just logs
     */
    public static log = (type: Type, ...args: Array<unknown>): void => {

        // -- Only log if we are in debug mode or an ERROR has occured
        // if (!LOG && type !== log_types.ERROR) return;
        const header = log_header(type),
            bold_style = 'font-weight: bold;';

        // -- Create the message, so the header, bolded, then the args
        // @ts-ignore
        console.log(`[Gggm] ${header}`, ...args);
        DBus.getInstance().dbus_log(type, header, args.join(' '));
    };


    public static info = (...args: Array<unknown>): void => Logger.log(Type.INFO, ...args);
    public static warn = (...args: Array<unknown>): void => Logger.log(Type.WARN, ...args);
    public static error = (...args: Array<unknown>): void => Logger.log(Type.ERROR, ...args);
    public static debug = (...args: Array<unknown>): void => Logger.log(Type.LOG, ...args);
}
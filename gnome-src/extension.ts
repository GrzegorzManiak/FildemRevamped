import { misc, ExtensionMetadata, Extension } from '@girs/gnome-shell';
const ExtensionUtils = misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension() as unknown as Extension;
const _ = ExtensionUtils.gettext;
const GETTEXT_DOMAIN = 'fildem-revamped';

import { flog } from './log';

class GlobalExtension {
    private static _instance: GlobalExtension;
    public readonly _uuid: string;
    public readonly _gettext_domain: string = GETTEXT_DOMAIN;



    /**
     * @name constructor
     * The constructor for the extension
     * 
     * @param {string} uuid - The uuid of the extension
     */
    private constructor(uuid: string) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);

        // -- Check if Me is defined
        this._check_me();
    }



    /**
     * @name get_instance
     * Gets the instance of the extension
     * 
     * @returns {GlobalExtension} The instance of the extension
     */
    public static get_instance(): GlobalExtension {
        if (!GlobalExtension._instance) GlobalExtension._instance = new GlobalExtension(Me.metadata.uuid);
        return GlobalExtension._instance;
    }



    /**
     * @name check_me
     * Checks if the extension is Me or not
     * 
     * @returns {void} Nothing
     */
    private _check_me(): void {
        if (!Me) {
            flog('ERROR', _('Me is not defined!'));
            throw new Error(_('Me is not defined!'));
        }
    }



    /**
     * @name enable
     * This function is called when the extension is enabled
     * by gnome-shell.
     * 
     * @returns {void} Nothing
     */
    public enable(): void {
        flog('INFO', 'Enabling extension: ', Me.metadata.uuid);
    }



    /**
     * @name disable
     * This function is called when the extension is disabled
     * by gnome-shell.
     * 
     * @returns {void} Nothing
     */
    public disable(): void {
        flog('WARN', 'Disabling extension: ', Me.metadata.uuid);
    }
}



export class EntryPoint {

    /**
     * @name init
     * This function is called when the extension is loaded
     * by gnome-shell.
     * 
     * @param {ExtensionMetadata} meta - The metadata of the extension
     * 
     * @returns {GlobalExtension} The extension
     */
    static init(meta: ExtensionMetadata): GlobalExtension {
        flog('INFO', 'Initializing extension: ', meta);
        return GlobalExtension.get_instance();
    }
    



    static enable(): void {
        GlobalExtension.get_instance().enable();
    }

    static disable(): void {
        GlobalExtension.get_instance().disable();
    }
}
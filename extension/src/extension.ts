import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Logger from './logger/log';
import DBusRegistrar from './dbus/registrar';
import Window from './window/window';

export default class Gggm extends Extension {
    private static _dbus_registrar: DBusRegistrar;

    public enable() {
        Logger.info('Gggm Enabling extension');

        if (!Gggm._dbus_registrar) Gggm._dbus_registrar = DBusRegistrar.getInstance();
        Gggm._dbus_registrar.acquire_bus();

        Window.add_window_changed_listener((window: Window | null) => {
            if (window) Logger.info('Window changed', window); 
            else Logger.info('Window changed', 'null');
        });

        Window.start();
    }

    public disable() {
        Logger.info('Gggm Disabling extension');
        Window.stop();
        if (Gggm._dbus_registrar) Gggm._dbus_registrar.release_bus();
    }
}
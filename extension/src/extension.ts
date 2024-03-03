import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Logger from './logger/log';
import DBusRegistrar from './dbus/registrar';
import Window from './window/window';
import DBusMenu from './dbus/dbusmenu';

import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

export default class Gggm extends Extension {
    private static _dbus_registrar: DBusRegistrar;
    private static _dbus_menu: DBusMenu;



    public enable() {
        Logger.info('Gggm Enabling extension');



        Logger.info('Starting Registrar Service');
        Gggm._dbus_registrar = DBusRegistrar.getInstance();
        Gggm._dbus_registrar.acquire_bus();

        Logger.info('Starting Menu Service');
        Gggm._dbus_menu = DBusMenu.getInstance();
        Gggm._dbus_menu.acquire_bus();



        // -- List all gmenu
        // const a = Gio.AppInfo.get_all();
        // Logger.info('AppInfo count:', a.length);
        // for (let i = 0; i < a.length; i++) {
        //     const name = a[i].get_display_name();

        //     Logger.info(name, ': ', a[i].get_id());
        //     // Logger.info(name, ': ', a[i].get_data('GMenu').toString());

        // }

        const app_system = Shell.AppSystem.get_default();
        const apps = app_system.get_running();

        for (let i = 0; i < apps.length; i++) {
            let app = apps[i];
            Logger.info('-----------App:', app.get_name(), app.get_app_info(), app.get_id(), app.get_pids(), app.id);
            let actionGroup = app.action_group;
            if (actionGroup) {
                let nActions = actionGroup.list_actions().length;
                for (let j = 0; j < nActions; j++) {
                    let actionName = actionGroup.list_actions()[j];
                    
                    Logger.info('Action:', actionName);
                }
            }
        }

    
        
       
        Window.add_window_changed_listener((window: Window | null) => {
            if (!window) return;
            Logger.info('-------- New windwow: ', window.title);
            Logger.info(window.app_id);
            Logger.info(window.meta_window.get_pid());
        });

        Window.start();
    }



    public disable() {
        Logger.info('Gggm Disabling extension');
        Window.stop();
        if (Gggm._dbus_registrar) Gggm._dbus_registrar.release_bus();
        if (Gggm._dbus_menu) Gggm._dbus_menu.release_bus();
    }
}
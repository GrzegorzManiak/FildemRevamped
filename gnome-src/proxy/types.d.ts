export interface EchoSignalArgs {
    menu: string;
    x: number;
}

export interface WindowSwitchedArgs {
    in_data: Record<string, string>;
}

export interface WindowSwitchedSignalArgs {
    win_data: Record<string, string>;
}

export interface MenuActivatedArgs {
    menu: string;
    x: number;
}

export interface EchoMenuOnOffArgs {
    on: boolean;
}

export interface MenuOnOffArgs {
    on: boolean;
}

export interface SendTopLevelMenusArgs {
    top_level_menus: string[];
}

export interface SendTopLevelMenusSignalArgs {
    top_level_menus: string[];
}

export interface SendTopLevelOptionsArgs {
    top_level_options: string[];
}

export interface SendTopLevelOptionsSignalArgs {
    top_level_options: string[];
}

export interface RequestActionArgs {
    action: ArrayBuffer;
}

export interface RequestActionSignalArgs {
    action: ArrayBuffer;
}

export interface ListWindowActionsArgs {
    actions: string[];
}

export interface ListWindowActionsSignalArgs {
    actions: string[];
}

export interface ActivateWindowActionArgs {
    action: string;
}

export interface ActivateWindowActionSignalArgs {
    action: string;
}



/**
 * @interface AppMenuInterface
 * This is the interface that is used to communicate with the python backend.
 */
export interface AppMenuInterface {
    EchoSignal(args: EchoSignalArgs): void;
    WindowSwitched(args: WindowSwitchedArgs): void;
    WindowSwitchedSignal(args: WindowSwitchedSignalArgs): void;
    MenuActivated(args: MenuActivatedArgs): void;
    EchoMenuOnOff(args: EchoMenuOnOffArgs): void;
    MenuOnOff(args: MenuOnOffArgs): void;
    SendTopLevelMenus(args: SendTopLevelMenusArgs): void;
    SendTopLevelMenusSignal(args: SendTopLevelMenusSignalArgs): void;
    SendTopLevelOptions(args: SendTopLevelOptionsArgs): void;
    SendTopLevelOptionsSignal(args: SendTopLevelOptionsSignalArgs): void;
    RequestAction(): ArrayBuffer;
    RequestActionSignal(args: RequestActionSignalArgs): void;
    RequestWindowActions(): void;
    RequestWindowActionsSignal(): void;
    ListWindowActions(args: ListWindowActionsArgs): void;
    ListWindowActionsSignal(args: ListWindowActionsSignalArgs): void;
    ActivateWindowAction(args: ActivateWindowActionArgs): void;
    ActivateWindowActionSignal(args: ActivateWindowActionSignalArgs): void;
}
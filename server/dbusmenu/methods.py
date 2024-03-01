from typing import Any, Dict, List, Tuple
from logger import log
from dbus_next.service import ServiceInterface, method, signal, dbus_property
from dbus_next.constants import PropertyAccess


class DBusMethods(ServiceInterface):
    """
        A class that contains methods that are used by the DBus server.
    """

    def __init__(self, name: str):
        """
            Creates a new DBusMethods object.
        """
        super().__init__(name)
        log.info("DBusMethods.__init__")



    @dbus_property(name='Version', access=PropertyAccess.READ)
    def Version(self) -> 'i':
        """
        The version of the menu spec that this server is implementing.

        Returns:
            int: The version of the menu spec that this server is implementing.
        """
        return 0
    


    @dbus_property(name='Status', access=PropertyAccess.READ)
    def Status(self) -> 'i':
        """
        The status of the menu. This is a bitmask of the status values
        defined in the Status enum.

        Returns:
            int: The status of the menu.
        """
        return 0
    


    @method()
    def GetLayout(self, 
        parentId: 'i', 
        recursionDepth: 'i', 
        propertyNames: 'as'
    ) -> '(u(a{sv}av))':
        """
        Provides the layout and properties that are attached to the entries
        that are in the layout. It only gives the items that are children
        of the item that is specified in @a parentId. It will return all of the
        properties or specific ones depending on the value in @a propertyNames.

        The format is recursive, where the second 'v' is in the same format
        as the original 'a(ia{sv}av)'. Its content depends on the value
        of @a recursionDepth.

        Args:
            parentId (int): The ID of the parent node for the layout. For
                grabbing the layout from the root node use zero.
            recursionDepth (int): The amount of levels of recursion to use. This affects the
                content of the second variant array.
                - -1: deliver all the items under the @a parentId.
                - 0: no recursion, the array will be empty.
                - n: array will contains items up to 'n' level depth.
            propertyNames (List[str]): The list of item properties we are
                interested in. If there are no entries in the list all of
                the properties will be sent.

        Returns:
            Tuple[int, Tuple[int, Dict[int, Dict[str, Any]], List[Dict[int, Any]]]]: The revision number of the layout and the layout as a recursive structure.
        """



    @method()
    def GetGroupProperties(self, 
        ids: 'ai', 
        propertyNames: 'as'
    ) -> '(a(ia{sv}))':
        """
        Returns the list of items which are children of @a parentId.

        Args:
            ids (List[int]): A list of ids that we should be finding the properties
                on. If the list is empty, all menu items should be sent.
            propertyNames (List[str]): The list of item properties we are
                interested in. If there are no entries in the list all of
                the properties will be sent.

        Returns:
            Dict[int, Dict[str, Any]]: An array of property values.
                An item in this area is represented as a struct following
                this format:
                - id (int): the item id
                - properties (Dict[str, Any]): the requested item properties
        """



    @method(name='GetLayout')
    def GetProperty(self, 
        id: 'i', 
        name: 's'
    ) -> 'v':
        """
        Get a signal property on a single item. This is not useful if you're
        going to implement this interface, it should only be used if you're
        debugging via a commandline tool.

        Args:
            id (int): the id of the item which received the event
            name (str): the name of the property to get

        Returns:
            Any: the value of the property
        """
        return None



    @method()
    def Event(self, 
        id: 'i', 
        eventId: 's', 
        data: 'v',
        timestamp: 't' 
    ):
        """
        This is called by the applet to notify the application an event happened on a
        menu item.

        Args:
            id (int): the id of the item which received the event
            eventId (str): the type of event
            data (Any): event-specific data
            timestamp (int): The time that the event occured if available or the time the message was sent if not
        """
        



    @method()
    def AboutToShow(self, 
        id: 'i'
    ) -> 'b':
        """
        This is called by the applet to notify the application that it is about
        to show the menu under the specified item.

        Args:
            id (int): Which menu item represents the parent of the item about to be shown.

        Returns:
            bool: Whether this AboutToShow event should result in the menu being updated.
        """
        return False


    @signal()
    def ItemsPropertiesUpdated(self, 
        updatedProps: 'a{ia{sv}}',
        removedProps: 'a{ia(sa{sv})}' 
    ):
        """
        Triggered when there are lots of property updates across many items
        so they all get grouped into a single dbus message. The format is
        the ID of the item with a hashtable of names and values for those
        properties.

        Args:
            updatedProps (Dict[int, Dict[str, Any]]): A dictionary containing updated properties.
                Key: The ID of the item.
                Value: A dictionary of names and values for those properties.
            removedProps (Dict[int, List[str]]): A dictionary containing removed properties.
                Key: The ID of the item.
                Value: A list of removed property names.
        """
        


    @signal()
    def LayoutUpdated(self) -> '(ui)':
        """
        Triggered by the application to notify display of a layout update, up to
        revision

        Returns:
            Tuple[int, int]: The revision of the layout that we're currently on
                and if the layout update is only of a subtree, this is the
                parent item for the entries that have changed. It is zero if
                the whole layout should be considered invalid.
        """
        return (0, 0)



    @signal()
    def ItemActivationRequested(self, 
        id: 'i',
        timestamp: 't'
    ): 
        """
        The server is requesting that all clients displaying this
        menu open it to the user. This would be for things like
        hotkeys that when the user presses them the menu should
        open and display itself to the user.

        Args:
            id (int): ID of the menu that should be activated
            timestamp (int): The time that the event occured
        """


import dbus

def find_object(object_path):
    try:
        # Connect to the session bus
        session_bus = dbus.SessionBus()

        # Get all services on the session bus
        services = session_bus.list_names()

        # Iterate through each service to check if the object path exists
        for service_name in services:
            try:
                # Get the object proxy for the service
                service_object = session_bus.get_object(service_name, object_path)

                # If no exception is raised, the object path exists in this service
                print("Object", object_path, "found in service", service_name)
                try: introspect(object_path, service_name)
                except: pass

            except dbus.exceptions.DBusException:
                # Object path not found in this service
                continue

        # If the loop completes without finding the object path, print not found
        print("Object", object_path, "not found in any service.")

    except dbus.exceptions.DBusException as e:
        print('Error:', e)
        

def introspect(object_path, service_name):
    try:
        # Connect to the session bus
        session_bus = dbus.SessionBus()

        # Get all services on the session bus
        services = session_bus.list_names()

        # Iterate through each service to check if the object path exists
        for service_name in services:
            try:
                # Get the object proxy for the service
                service_object = session_bus.get_object(service_name, object_path)

                # Get the introspection data for the object
                #  if service name contains :
                if ':' in service_name: continue
                introspection = dbus.Interface(service_object, service_name)
                xml_data = introspection.Introspect()

                # Print the introspection data
                print(xml_data)

                # If no exception is raised, the object path exists in this service
                print("Object", object_path, "found in service", service_name)
                # return service_name
                
               

            except dbus.exceptions.DBusException:
                # Object path not found in this service
                continue

        # If the loop completes without finding the object path, print not found
        print("Object", object_path, "not found in any service.")

    except dbus.exceptions.DBusException as e:
        print('Error:', e)

        
# Specify the object path you want to search for
object_path = '/org/libreoffice/window/73400356'

# Search for the specified object
find_object(object_path)

# # List all methods for the specified object
# introspect(object_path)
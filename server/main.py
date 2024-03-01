import sys

from PySide6.QtCore import QCoreApplication
from PySide6.QtWidgets import QApplication
from logger.log import info
from dbusmenu.main import DbusMenu
    
def main() -> None:
    info("Application started")
    app = QApplication(sys.argv)
    QCoreApplication.setApplicationName("GGGM DbusMenu Server")
    QCoreApplication.setOrganizationName("Grzegorz.ie")

    # -- Start the dbus server
    dbm = DbusMenu()
    dbm.start()
    
    # -- Execute application:
    app.exec()
    sys.exit(info("Application exited"))

if __name__ == "__main__":
    main()

    
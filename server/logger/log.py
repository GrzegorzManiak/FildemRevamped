from enum import Enum
import datetime

from logger.type import Type
from logger.colors import TerminalColor


def log(
        log_type: Type,
        *args,
) -> None:
    """
        Logs a message to the console and to the log file.
        (TODO: implement log file)

        [TIMESTAMP] [LOG_TYPE]: ARGS...

        Args:
            log_type (LogType): The type of the log
            *args: The message to log

        Returns:
            None
    """

    # -- Get the current timestamp
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # -- Create the log message
    log_message = f"{TerminalColor.WHITE}[{timestamp}] {log_type.get_color()}[{log_type}]{TerminalColor.CLEAR}: "
    for arg in args:
        log_message += str(arg) + " "

    # -- Log the message to the console
    print(log_message)


def error(*args):
    log(Type.ERROR, *args)


def warn(*args):
    log(Type.WARNING, *args)


def info(*args):
    log(Type.INFO, *args)

from enum import Enum

from logger.colors import TerminalColor


class Type(Enum):
    # -- ID, TERMINAL COLOR CODE
    INFO = (0, TerminalColor.GREEN)
    WARNING = (1, TerminalColor.YELLOW)
    ERROR = (2, TerminalColor.RED)

    def __str__(self):
        return self.name

    def get_color(self) -> TerminalColor:
        return self.value[1]

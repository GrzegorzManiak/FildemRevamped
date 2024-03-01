from enum import Enum


class TerminalColor(Enum):
    CLEAR = (0, "\x1b[0m")
    WHITE = (1, "\x1b[37m")
    GREEN = (2, "\x1b[32m")
    YELLOW = (3, "\x1b[33m")
    RED = (4, "\x1b[31m")

    def color(self):
        return self.value[1]

    def __str__(self):
        return self.value[1]

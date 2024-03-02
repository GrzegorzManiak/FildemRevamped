# GggM (Gregs Global Gnome Menu)

## An Up-to-Date Global Menu for GNOME 44 and Beyond

[![Donate? - Buy me a beer 🍺](https://img.shields.io/badge/Donate%3F-Buy_me_a_beer_🍺-2ea44f)](https://www.buymeacoffee.com/GrzegorzManiak)

![FildemRevamped](https://github.com/GrzegorzManiak/FildemRevamped/assets/83783716/33b4aeba-4f46-4e2c-bbc0-8c022a13238f)

This project is a fork of a fork. It started with [GnomeHud](https://github.com/hardpixel/gnome-hud) and was later expanded upon by [Gonzaarcr](https://github.com/gonzaarcr). Consider buying him a [Coffee](https://buymeacoffee.com/gonza)!

FildemRevamped comes into play because [Gonzaarcr](https://github.com/gonzaarcr) disappeared from the scene, and the project stopped being maintained. Therefore, it won't work in the near future.

## What's Changed?

Everything. 

## Development

This is going to be quite unstructured for now as I peice together the code and try to make it work. 

- **X11**: Test with X11 Not Wayland, to reload the extension on Wayland you have to log out
    and log in again, closing all your apps.

    Where as with X11 you can just press `Alt + F2` and type `r` and press `Enter` to reload the shell.
    You can find out how to enable X11 [here](https://unix.stackexchange.com/a/336227)

    X11: To reload the extension, you can press `Alt + F2` and type `r` and press `Enter` to reload the shell.
    Wayland: You have to log out and log in again, closing all your apps, or run `bun run debug-shell` and then
    but you are limited on what you can do in the debug shell (Useless for this application).

    Note: this extension should work regardless of the display server, but it's just easier to test with X11.
    X11 Is also laggier, your monitors refresh rate will be lower, its buggy, your wallpaper will look like
    dog and a million other things, so make sure to switch back to Wayland after testing.
        
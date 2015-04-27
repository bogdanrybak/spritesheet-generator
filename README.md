# Description

Spritesheet generator is for those who work with Photoshop's animation functions and want to easily export their animations into a simple spritesheet.

Report issues / feature requests on [github](https://github.com/bogdanrybak/spritesheet-generator/issues) or [tweet at me](https://twitter.com/bogdan_rybak)

# Installation

Place the Spritesheet generator.jsx script into:

- Windows - C:\Program Files\Adobe\Your photoshop version\Presets\Scripts
- Mac - Applications > Your photoshop version > Presets > Scripts

Restart Photoshop if it was open.

# Usage
The script will now be available under File -> Scripts menu as "Spritesheet Generator".

![Screenshot](http://i.imgur.com/kpMYPm1.png)

You can specify the frame range. The columns and rows will be automaticaly calculated - you can change them to suit your needs.

Export options:

* **Save as PNG** - generates and then saves a PNG24 of the generated sprite sheet along with a _spritesheets.txt file in the same folder
* **Generate document** - generate your spritesheet into a new photoshop document with "Document Name" field and cell size as the name i.e. basic_attack_32x32

# Sprite sheet data file
_spritesheets.txt will be created / updated everytime you use **Save as PNG** option and will store sprite sheet information for all generated pngs in the folder it resides. The generated _spritesheets.txt format is:
```
spritename,cell width,cell height,number of frames

for example:
basic_attack.png,32,32,5
basic_attack_1.png,32,34,3

each entry uses a new line
```

This file exists so that you can setup whatever workflow within your game engine or other tools to read and slice your spritesheets.

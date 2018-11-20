# Description

Spritesheet generator is for those who work with Photoshop's animation functions and want to easily export their animations into a simple spritesheet.

Report issues / feature requests on [github](https://github.com/bogdanrybak/spritesheet-generator/issues) or [tweet at me](https://twitter.com/bogdan_rybak)

# Installation

[Download](https://github.com/bogdanrybak/spritesheet-generator/files/2575113/Spritesheet.Generator.zip) the raw version of the script


Place Spritesheet generator.jsx script into:

- **Windows** - C:\Program Files\Adobe\Your photoshop version\Presets\Scripts
- **Mac** - Applications > Your photoshop version > Presets > Scripts

Restart Photoshop if it was open.

# Usage
The script will now be available under File -> Scripts menu as "Spritesheet Generator".

![capture](https://user-images.githubusercontent.com/20757517/48398369-87bab300-e75b-11e8-8550-4edd087bd2a4.PNG)

You can specify the frame range. The columns and rows will be automaticaly calculated - you can change them to suit your needs.

You also have the option to add padding in between frames to avoid bleeding. 

Export options:

* **Save as PNG** - generates and then saves a PNG24 of the generated sprite sheet along with a _spritesheets.txt file in the same folder
* **Generate document** - generate your spritesheet into a new photoshop document with "Document Name" field and cell size as the name i.e. basic_attack_32x32

# Sprite sheet data file
_spritesheets.txt will be created / updated everytime you use **Save as PNG** option and will store sprite sheet information for all generated pngs in the folder it resides. 
Extra options:
- Check "Separate Padding Data" to extract more detailed spritesheet information with padding information on each side (by default)
The generated _spritesheets.txt format is:
```

Without Separate Padding Data (default):
spritename,cell width + padding left + padding right,cell height + padding top + padding bottom,number of frames

  for example,   
  basic_attack.png,68,68,4
  basic_attack_1.png,36,36,4
  DustAnimationExample.png,22,10,4

With Separate Padding Data:
spritename,cell width,cell height,padding left,padding top,padding right, padding bottom,number of frames
  
  for example,
  basic_attack.png,64,64,2,2,2,2,4 
  basic_attack_1.png,32,32,2,2,2,2,4
  DustAnimationExample.png,18,6,2,2,2,2,4


each entry uses a new line
```

This file exists so that you can setup whatever workflow within your game engine or other tools to read and slice your spritesheets.

# Contributors
- [@SebaschenLiu](https://github.com/SebaschenLiu) - thanks for the awesome padding feature and UI enhancements <3

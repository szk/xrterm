# xrterm
Terminal Emulator for xR environment.  
**IMPORTANT: Early version, this is not playable so much**

## Quick instruction
### Installation
1. Install Node.js, NPM and Yarn.
1. If you don't have OS-native build system, please install it (like 'https://github.com/felixrieseberg/windows-build-tools' ).
1. Clone master branch 
    <!-- language: sh -->
        $ git clone https://github.com/szk/xrterm.git

   or [download archive](https://github.com/szk/xrterm/archive/master.zip) and extract it.
1. Type from command prompt:
    <!-- language: sh -->
        $ cd xrterm
        $ yarn install

### Usage
1. Type from command prompt:
    <!-- language: sh -->
        $ yarn start

1. Access ```http://localhost:8000/``` with Web browser (Edge 79+, Chrome 79+, Chrome for Android 85+ and Opera 66+).

## Building running environment on Mobile OS (Android / Oculus Quest)
1. Install or sideload pseudo-Shell Environment (like termux etc.)
1. Build xrterm on the pseudo environment following 'Quick instruction' section on this document
1. Access ```http://localhost:8000/``` with Web browser

## Editing a XR Scene on-the-fly
When you save a file, the scene reflects the latest content of it immediately.  

**WARNING**: If it has any errors, the environment will be stopped :worried:  
    Please escape from VR/XR mode in that case and fix it up by hand in YOUR_TEXT_EDITOR w/o xrterm.

YOUR_TEXT_EDITOR = vim, emacs, micro, nano, etc.

### Scene Graph 
1. Edit scene/scene.html file by your favorite editor
    <!-- language: sh -->
        $ cd xrterm/scene
        $ ${YOUR_TEXT_EDITOR} scene.html

### JavaScript modules
1. Create new .js file in scene/components
    <!-- language: sh -->
        $ cd xrterm/scene/components
        $ touch example.js
        $ ${YOUR_TEXT_EDITOR} example.js

### Shaders for objects
1. Edit scene/components/shader.js file by your favorite editor
    <!-- language: sh -->
        $ cd xrterm/scene/components
        $ ${YOUR_TEXT_EDITOR} example_shader.js
        $ ${YOUR_TEXT_EDITOR} shaders/example_vertex_shader.glsl
        $ ${YOUR_TEXT_EDITOR} shaders/example_fragment_shader.glsl

## License
[MIT License](http://opensource.org/licenses/MIT)

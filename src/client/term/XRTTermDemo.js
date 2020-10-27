/*
 * based on aframe-xterm-component by rangermauve
 * MIT license
 */
"use strict";

class XRTTermDemo
{
  constructor ()
  {
  }

  init(self_)
  {
    let tty = self_.el.components['xrtty'];
    const bash = this.init_bash_emulator_();

    self_.el.addEventListener('xrtty-data', (e_) => { this.interaction_(self_, e_); });

    const localEcho = new LocalEchoController();
    tty.term.loadAddon(localEcho);
    localEcho.addAutocompleteHandler((index, tokens) => {
      if (index == 0) { return Object.keys(bash.commands); }
      return [];
    });

    tty.command = '';
    tty.write(CM.DEMO_BANNER);
    this.repl_(localEcho, bash, tty);
  }

  repl_(echo_, bash_, tty_)
  {
    echo_.read(CM.DEMO_PROMPT, CM.DEMO_CONTINUOUS_PROMPT)
      .then(input => bash_.run(input).then((log_) => { tty_.write(log_); tty_.write('\r\n'); this.repl_(echo_, bash_, tty_); },
                                           (error_) => { tty_.write(error_); tty_.write('\r\n');  this.repl_(echo_, bash_, tty_);}))
      .catch(error => console.log(`Error reading: ${error}`));
  }

  interaction_(self_, event_)
  {
    let command = CM.Config.key_to_cmd_term(event_.detail);
    let tty = self_.el.components['xrtty'];
    let rows = tty.term.rows, cols = tty.term.cols;
    let pos_wld = new THREE.Vector3();
    self_.el.object3D.getWorldPosition(pos_wld);

    switch (command) {
      case CM.WS_CMD.MOVE_UP:
        pos_wld.y += 1.0;
        break;
      case CM.WS_CMD.MOVE_DOWN:
        pos_wld.y -= 1.0;
        break;
      case CM.WS_CMD.MOVE_LEFT:
        pos_wld.x -= 1.0;
        break;
      case CM.WS_CMD.MOVE_RIGHT:
        pos_wld.x += 1.0;
        break;

      case CM.WS_CMD.RESIZE_UP:
        rows += 1;
        break;
      case CM.WS_CMD.RESIZE_DOWN:
        rows -= 1;
        break;
      case CM.WS_CMD.RESIZE_LEFT:
        cols -= 1;
        break;
      case CM.WS_CMD.RESIZE_RIGHT:
        cols += 1;
        break;

      default: break;
    }
    self_.el.setAttribute('animation', "property: position; to:"
                          + pos_wld.x.toString() + " " +  pos_wld.y.toString() + " " +  pos_wld.z.toString()
                          + "; dur: 200; easing: easeOutExpo; loop: false");
    // animation="property: position; to: 1 8 -10; dur: 2000; easing: linear; loop: true"
    // tty.term.resize(rows, cols);
  }

  init_bash_emulator_()
  {
    var emulator = bashEmulator({
      workingDirectory: '/',
      fileSystem: {
        '/': {
          type: 'dir',
          modified: Date.now()
        },
        '/README.txt': {
          type: 'file',
          modified: Date.now(),
          content: 'empty'
        },
        '/home': {
          type: 'dir',
          modified: Date.now()
        },
        '/home/user/journal.txt': {
          type: 'file',
          modified: Date.now(),
          content: 'this is private!'
        },
        '/home/user': {
          type: 'dir',
          modified: Date.now()
        }
      }
    });

    return emulator;
  }

  register()
  {
    let self_ = this;

    AFRAME.registerComponent('term-demo', {
      dependencies: ['xrtty'],
      init: function() { self_.init(this); }
    });
  }

  get_dragging_type()
  {
    return CM.WS_PLACEMENT.PLANE;
  }
}

"use strict";

class XRTTermDemo
{
  constructor(ws_)
  {
    this.ws_ = ws_;
  }

  init_gl()
  {
    this.gl_ = this.ws_.get_context();
  }

  init(self_)
  {
    self_.tty = self_.el.components['xrtty'];
    const bash = this.init_bash_emulator_();

    console.log(self_.tty);

    self_.el.addEventListener('xrtty-data', (e_) => { this.interaction_(self_, e_); });

    let localEcho = new LocalEchoController();
    self_.tty.term.loadAddon(localEcho);
    localEcho.addAutocompleteHandler((index, tokens) => {
      if (index == 0) { return Object.keys(bash.commands); }
      return [];
    });

    self_.tty.command = '';
    self_.tty.write(CM.DEMO_BANNER);
    this.repl_(localEcho, bash, self_.tty);

    self_.aframeaddon = new AframeAddon(this.gl_);
    self_.tty.term.loadAddon(self_.aframeaddon);
  }

  show(self_, color_)
  {
    self_.canvas_texture = new THREE.CanvasTexture(self_.aframeaddon.textureAtlas);
    self_.canvas_texture.needsUpdate = true;

    let glyph_geometry = self_.aframeaddon.bufferGeometry;

    var mesh = new THREE.Mesh(// new THREE.PlaneGeometry(6, 6, 8, 8),
      glyph_geometry,
      new THREE.MeshBasicMaterial({map: self_.canvas_texture,
                                   color: color_, transparent: true}));
    let radius = 3.0;
    mesh.geometry.boundingSphere = new THREE.Sphere( new THREE.Vector3(0, 0, 0), radius );

    self_.el.setObject3D('mesh', mesh);
  }

  connect(self_)
  {

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
    let rows = self_.tty.term.rows, cols = self_.tty.term.cols;
    let pos_wld = new THREE.Vector3();
    self_.el.object3D.getWorldPosition(pos_wld);

    console.log(command, ': ', self_.tty.el.id);

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
      schema: { color: { default: '#ff00ff' } },
      init: function ()
      {
        this.initialized_ = false;
      },
      tick: function (time_, delta_)
      {
        if (this.initialized_ != false)
        {
          this.aframeaddon.tick();
          this.canvas_texture.needsUpdate = true;
        }
        else
        {
          self_.init_gl(this);

          self_.init(this);
          self_.show(this, this.data.color);
          self_.connect(this);

          this.initialized_ = true;
        }
      },
      tock: function (time_, delta_)
      {
      },

    });
  }

  get_dragging_type()
  {
    return CM.WS_PLACEMENT.PLANE;
  }
}

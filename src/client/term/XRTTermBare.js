"use strict";

const DEFAULT_BG_COLOR = 0x333333;
const FOCUSED_OPACITY = 0.8;
const UNFOCUSED_OPACITY = 0.4;

const TERM_ANIMATION_FADEIN = "property: material.opacity; from: 0; to: 1; dur: 100; easing: linear; loop: false";
const TERM_ANIMATION_FADEOUT = "property: material.opacity; from: 1; to: 0; dur: 100; easing: linear; loop: false";
const TERM_FIX = "property: material.color; from: #F0F; to: #00F;";

class XRTTermBare
{
  constructor(ws_)
  {
    this.ws_ = ws_;
  }

  init_gl(self_)
  {
    this.gl_ = this.ws_.get_context();
  }

  init(self_)
  {
    self_.tty = self_.el.components['xrtty'];
    const message = 'Initialized\r\n';

    self_.tty.write(message);

    const socket = new WebSocket('ws://localhost:' + String(CM.COMM_PORT)+ '/');

    // Listen on data, write it to the terminal
    socket.onmessage = ({data}) => { self_.tty.write(data); };
    socket.onclose = () => { self_.tty.write('\r\nConnection closed.\r\n'); };

    self_.el.addEventListener('xrtty-data', ({detail}) => {
      this.interaction_(self_, detail);
      socket.send(detail);
    });
    self_.el.addEventListener('click', () => { console.log('Bare focused on ', self_.el.id); });

    self_.aframeaddon = new AframeAddon(this.gl_);
    self_.tty.term.loadAddon(self_.aframeaddon);
  }

  focused(self_)
  {
    self_.bg_material_.opacity = FOCUSED_OPACITY;
  }

  unfocused(self_)
  {
    self_.bg_material_.opacity = UNFOCUSED_OPACITY;
  }

  show(self_, fg_color_)
  {
    // create BG material and mesh
    self_.bg_geometry_ = new THREE.PlaneGeometry(self_.aframeaddon.canvasSize.x * 0.044,
                                                 self_.aframeaddon.canvasSize.y * 0.044, 8, 8);
    self_.bg_material_ = new THREE.MeshBasicMaterial({color: DEFAULT_BG_COLOR, side: THREE.FrontSide,
                                                      opacity: 0.5, transparent: true });
    self_.el.setObject3D('mesh', new THREE.Mesh(self_.bg_geometry_,
                                                self_.bg_material_));
    self_.el.addEventListener('raycaster-intersected', (obj_) => { this.focused(self_); });
    self_.el.addEventListener('raycaster-intersected-cleared', (obj_) => { this.unfocused(self_); });

    self_.canvas_texture = new THREE.CanvasTexture(self_.aframeaddon.textureAtlas);
    self_.canvas_texture.needsUpdate = true;
    self_.fg_color_ = fg_color_;

    let glyph_geometry = self_.aframeaddon.bufferGeometry;
    var term_mesh = new THREE.Mesh(glyph_geometry,
                                   new THREE.MeshBasicMaterial({map: self_.canvas_texture,
                                                                color: self_.fg_color_, transparent: true}));
    // term_mesh.geometry.boundingSphere = new THREE.Sphere( new THREE.Vector3(0, 0, 0), 40 );
    self_.el_term_ = document.createElement('a-entity');
    self_.el_term_.setObject3D('mesh', term_mesh);

    console.log(self_.aframeaddon.canvasSize);
    self_.el_term_.object3D.position.set(-self_.aframeaddon.canvasSize.x * 0.022,
                                         self_.aframeaddon.canvasSize.y * 0.022, 0.1);

    self_.el.appendChild(self_.el_term_);
  }

  register()
  {
    let self_ = this;

    AFRAME.registerComponent('term-bare', {
      dependencies: ['xrtty'],
      schema: { color: { default: '#ffffff' } },
      init: function()
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
          this.initialized_ = true;
        }
      },
    });
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

  get_dragging_type()
  {
    return CM.WS_PLACEMENT.PLANE;
  }
}

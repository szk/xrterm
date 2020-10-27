"use strict";

class XRTWorkspace
{
  constructor()
  {
    this.input_ = new XRTInput();

    switch (CM.BUILD)
    {
      case 'RAW': console.log("this is raw"); break;
      case 'ELECTRON': console.log("this is electron");  break;
      case 'DEMO': console.log("this is demo"); break;
      default:
    }

    this.config_ = new XRTConfig();
    this.placement_ = new XRTPlacement();

    this.camera_el_ = null;
    this.cmd_queue_ = [];

    this.raycaster = null;
    this.grabbed_el_ = null;

    this.rig = new XRTRig();;
  }

  init(self_)
  {
    this.camera_el_ = document.querySelector('[camera]');
    this.el_ = document.querySelector('[workspace]');

    this.placement_.init();
    this.el_.appendChild(this.placement_.get_base());

    this.rig.init(this.camera_el_);

    let insec_el = this.rig.get_intersection();
    this.el_.appendChild(insec_el);
  }

  tick(self_, time_, delta_)
  {
    this.input_.tick();
    // update rig
    this.rig.tick(this, this.input_, this.config_, this.camera_el_.object3D);

    for (const pressed_key in this.input_.get_pressed()) { this.key_to_cmd_(pressed_key); }
    this.grabbed_el_ = this.rig.get_grabbed();

    // update other command
    this.pointer_to_cmd_();
    this.invoke_cmd_();
  }

  tock(self_, time_, delta_)
  {
    this.input_.tock();
  }

  key_to_cmd_(pressed_key_)
  {
    if (this.input_.get_keystate(this.config_.get_modkey()) == false) { return; }
    let cmd_type = this.config_.key_to_cmdtype(pressed_key_);
    if (cmd_type == null) { return; }
    let cmd = new XRTCommand();
    cmd.init(cmd_type, "0 0 0");
    this.cmd_queue_.push(cmd);
  }

  pointer_to_cmd_()
  {
    this.placement_.watch(this.grabbed_el_,
                          this.rig.get_intersection());
  }

  invoke_cmd_()
  {
    for (const cmd of this.cmd_queue_)
    {
      console.log('cmd found: ' + cmd.get_type());

      switch (cmd.get_type()) {
        case CM.WS_CMD.OPEN_BROWSER:
          console.log('open browser');
          break;
        case CM.WS_CMD.OPEN_TERMINAL:
          console.log('openterminal' + cmd.get_argument());
          this.open_terminal_(null, cmd.get_argument());
          break;
        default:
          break;
      }
    }
    this.cmd_queue_ = [];
  }

  open_terminal_(type_, pos_)
  {
    var new_el_ = document.createElement('a-curvedimage');
    document.querySelector('a-scene').appendChild(new_el_);
    new_el_.classList.add('collidable');
    new_el_.setAttribute('term-dx', {
      'theta-length':'60',
      radius: '6',
      height: '4',
      rotation: '0 150 0',
      position: pos_,
    });
  }

  register()
  {
    this.input_.init(this);
    let self_ws = this; // FIXME

    AFRAME.registerComponent('workspace', {
      schema: {
        acceleration: {default: 65},
        adAxis: {default: 'x', oneOf: ['x', 'y', 'z']},
        adEnabled: {default: true},
        adInverted: {default: false},
        enabled: {default: true},
        fly: {default: false},
        wsAxis: {default: 'z', oneOf: ['x', 'y', 'z']},
        wsEnabled: {default: true},
        wsInverted: {default: false}
      },
      init: function ()
      {
        self_ws.init(self_ws);

        this.el.addEventListener('raycaster-intersected', e_ => { self_ws.raycaster = e_.detail.el; console.log('raycaster intersected'); });
        this.el.addEventListener('raycaster-intersected-cleared', e_ => { self_ws.raycaster = null; console.log('raycaster intersected cleared');});
      },
      update: function() { },
      tick: function (time_, delta_)
      {
        self_ws.tick(this, time_, delta_);
        self_ws.tock(this, time_, delta_);
      },
      tock: function (time_, delta_) { self_ws.tock(this, time_, delta_); },
      remove: function () { self_ws.input.finish(); },
      pause: function() {},
      play: function() {}
    });
  }
}

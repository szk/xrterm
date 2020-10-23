"use strict";

const RIG_ANIMATION_FADEIN = "property: material.opacity; from: 0; to: 1; dur: 100; easing: linear; loop: false";
const RIG_ANIMATION_FADEOUT = "property: material.opacity; from: 1; to: 0; dur: 100; easing: linear; loop: false";
const RIGINFO_ANIMATION_FADEIN = "property: opacity; from: 0; to: 1; dur: 100; easing: linear; loop: false";
const RIGINFO_ANIMATION_FADEOUT = "property: opacity; from: 1; to: 0; dur: 100; easing: linear; loop: false";

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

    this.presense_ = {};
    this.camera_ = null;
    this.cmd_queue_ = [];

    this.is_pointer_active_ = true;
    this.intersection_el_ = null;
    this.grabbed_el_ = null;

    this.rig_el_ = null;
    this.riginfo_el_ = null;
    this.riginfo_els_ = null;
    this.is_mod_on = false;
  }

  init(self_)
  {
    this.easing_ = 1.1;
    this.camera_ = document.querySelector('[camera]').object3D;
    this.camera_el_ = document.querySelector('[camera]');
    this.el_ = document.querySelector('[workspace]');

    this.placement_.init();
    this.el_.appendChild(this.placement_.get_base());

    this.init_rig_();

    // using element system of a-frame
    this.intersection_el_ = document.createElement('a-entity');
    this.intersection_el_.setObject3D('mesh', new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6),
                                                        new THREE.MeshBasicMaterial({color: '#FFF', wireframe:false})));
    this.el_.appendChild(this.intersection_el_);
  }

  tick(obj_, time_, delta_)
  {
    this.input_.tick();

    // show rig
    if (this.is_mod_on == false && this.input_.get_keystate(this.config_.get_modkey()) == true) // pressed
    {
      this.is_mod_on = true;
      this.rig_el_.setAttribute("animation", RIG_ANIMATION_FADEIN);
      this.rig_el_.setAttribute("animation__2", "property: material.color; from: #F0F; to: #00F;");
      for (let info of this.riginfo_els_)
      { info.setAttribute("animation", RIGINFO_ANIMATION_FADEIN); }
    }
    else if (this.input_.get_keystate(this.config_.get_modkey()) != true && this.is_mod_on == true) // released
    {
      this.is_mod_on = false;
      this.rig_el_.setAttribute("animation", RIG_ANIMATION_FADEOUT);
      this.rig_el_.setAttribute("animation__2", "property: material.color; from: #F0F; to: #00F;");


      for (let info of this.riginfo_els_)
      { info.setAttribute("animation",  RIGINFO_ANIMATION_FADEOUT); }
    }

    for (const pressed_key in this.input_.get_pressed()) { this.key_to_cmd_(pressed_key); }
    this.is_pointer_active_ = this.input_.get_sysstate(CM.POINTER_ACTIVE);

    this.pointer_to_cmd_();
    this.invoke_cmd_();


  }

  tock(obj_, time_, delta_)
  {
    this.input_.tock();
  }

  init_rig_()
  {
    this.rig_el_ = document.createElement('a-entity');
    this.rig_el_.setObject3D('mesh', new THREE.Mesh(new THREE.ConeBufferGeometry(0.5, -0.5, 9, 1, true),
                                                    new THREE.MeshBasicMaterial({color: 'skyblue', opacity: 0, side: THREE.FrontSide,
                                                                                 transparent: true })));
    // this.rig_el_.object3D.position.set(0, 1.5, 0);
    this.rig_el_.object3D.position.set(0, -0.4, 0);
    this.riginfo_els_ = [];
    for (let info of CM.RIG_INFO)
    {
      let riginfo_el = document.createElement("a-text");
      riginfo_el.setAttribute("opacity", 0);
      riginfo_el.setAttribute("value", info.text);
      riginfo_el.setAttribute("width", info.width);
      riginfo_el.setAttribute("align", "center");
      riginfo_el.object3D.position.set(0, 0.23, 0);
      riginfo_el.object3D.rotation.set(0, info.angle, 0);
      riginfo_el.object3D.translateZ(-0.4);
      this.rig_el_.appendChild(riginfo_el);
      this.riginfo_els_.push(riginfo_el);
    }
    // this.el_.appendChild(this.rig_el_);
    this.camera_el_.appendChild(this.rig_el_);
  }

  key_to_cmd_(pressed_key_)
  {
    if (this.input_.get_keystate(this.config_.get_modkey()) == false)
    {
      return;
    }

    let cmd_type = this.config_.key_to_cmdtype(pressed_key_);
    if (cmd_type == null) { return; }

    let cmd = new XRTCommand();
    cmd.init(cmd_type, "0 0 0");
    this.cmd_queue_.push(cmd);
  }

  pointer_to_cmd_()
  {
    if (!this.is_pointer_active_) { return; }
    this.placement_.watch(this.grabbed_el_, this.intersection_el_);
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
        console.log(this.data.hoge);
        self_ws.init(self_ws);

        this.el.addEventListener('raycaster-intersected', e_ => { this.raycaster = e_.detail.el; });
        this.el.addEventListener('raycaster-intersected-cleared', e_ => { this.raycaster = null; });

        this.el.addEventListener('click', e_ => {
          if (e_.detail.intersection) { console.log('click' + e_.detail.intersection.point); }});
        this.el.addEventListener('mousedown', e_ => {
          if (e_.detail.intersection) { self_ws.grabbed_el_ = e_.detail.intersection.object.el; }});
        this.el.addEventListener('mouseup', e_ => { self_ws.grabbed_el_ = null; });
      },
      update: function() { },
      tick: function (time_, delta_)
      {
        self_ws.tick(this, time_, delta_);
        self_ws.pointer_(this, self_ws);
      },
      tock: function (time_, delta_) { self_ws.tock(this, time_, delta_); },
      remove: function () { self_ws.input.finish(); },
      pause: function() {},
      play: function() {}
    });
  }

  pointer_(self_)
  {
    if (!self_.raycaster || !this.is_pointer_active_)
    {
      this.intersection_el_.setAttribute('visible', false);
      return;
    }

    let intersected_el = self_.raycaster.components.raycaster.intersectedEls[0];
    let intersection = self_.raycaster.components.raycaster.getIntersection(intersected_el);
    if (!intersection)
    {
      this.intersection_el_.setAttribute('visible', false);
      return;
    }
    this.intersection_el_.setAttribute('visible', true);
    this.intersection_el_.setAttribute('position', intersection.point);

    /* TODO
       let lookAtTarget = new THREE.Vector3().addVectors(intersection.point, intersection.face.normal);
       let el_quat = new THREE.Quaternion;
       this.intersected_el_.object3D.getWorldQuaternion(el_quat);
       self_ws.intersection_el_.object3D.lookAt(lookAtTarget);
    */
  }


}

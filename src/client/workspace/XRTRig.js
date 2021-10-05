"use strict";
const BODY_ANIMATION_FADEIN = "property: material.opacity; from: 0; to: 1; dur: 100; easing: linear; loop: false";
const BODY_ANIMATION_FADEOUT = "property: material.opacity; from: 1; to: 0; dur: 100; easing: linear; loop: false";
const INFO_ANIMATION_FADEIN = "property: opacity; from: 0; to: 1; dur: 100; easing: linear; loop: false";
const INFO_ANIMATION_FADEOUT = "property: opacity; from: 1; to: 0; dur: 100; easing: linear; loop: false";
const COLOR_FIX = "property: material.color; from: #F0F; to: #00F;";

class XRTRig
{
  constructor()
  {
    this.el_ = null;
    this.info_el_ = null;
    this.info_els_ = null;

    this.isection_el_ = null;
    this.isected_el_ = null;
    this.isected_pos = null;

    this.grabbed_el_ = null;

    this.is_active_ = false;
  }

  init(camera_el_)
  {
    this.el_ = document.createElement('a-entity');
    this.el_.setObject3D('mesh', new THREE.Mesh(new THREE.ConeBufferGeometry(0.5, -0.5, 9, 1, true),
                                                new THREE.MeshBasicMaterial({color: 'skyblue', opacity: 0, side: THREE.FrontSide,
                                                                             transparent: true })));
    this.el_.object3D.position.set(0, -0.4, 0);
    this.info_els_ = [];
    for (let info of CM.RIG_INFO)
    {
      let info_el = document.createElement("a-text");
      info_el.setAttribute("opacity", 0);
      info_el.setAttribute("value", info.text);
      info_el.setAttribute("width", info.width);
      info_el.setAttribute("align", "center");
      info_el.object3D.position.set(0, 0.23, 0);
      info_el.object3D.rotation.set(0, info.angle, 0);
      info_el.object3D.translateZ(-0.4);
      this.el_.appendChild(info_el);
      this.info_els_.push(info_el);
    }
    camera_el_.appendChild(this.el_);

    // using element system of a-frame
    this.isection_el_ = document.createElement('a-entity');
    this.isection_el_.setObject3D('mesh', new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6),
                                                         new THREE.MeshBasicMaterial({color: '#0FF', wireframe:false})));
  }

  tick(self_ws_, input_, config_, camera_)
  {
    // Mod key
    if (this.is_active_ == false && input_.get_keystate(config_.get_modkey()) == true) { this.pressed_(); }
    else if (input_.get_keystate(config_.get_modkey()) != true && this.is_active_ == true) { this.released_(); }

    // Raycaster
    let pos = new THREE.Vector3();
    let dir = new THREE.Vector3();
    let offset = new THREE.Vector2(0, 0); // FIXME

    pos.setFromMatrixPosition(camera_.matrixWorld);
    dir.set(offset.x, offset.y, 0.5).unproject(camera_.children[0]).sub(pos).normalize();
    self_ws_.el_.setAttribute('raycaster', { origin: pos, direction: dir });

    this.pointer_(self_ws_);
  }

  get_intersection()
  {
    return this.isection_el_;
  }

  get_intersected()
  {
    return this.isected_el_;
  }

  get_grabbed()
  {
    return this.grabbed_el_;
  }

  is_active()
  {
    return this.is_active_;
  }

  pointer_(self_ws_)
  {

    if (!self_ws_.raycaster)// || !this.is_pointer_active_)
    {
      // this.intersection_el_.setAttribute('visible', true);
      this.isection_el_.setAttribute('visible', false);
      this.isected_el_ = null;
      return;
    }

    this.isected_el_ = self_ws_.raycaster.components.raycaster.intersectedEls[0];
    let intersection = self_ws_.raycaster.components.raycaster.getIntersection(this.isected_el_);

    if (!intersection) { this.isection_el_.setAttribute('visible', false); return; }

    this.isected_pos = intersection.point;
    this.isection_el_.setAttribute('visible', true);
    this.isection_el_.setAttribute('position', this.isected_pos);
  }

  pressed_()
  {
    this.is_active_ = true;
    this.el_.setAttribute("animation", BODY_ANIMATION_FADEIN);
    this.el_.setAttribute("animation__2", COLOR_FIX);
    for (let info of this.info_els_)
    { info.setAttribute("animation", INFO_ANIMATION_FADEIN); }

    if (!this.isected_el_) { return; }
    this.grabbed_el_ = this.isected_el_;
  }

  released_()
  {
    this.is_active_ = false;
    this.el_.setAttribute("animation", BODY_ANIMATION_FADEOUT);
    this.el_.setAttribute("animation__2", COLOR_FIX);

    for (let info of this.info_els_)
    { info.setAttribute("animation",  INFO_ANIMATION_FADEOUT); }

    this.grabbed_el_ = null;
  }
}

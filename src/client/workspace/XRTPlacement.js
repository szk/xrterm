"use strict";

const GRAB_START_OPAC = "property: opacity; dur: 200; from: 1; to: 1";
const GRAB_FINISH_OPAC = "property: opacity; dur: 200; from: 1; to: 1";

class XRTPlacement
{
  constructor()
  {
    this.el_ = null;
    this.plane_el_ = null;
    this.cylinder_el_ = null;
    this.sphere_el_ = null;

    this.grabbed_pre_el_ = null;
    this.grabbed_el_ = null;
    this.grabbed_offset_pos_ = new THREE.Vector3();

    this.space_ = {};
  }

  init()
  {
    this.el_ = document.createElement('a-entity');
    let space_instances = [new XRTSpcPlane(), new XRTSpcCylinder(), new XRTSpcSphere()];

    for (let spc_i of space_instances)
    {
      spc_i.init();
      this.space_[spc_i.get_classname()] = spc_i;
      this.el_.appendChild(spc_i.get_base());
    }

    this.hide();
  }

  hide()
  {
    for (let spc in this.space_) { this.space_[spc].hide(); }
  }

  get_base()
  {
    return this.el_;
  }

  watch(grabbed_el_, intersection_el_)
  {
    this.grabbed_el_ = grabbed_el_;
    this.intersection_el_ = intersection_el_;

    this.grabbing();

    this.grabbed_pre_el_ = this.grabbed_el_;
  }

  grabbing()
  {
    let current_space = null;
    if (this.grabbed_el_ != null)
    {
      current_space = this.space_[CM.FUNC.get_prefixed_name(this.grabbed_el_.classList, 'is-drag-on-')];
      if (current_space == null) { return; }
    }
    else if (this.grabbed_pre_el_ != null) // end grabbing
    {
      let pre_space = this.space_[CM.FUNC.get_prefixed_name(this.grabbed_pre_el_.classList, 'is-drag-on-')];
      if (pre_space) { pre_space.end(); }
      this.grabbed_pre_el_.classList.add('collidable');

      return;
    }
    else { return; }

    if (this.grabbed_pre_el_ == null) // start grabbing
    {
      let current_space_el = current_space.get_base();
      current_space_el.setAttribute('visible', true);
      current_space_el.classList.add('collidable');
      this.grabbed_el_.classList.remove('collidable');

      current_space.start(this.grabbed_el_, this.intersection_el_);
      return;
    }

    if (this.grabbed_pre_el_ != null) // during grabbing
    {
      current_space.during(this.grabbed_el_, this.intersection_el_);
      return;
    }
  }
}

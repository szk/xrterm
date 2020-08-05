"use strict";

class XRTSpcPlane
{
  constructor()
  {
    this.classname_ = 'is-drag-on-plane';
    this.el_ = null;
    this.grabbed_offset_pos_ = new THREE.Vector3();
  }

  init()
  {
    this.el_ = document.createElement('a-entity');
    this.el_.setObject3D('mesh', new THREE.Mesh(new THREE.PlaneGeometry(6, 6, 8, 8),
                                                new THREE.MeshBasicMaterial({color: 0xff0000, wireframe:true })));
    this.el_.classList.add('collidable');
    this.hide();

    return this.el_;
  }

  get_base()
  {
    return this.el_;
  }

  get_classname()
  {
    return this.classname_;
  }

  start(grabbed_el_, intersection_el_)
  {
    CM.FUNC.copy_mtx(this.el_.object3D, grabbed_el_.object3D.matrixWorld);

    let intersected_pos = new THREE.Vector3();
    intersection_el_.object3D.getWorldPosition(intersected_pos);
    grabbed_el_.object3D.getWorldPosition(this.grabbed_offset_pos_);
    this.grabbed_offset_pos_.sub(intersected_pos);
  }

  during(grabbed_el_, intersection_el_)
  {
    let pointer_pos = new THREE.Vector3();
    intersection_el_.object3D.getWorldPosition(pointer_pos);
    pointer_pos.add(this.grabbed_offset_pos_);
    grabbed_el_.setAttribute('position', pointer_pos);
  }

  end()
  {
    this.hide();
  }

  hide()
  {
    this.el_.setAttribute('visible', false);
    this.el_.classList.remove('collidable');
  }
}

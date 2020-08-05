"use strict";

class XRTSpcCylinder
{
  constructor()
  {
    this.classname_ = 'is-drag-on-cylinder';
    this.geometry_ = null;
    this.mtl_ = null;
    this.el_ = null;
    this.grabbed_offset_pos_ = new THREE.Vector3();
  }

  init()
  {
    this.mtl_ = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe:true, side:THREE.BackSide });
    this.el_ = document.createElement('a-entity');
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
    let params = grabbed_el_.object3D.children[0].geometry.metadata.parameters;
    console.log(params);
    if (params.radiusBottom && params.radiusTop) // is this a cylinder?
    {

      this.el_.setObject3D('mesh', new THREE.Mesh(new THREE.CylinderGeometry(params.radiusBottom, params.radiusTop,
                                                                             params.height * 2, 36, 8, true),
                                                  this.mtl_));

      /*
        height: 4
        heightSegments: 18
        openEnded: true
        radialSegments: 48
        radiusBottom: 6
        radiusTop: 6
        thetaLength: 1.0471975511965976
        thetaStart: 0
      */
    }

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

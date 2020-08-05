"use strict";

class XRTSpcSphere
{
  constructor()
  {
    this.classname_ = 'is-drag-on-sphere';
    this.geometry_ = null;
    this.mtl_ = null;
    this.el_ = null;
    this.grabbed_offset_pos_ = new THREE.Vector3();

    this.camera_ = document.querySelector('[camera]').object3D;

    this.el_pos_ = null;
    this.start_pos_ = null;
    this.end_pos_ = null;
  }

  init()
  {
    this.mtl_ = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe:true, side:THREE.BackSide });
    this.el_ = document.createElement('a-entity');
    this.el_.classList.add('collidable');

    this.hide();

    this.el_pos_ = new THREE.Vector3;
    this.start_pos_ = new THREE.Vector3;
    this.end_pos_ = new THREE.Vector3;

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

    if (params.radius && params.heightSegments) // is this a cylinder?
    {
      this.el_.setObject3D('mesh', new THREE.Mesh(new THREE.SphereGeometry(params.radius, 8, 8),
                                                  this.mtl_));
    }
    // CM.FUNC.copy_mtx(this.el_.object3D, grabbed_el_.object3D.matrixWorld);
    this.el_.setAttribute('position', grabbed_el_.object3D.position);
    // this.el_.object3D.setWorldPosition(grabbed_el_.object3D.matrixWorld);

    let intersected_pos = new THREE.Vector3();
    intersection_el_.object3D.getWorldPosition(intersected_pos);
    grabbed_el_.object3D.getWorldPosition(this.grabbed_offset_pos_);
    this.grabbed_offset_pos_.sub(intersected_pos);

    grabbed_el_.object3D.getWorldPosition(this.el_pos_);
    this.start_pos_.set(intersected_pos);
    this.start_pos_.normalize();
  }

  during(grabbed_el_, intersection_el_)
  {
    let during_pos = new THREE.Vector3();
    intersection_el_.object3D.getWorldPosition(during_pos);
    // during_pos.add(this.grabbed_offset_pos_);
    // grabbed_el_.setAttribute('position', during_pos);

    let spherical = new THREE.Spherical();
    spherical.setFromCartesianCoords(during_pos.x, during_pos.y, during_pos.z);
    let x = spherical.radius;
    let y = THREE.Math.radToDeg(spherical.theta) + 45;
    let z = THREE.Math.radToDeg(spherical.phi) * 2 - 90;

    y = THREE.Math.radToDeg(spherical.theta) + 90;
    z = THREE.Math.radToDeg(spherical.phi) - 90;

    let rot = new THREE.Vector3();
    rot.set(0, y, z);
    grabbed_el_.setAttribute('rotation', rot);

    let caption_obj = document.getElementById('caption');
    caption_obj.setAttribute('position', during_pos);
    document.getElementById('caption').setAttribute('text', {value: '[' + x.toFixed(2) + ', ' + y.toFixed(2) + ',' + z.toFixed(2) + ']'});
    caption_obj.setAttribute('scale', '5 5 5');
    CM.FUNC.billboard(caption_obj.object3D, this.camera_);
    caption_obj.setAttribute('translation', '0 1 0');
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

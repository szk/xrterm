"use strict";

class XRTSpcSphere
{
  constructor()
  {
    this.classname_ = 'is-drag-on-sphere';
    this.geometry_ = null;
    this.mtl_ = null;
    this.el_ = null;

    this.start_pos_ = null;
    this.end_pos_ = null;
  }

  init()
  {
    this.mtl_ = new THREE.MeshBasicMaterial({color: '#0f0', wireframe:true, side:THREE.BackSide });
    this.el_ = document.createElement('a-entity');
    this.el_.classList.add('collidable');

    this.hide();

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
    this.el_.setAttribute('position', grabbed_el_.object3D.position);
    let intersected_pos = new THREE.Vector3();
    intersection_el_.object3D.getWorldPosition(intersected_pos);

    this.start_pos_.set(intersected_pos);
    // this.start_pos_.normalize();
  }

  during(grabbed_el_, intersection_el_)
  {
    let during_pos = new THREE.Vector3();
    intersection_el_.object3D.getWorldPosition(during_pos);

    let spherical = new THREE.Spherical();
    spherical.setFromCartesianCoords(during_pos.x, during_pos.y, during_pos.z);
    let x = spherical.radius;
    let y = THREE.Math.radToDeg(spherical.theta) + 90;
    let z = THREE.Math.radToDeg(spherical.phi) - 90;
    grabbed_el_.setAttribute('rotation', {x: 0, y: y, z:z});
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

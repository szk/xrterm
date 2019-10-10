"use strict";

var CLAMP_VELOCITY = 0.00001;
var MAX_DELTA = 0.2;

class XRWorkspace
{
  constructor()
  {
    this.input = new XRInput();
    this.config = new XRConfig();

    this.placement = new XRPlacement();

    this.presense = {};
    this.velocity = new THREE.Vector3();
    this.camera = null;
  }

  init(obj_)
  {
    this.easing = 1.1;
    this.camera = document.querySelector('[camera]').object3D;
  }

  getRandomColor()
  {
    const letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  tick(obj_, time_, delta_)
  {
    let cmd_queue = this.input_to_cmd(this.input.get_state());
    this.cmd_to_invoke(cmd_queue, obj_.el);

  }

  tock(obj_, time_, delta_)
  {
    this.input.tock();
  }

  input_to_cmd(keys_)
  {
    let cmd_queue = [];
    if (keys_[this.config.get_modkey()] == true)
    {
      if (this.input.get_pressed()['Enter'])
      {
        this.placement.get_faced(this.camera);
        cmd_queue.push(CM.WS_CMD.OPEN_TERMINAL);
      }

      if (this.input.get_pressed()['Tab'])
      {
      }
      if (this.input.get_released()['Tab'])
      {
        console.log('released' + this.input.get_released());
      }
    }

    return cmd_queue;
  }

  cmd_to_invoke(cmd_queue_, el_)
  {
    for (let cmd in cmd_queue_)
    {
      console.log('cmd found: ' + cmd_queue_);
      if (cmd == CM.WS_CMD.OPEN_BROWSER)
      {
        console.log('open browser');
      }
    }

    let mode = CM.WS_MODE.CONTROL;

    for (let child in el_)
    {
      // child.el.setAttribute('material', 'color', color);
      // console.log(child);
    }

    // console.log('pressed' + this.input.get_pressed());
    for (let cmd in cmd_queue_)
    {
      // if (CM.WS_CMD.MOVE_UP)
      // {
      //   let color = this.getRandomColor();
      //   el_.setAttribute('material', 'color', color);
      //   break;
      // }
      if (CM.WS_CMD.OPEN_TERMINAL)
      {
        console.log('openterminal');
        this.openTerminal(null);
        break;
      }
    }

    // Get movement vector and translate position.
    // el.object3D.position.add(this.getMovementVector(obj_, delta_));

  }

  openTerminal(type_)
  {
    // console.log(this.placement.get_lookat());
    // return;

    var new_el = document.createElement('a-curvedimage');
    document.querySelector('a-scene').appendChild(new_el);
    new_el.classList.add('terminal');
    new_el.setAttribute('term-dx', {
      'theta-length':'60',
      radius: '6',
      height: '4',
      rotation: '0 150 0',
      position: '0 0 0',
    });
  }

  keydownevent(code_)
  {
    if (code_ == 'ShiftLeft')
    {
      this.cmd_queue.push(CM.WS_CMD.OPEN_BROWSER);
    }

    return null;
  }

  register ()
  {
    this.input.init(this);
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
      init: function () { self_ws.init(self_ws); },
      update: function() { },
      tick: function (time_, delta_) { self_ws.tick(this, time_, delta_); },
      tock: function (time_, delta_) { self_ws.tock(this, time_, delta_); },
      remove: function () { self_ws.input.finish(); },
      pause: function() {},
      play: function() {}
    });
  }


}
/*
  tick_a(obj_, time_, delta_)
  {
    var data = obj_.data;
    var el = obj_.el;
    var velocity = this.velocity;

    if (!velocity[data.adAxis] && !velocity[data.wsAxis] && this.isEmptyObject(this.input.keys))
    { return; }

    // Update velocity.
    delta_ = delta_ / 1000;
    this.updateVelocity(obj_, delta_);

    if (!velocity[data.adAxis] && !velocity[data.wsAxis]) { return; }

    // Get movement vector and translate position.
    el.object3D.position.add(this.getMovementVector(obj_, delta_));
  }

  getMovementVector(obj_, delta_) {
    var directionVector = new THREE.Vector3(0, 0, 0);
    var rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    return function (delta) {
      var rotation = obj_.el.getAttribute('rotation');
      var velocity = this.velocity;
      var xRotation;

      directionVector.copy(velocity);
      directionVector.multiplyScalar(delta);

      // Absolute.
      if (!rotation) { return directionVector; }

      xRotation = obj_.data.fly ? rotation.x : 0;

      // Transform direction relative to heading.
      rotationEuler.set(THREE.Math.degToRad(xRotation), THREE.Math.degToRad(rotation.y), 0);
      directionVector.applyEuler(rotationEuler);
      return directionVector;
    };
  }

  updateVelocity(obj_, delta_)
  {
    var acceleration;
    var adAxis;
    var adSign;
    var data = obj_.data;
    var keys = this.input.keys;
    var velocity = this.velocity;
    var wsAxis;
    var wsSign;

    adAxis = data.adAxis;
    wsAxis = data.wsAxis;

    // If FPS too low, reset velocity.
    if (delta_ > MAX_DELTA)
    {
      velocity[adAxis] = 0;
      velocity[wsAxis] = 0;
      return;
    }

    // https://gamedev.stackexchange.com/questions/151383/frame-rate-independant-movement-with-acceleration
    var scaledEasing = Math.pow(1 / this.easing, delta_ * 60);
    // Velocity Easing.
    if (velocity[adAxis] !== 0) {
      velocity[adAxis] -= velocity[adAxis] * scaledEasing;
    }
    if (velocity[wsAxis] !== 0) {
      velocity[wsAxis] -= velocity[wsAxis] * scaledEasing;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[adAxis]) < CLAMP_VELOCITY) { velocity[adAxis] = 0; }
    if (Math.abs(velocity[wsAxis]) < CLAMP_VELOCITY) { velocity[wsAxis] = 0; }

    if (!data.enabled) { return; }

    // Update velocity using keys pressed.
    acceleration = data.acceleration;
    if (data.adEnabled) {
      adSign = data.adInverted ? -1 : 1;
      if (keys.KeyA || keys.ArrowLeft) { velocity[adAxis] -= adSign * acceleration * delta_; }
      if (keys.KeyD || keys.ArrowRight) { velocity[adAxis] += adSign * acceleration * delta_; }
    }
    if (data.wsEnabled) {
      wsSign = data.wsInverted ? -1 : 1;
      if (keys.KeyW || keys.ArrowUp) { velocity[wsAxis] -= wsSign * acceleration * delta_; }
      if (keys.KeyS || keys.ArrowDown) { velocity[wsAxis] += wsSign * acceleration * delta_; }
    }
  }
*/

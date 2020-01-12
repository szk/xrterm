"use strict";

var EVENTS = {
  CLICK: 'click',
  MOUSEENTER: 'mouseenter',
  MOUSEDOWN: 'mousedown',
  MOUSELEAVE: 'mouseleave',
  MOUSEUP: 'mouseup'
};

var STATES = {
  HOVERING: 'cursor-hovering',
  HOVERED: 'cursor-hovered'
};

var CANVAS_EVENTS = {
  DOWN: ['mousedown', 'touchstart'],
  UP: ['mouseup', 'touchend']
};

var CANVAS_HOVER_CLASS = 'a-mouse-cursor-hover';

/**
 * Cursor component. Applies the raycaster component specifically for starting the raycaster
 * from the camera and pointing from camera's facing direction, and then only returning the
 * closest intersection. Cursor can be fine-tuned by setting raycaster properties.
 *
 * @member {Element} cursorDownEl - Entity that was last mousedowned during current click.
 * @member {object} intersection - Attributes of the current intersection event, including
 *         3D- and 2D-space coordinates. See: http://threejs.org/docs/api/core/Raycaster.html
 * @member {Element} intersectedEl - Currently-intersected entity. Used to keep track to
 *         emit events when unintersecting.
 */
AFRAME.registerComponent('placement', {
  dependencies: ['raycaster'],

  schema: {
    downEvents: {default: []},
    mouseCursorStylesEnabled: {default: true},
    upEvents: {default: []},
    rayOrigin: {default: 'entity', oneOf: ['mouse', 'entity']}
  },

  init: function () {
    var self = this;

    /// indicator /
    var scene_el = document.querySelector('a-scene');
    this.dest_indicator = document.createElement('a-triangle');
    this.dest_indicator.setAttribute('color', '#CCC');
    this.dest_indicator.setAttribute('vertex-c', '1 -1 0');

    // this.intersect_line = null;
    this.intersect_mesh = null;
		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position',
                          new THREE.BufferAttribute( new Float32Array( 4 * 3 ), 3 ) );
		var material = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true } );
    this.intersect_line = new THREE.Line( geometry, material );

    scene_el.appendChild(this.dest_indicator);

    /// / indicator

    this.cursorDownEl = null;
    this.intersected_el = null;
    this.canvasBounds = document.body.getBoundingClientRect();
    this.isCursorDown = false;

    // Debounce.
    this.updateCanvasBounds = debounce(function updateCanvasBounds () {
      self.canvasBounds = self.el.sceneEl.canvas.getBoundingClientRect();
    }, 500);

    this.eventDetail = {};
    this.intersectedEventDetail = {cursorEl: this.el};

    // Bind methods.
    this.onCursorDown = bind(this.onCursorDown, this);
    this.onCursorUp = bind(this.onCursorUp, this);
    this.onIntersection = bind(this.onIntersection, this);
    this.onIntersectionCleared = bind(this.onIntersectionCleared, this);
    this.onMouseMove = bind(this.onMouseMove, this);
  },

  update: function (oldData) {
    if (this.data.rayOrigin === oldData.rayOrigin) { return; }
    this.updateMouseEventListeners();
  },

  play: function () { this.addEventListeners(); },
  pause: function () { this.removeEventListeners(); },
  remove: function () {
    var el = this.el;
    el.removeState(STATES.HOVERING);
    if (this.intersected_el) { this.intersected_el.removeState(STATES.HOVERED); }
    this.removeEventListeners();
  },

  addEventListeners: function () {
    let data = this.data;
    let el = this.el;
    let self = this;

    function addCanvasListeners () {
      let canvas = el.sceneEl.canvas;
      if (data.downEvents.length || data.upEvents.length) { return; }
      CANVAS_EVENTS.DOWN.forEach(function (downEvent) {
        canvas.addEventListener(downEvent, self.onCursorDown);
      });
      CANVAS_EVENTS.UP.forEach(function (upEvent) {
        canvas.addEventListener(upEvent, self.onCursorUp);
      });
    }

    if (el.sceneEl.canvas) { addCanvasListeners(); }
    else { el.sceneEl.addEventListener('render-target-loaded', addCanvasListeners); }

    data.downEvents.forEach(function (downEvent) { el.addEventListener(downEvent, self.onCursorDown); });
    data.upEvents.forEach(function (upEvent) { el.addEventListener(upEvent, self.onCursorUp); });
    el.addEventListener('raycaster-intersection', this.onIntersection);
    el.addEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);

    el.sceneEl.addEventListener('rendererresize', this.updateCanvasBounds);
    window.addEventListener('resize', this.updateCanvasBounds);
    window.addEventListener('scroll', this.updateCanvasBounds);

    this.updateMouseEventListeners();
  },

  removeEventListeners: function () {
    let data = this.data;
    let el = this.el;
    let self = this;
    let canvas = el.sceneEl.canvas;
    if (canvas && !data.downEvents.length && !data.upEvents.length)
    {
      CANVAS_EVENTS.DOWN.forEach(function (downEvent) { canvas.removeEventListener(downEvent, self.onCursorDown); });
      CANVAS_EVENTS.UP.forEach(function (upEvent) { canvas.removeEventListener(upEvent, self.onCursorUp); });
    }

    data.downEvents.forEach(function (downEvent) { el.removeEventListener(downEvent, self.onCursorDown); });
    data.upEvents.forEach(function (upEvent) { el.removeEventListener(upEvent, self.onCursorUp); });
    el.removeEventListener('raycaster-intersection', this.onIntersection);
    el.removeEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);
    canvas.removeEventListener('mousemove', this.onMouseMove);
    canvas.removeEventListener('touchstart', this.onMouseMove);
    canvas.removeEventListener('touchmove', this.onMouseMove);

    el.sceneEl.removeEventListener('rendererresize', this.updateCanvasBounds);
    window.removeEventListener('resize', this.updateCanvasBounds);
    window.removeEventListener('scroll', this.updateCanvasBounds);
  },

  updateMouseEventListeners: function () {
    let el = this.el;
    let canvas = el.sceneEl.canvas;
    canvas.removeEventListener('mousemove', this.onMouseMove);
    canvas.removeEventListener('touchmove', this.onMouseMove);
    el.setAttribute('raycaster', 'useWorldCoordinates', false);
    if (this.data.rayOrigin !== 'mouse') { return; }
    canvas.addEventListener('mousemove', this.onMouseMove, false);
    canvas.addEventListener('touchmove', this.onMouseMove, false);
    el.setAttribute('raycaster', 'useWorldCoordinates', true);
    this.updateCanvasBounds();
  },

  onMouseMove: (function () {
    let direction = new THREE.Vector3();
    let mouse = new THREE.Vector2();
    let origin = new THREE.Vector3();
    let rayCasterConfig = {origin: origin, direction: direction};

    return function (ev_) {
      let bounds = this.canvasBounds;
      let camera = this.el.sceneEl.camera;
      let point;
      camera.parent.updateMatrixWorld();

      // Calculate mouse position based on the canvas element
      if (ev_.type === 'touchmove' || ev_.type === 'touchstart')
      {
        // Track the first touch for simplicity.
        point = ev_.touches.item(0);
      }
      else { point = ev_; }

      let left = point.clientX - bounds.left;
      let top = point.clientY - bounds.top;
      mouse.x = (left / bounds.width) * 2 - 1;
      mouse.y = -(top / bounds.height) * 2 + 1;

      origin.setFromMatrixPosition(camera.matrixWorld);
      direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(origin).normalize();
      this.el.setAttribute('raycaster', rayCasterConfig);
      if (ev_.type === 'touchmove') { ev_.preventDefault(); }
    };
  })(),

  /**
   * Trigger mousedown and keep track of the mousedowned entity.
   */
  onCursorDown: function (ev_) {
    this.isCursorDown = true;
    // Raycast again for touch.
    if (this.data.rayOrigin === 'mouse' && ev_.type === 'touchstart')
    {
      console.log('hoge');
      this.onMouseMove(ev_);
      this.el.components.raycaster.checkIntersections();
      ev_.preventDefault();
    }

    this.twoWayEmit(EVENTS.MOUSEDOWN);
    this.cursorDownEl = this.intersected_el;
  },

  /**
   * Trigger mouseup if:
   * - Currently intersecting an entity.
   * - Currently-intersected entity is the same as the one when mousedown was triggered,
   *   in case user mousedowned one entity, dragged to another, and mouseupped.
   */
  onCursorUp: function (ev_)
  {
    if (!this.isCursorDown) { return; }

    this.isCursorDown = false;

    let data = this.data;
    this.twoWayEmit(EVENTS.MOUSEUP);

    // If intersected entity has changed since the cursorDown, still emit mouseUp on the
    // previously cursorUp entity.
    if (this.cursorDownEl && this.cursorDownEl !== this.intersected_el)
    {
      this.intersectedEventDetail.intersection = null;
      this.cursorDownEl.emit(EVENTS.MOUSEUP, this.intersectedEventDetail);
    }

    if ((data.rayOrigin === 'mouse') &&
        this.intersected_el && this.cursorDownEl === this.intersected_el)
    {
      this.twoWayEmit(EVENTS.CLICK);
    }

    this.cursorDownEl = null;
    if (ev_.type === 'touchend') { ev_.preventDefault(); }
  },

  /**
   * Handle intersection.
   */
  onIntersection: function (ev_) {
    // Select closest object, excluding the cursor.
    let index = ev_.detail.els[0] === this.el ? 1 : 0;
    let intersection = ev_.detail.intersections[index];
    let intersected_el = ev_.detail.els[index];

    // If cursor is the only intersected object, ignore the event.
    if (!intersected_el) { return; }

    // Already intersecting this entity.
    // if (this.intersected_el === intersected_el) { return; }

    // Ignore events further away than active intersection.
    if (this.intersected_el) {
      let current_intersection = this.el.components.raycaster.getIntersection(this.intersected_el);
      if (current_intersection && current_intersection.distance <= intersection.distance)
      { return; }
    }

    // Unset current intersection.
    this.clearCurrentIntersection(true);

    this.setIntersection(intersected_el, intersection);
  },

  /**
   * Handle intersection cleared.
   */
  onIntersectionCleared: function (ev_) {
    var cleared_els = ev_.detail.clearedEls;
    // Check if the current intersection has ended
    if (cleared_els.indexOf(this.intersected_el) === -1) { return; }
    this.clearCurrentIntersection();
  },

  update_indicator: function(el_, point_, face_) {
    let cursor_pos = new THREE.Vector3().addVectors(point_, face_.normal.multiplyScalar(0.1));
    this.dest_indicator.setAttribute("position", cursor_pos);
    let lookAtTarget = new THREE.Vector3().addVectors(point_, face_.normal);
    this.dest_indicator.setAttribute("look-at", lookAtTarget);
  },

  setIntersection: function (intersected_el_, intersection_) {
    let cursorEl = this.el;

    // Already intersecting.
    // if (this.intersected_point === intersection_.point) { console.log('same_point'); return; }
    this.update_indicator(intersected_el_, intersection_.point, intersection_.face);

    // Set new intersection.
    this.intersected_el = intersected_el_;
    this.intersected_point = intersection_.point;

    // Hovering.
    cursorEl.addState(STATES.HOVERING);
    intersected_el_.addState(STATES.HOVERED);
    this.twoWayEmit(EVENTS.MOUSEENTER);

    if (this.data.mouseCursorStylesEnabled && this.data.rayOrigin === 'mouse') {
      this.el.sceneEl.canvas.classList.add(CANVAS_HOVER_CLASS);
    }
  },

  clearCurrentIntersection: function (ignore_remaining_) {
    let cursor_el = this.el;

    // Nothing to be cleared.
    if (!this.intersected_el) { return; }

    // No longer hovering
    this.intersected_el.removeState(STATES.HOVERED);
    cursor_el.removeState(STATES.HOVERING);
    this.twoWayEmit(EVENTS.MOUSELEAVE);

    if (this.data.mouseCursorStylesEnabled && this.data.rayOrigin === 'mouse')
    { this.el.sceneEl.canvas.classList.remove(CANVAS_HOVER_CLASS); }

    // Unset intersected entity (after emitting the event).
    this.intersected_el = null;
    this.intersected_point = null;

    // Set intersection to another raycasted element if any.
    if (ignore_remaining_ === true) { return; }
    let intersections = this.el.components.raycaster.intersections;
    if (intersections.length === 0) { return; }
    // Exclude the cursor.
    let index = intersections[0].object.el === cursor_el ? 1 : 0;
    let intersection = intersections[index];
    if (!intersection) { return; }
    this.setIntersection(intersection.object.el, intersection);
  },

  /**
   * Helper to emit on both the cursor and the intersected entity (if exists).
   */
  twoWayEmit: function (ev_name_) {
    let el = this.el;
    let intersected_el = this.intersected_el;
    let intersection;

    intersection = this.el.components.raycaster.getIntersection(intersected_el);
    this.eventDetail.intersected_el = intersected_el;
    this.eventDetail.intersection = intersection;
    el.emit(ev_name_, this.eventDetail);

    if (!intersected_el) { return; }

    this.intersectedEventDetail.intersection = intersection;
    intersected_el.emit(ev_name_, this.intersectedEventDetail);
  }
});



class XRPlacement
{
  constructor()
  {
  }

  get_lookat(el_)
  {
    // var position = new THREE.Vector3();
    // var rotation = new THREE.Euler();

    // el_.object3D.getWorldPosition(position);
    // el_.object3D.getWorldRotation(rotation);

    // return (position, rotation);
  }

  get_faced(el_)
  {
    let pos = new THREE.Vector3();
    let dir = new THREE.Vector3();
/*
    let pos = new THREE.Vector3();
    let quat = new THREE.Quaternion();
    el_.getWorldPosition(pos);
    el_.getWorldQuaternion(quat);

    quat.normalize();
    let direction = new THREE.Vector3();
    direction.applyQuaternion(quat);

    console.log(direction);

    let raycaster = new THREE.Raycaster();
    // raycaster.set(pos, rotation);

    raycaster.setFromCamera(new THREE.Vector2(0.5, 0.5) , el_ );

	  // calculate objects intersecting the picking ray
	  var intersects = raycaster.intersectObjects( scene.children );

	  for ( var i = 0; i < intersects.length; i++ ) {

		  intersects[ i ].object.material.color.set( 0xff0000 );

	  }

*/
    return (pos, dir);
  }
}

/**
 * Crawling Cursor component for A-Frame.
 */
AFRAME.registerComponent('crawling-cursor', {
	dependencies: ['raycaster'],
	schema: {
	  target: {
	    type: "selector"
	  },
	  offset: {
	    // How far above the intersection point does the cursor hover? (Default 5cm)
	    type: "number",
	    default: 0.05,
	  }
	},

	multiple: false,

	init: function() {
	  var el = this.el;
	  var data = this.data;

	  if (data.target === null) {
	    var cursor = document.querySelector("a-cursor");

	    if (cursor === null) {
	      console.warn("Please put a-cursor in a document");
	      return;
	    }

	    data.target = cursor;
	  }

	  el.addEventListener("raycaster-intersection", function(e) {

	    var intersection = getNearestIntersection(e.detail.intersections);
	    if (!intersection) { return; }

	    // a matrix which represents item's movement, rotation and scale on global world
	    var mat = intersection.object.matrixWorld;
	    // remove parallel movement from the matrix
	    mat.setPosition(new THREE.Vector3(0, 0, 0));

	    // change local normal into global normal
	    var global_normal = intersection.face.normal.clone().applyMatrix4(mat).normalize();

	    // look at target coordinate = intersection coordinate + global normal vector
	    var lookAtTarget = new THREE.Vector3().addVectors(intersection.point, global_normal);
	    data.target.object3D.lookAt(lookAtTarget);

	    // cursor coordinate = intersection coordinate + normal vector * offset
	    var cursorPosition = new THREE.Vector3().addVectors(intersection.point, global_normal.multiplyScalar(data.offset));
	    data.target.setAttribute("position", cursorPosition);

	    function getNearestIntersection(intersections) {
	      for (var i = 0, l = intersections.length; i < l; i++) {

	        // ignore cursor itself to avoid flicker && ignore "ignore-ray" class
	        if (data.target === intersections[i].object.el || intersections[i].object.el.classList.contains("ignore-ray")) { continue; }
	        return intersections[i];
	      }
	      return null;
	    }
	  });

	  setInterval(function() {
	    el.components.raycaster.refreshObjects();
	  }, 100);
	}
});

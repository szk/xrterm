"use strict";

var should_capture_keyevent = function (event) {
  if (event.metaKey) { return false; }
  return document.activeElement === document.body;
};

class XRTInput
{
  constructor()
  {
    this.target_ = null;
    this.keystate_ = {};
    this.sysstate_ = {};
    this.pressed_ = {};
    this.released_ = {};
  }

  init(el_)
  {
    this.target_ = el_;

    // Initial system state
    this.sysstate_[CM.POINTER_ACTIVE] = true;

    // Bind methods and add event listeners.
    this.target_.onBlur = bind(this.on_blur_, this);
    this.target_.onFocus = bind(this.on_focus_, this);
    this.target_.onKeyDown = bind(this.on_key_down_, this);
    this.target_.onKeyUp = bind(this.on_key_up_, this);
    this.target_.onMouseOut = bind(this.on_mouse_out_, this);
    this.target_.onMouseOver = bind(this.on_mouse_over_, this);
    this.target_.onVisibilityChange = bind(this.on_visibility_change_, this);
    this.add_visibility_event_listeners_();
    this.on_focus_();
  }

  finish(el_)
  {
    this.remove_keyevent_listeners_();
    this.remove_visibility_event_listeners_();
    this.clear();
  }

  clear()
  {
    this.keystate_ = {};
    this.sysstate_ = {};
    this.pressed_ = {};
    this.released_ = {};
  }

  tick()
  {
  }

  tock()
  {
    this.pressed_ = {};
    this.released_ = {};
  }

  get_keystate(code_) { return this.keystate_[code_]; }
  get_sysstate(code_) { return this.sysstate_[code_]; }
  get_pressed() { return this.pressed_; }
  get_released() { return this.released_; }

  on_blur_() { this.remove_keyevent_listeners_(); }
  on_focus_() { this.add_keyevent_listeners_(); }

  on_key_down_(event_)
  {
    if (!should_capture_keyevent(event_)) { return; }
    let code = event_.code || KEYCODE_TO_CODE[event_.keyCode];

    if (this.keystate_[code] != true) { this.pressed_[code] = true; }
    this.keystate_[code] = true;
  }

  on_key_up_(event_)
  {
    let code = event_.code || KEYCODE_TO_CODE[event_.keyCode];

    if (this.keystate_[code] == true) { this.released_[code] = true; }
    delete this.keystate_[code];
  }

  on_mouse_out_(event_)
  {
    event_ = event_ ? event_ : window.event;
    let from = event_.relatedTarget || event_.toElement;
    if (!from || from.nodeName == "HTML") { this.sysstate_[CM.POINTER_ACTIVE] = false; }
  }

  on_mouse_over_(event_)
  {
    event_ = event_ ? event_ : window.event;
    let to = event_.relatedTarget || event_.fromElement;
    if (!to || to.nodeName == "HTML") { this.sysstate_[CM.POINTER_ACTIVE] = true; }
  }

  on_visibility_change_()
  {
    this.clear();
    if (document.hidden) { this.on_blur_(); }
    else { this.on_focus_(); }
  }

  add_visibility_event_listeners_()
  {
    this.clear();
    window.addEventListener('blur', this.target_.onBlur);
    window.addEventListener('focus', this.target_.onFocus);
    document.addEventListener('visibilitychange', this.target_.onVisibilityChange);
  }

  remove_visibility_event_listeners_()
  {
    this.clear();
    window.removeEventListener('blur', this.target_.onBlur);
    window.removeEventListener('focus', this.target_.onFocus);
    document.removeEventListener('visibilitychange', this.target_.onVisibilityChange);
  }

  add_keyevent_listeners_()
  {
    this.clear();
    window.addEventListener('keydown', this.target_.onKeyDown);
    window.addEventListener('keyup', this.target_.onKeyUp);
    window.addEventListener('mouseout', this.target_.onMouseOut);
    window.addEventListener('mouseover', this.target_.onMouseOver);
  }

  remove_keyevent_listeners_()
  {
    this.clear();
    window.removeEventListener('keydown', this.target_.onKeyDown);
    window.removeEventListener('keyup', this.target_.onKeyUp);
    window.removeEventListener('mouseout', this.target_.onMouseOut);
    window.removeEventListener('mouseover', this.target_.onMouseOver);
  }

  is_empty_object(keys_)
  {
    for (let key in keys_) { return false; }
    return true;
  }

}

"use strict";

var shouldCaptureKeyEvent = function (event) {
  if (event.metaKey) { return false; }
  return document.activeElement === document.body;
};

class XRTInput
{
  constructor()
  {
    this.__target = null;
    this.__state = {};
    this.__pressed = {};
    this.__released = {};
  }

  init(el_)
  {
    this.__target = el_;

    // Bind methods and add event listeners.
    this.__target.onBlur = bind(this.onBlur, this);
    this.__target.onFocus = bind(this.onFocus, this);
    this.__target.onKeyDown = bind(this.onKeyDown, this);
    this.__target.onKeyUp = bind(this.onKeyUp, this);
    this.__target.onVisibilityChange = bind(this.onVisibilityChange, this);
    this.attachVisibilityEventListeners();
  }

  finish(el_)
  {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();
    this.clear();
  }

  clear()
  {
    this.__state = {};
    this.__pressed = {};
    this.__released = {};
  }

  tock()
  {
    this.__pressed = {};
    this.__released = {};
  }

  get_state() { return this.__state; }
  get_pressed() { return this.__pressed; }
  get_released() { return this.__released; }

  onBlur() { this.removeKeyEventListeners(); }
  onFocus() { this.attachKeyEventListeners(); }

  onKeyDown(event_)
  {
    if (!shouldCaptureKeyEvent(event_)) { return; }
    let code = event_.code || KEYCODE_TO_CODE[event_.keyCode];

    if (this.__state[code] != true) { this.__pressed[code] = true; console.log(event_.code); }
    this.__state[code] = true;
  }

  onKeyUp(event_)
  {
    let code = event_.code || KEYCODE_TO_CODE[event_.keyCode];

    if (this.__state[code] == true) { this.__released[code] = true; }
    delete this.__state[code];
  }

  onVisibilityChange()
  {
    this.clear();
    if (document.hidden) { this.onBlur(); }
    else { this.onFocus(); }
  }

  attachVisibilityEventListeners()
  {
    this.clear();
    window.addEventListener('blur', this.__target.onBlur);
    window.addEventListener('focus', this.__target.onFocus);
    document.addEventListener('visibilitychange', this.__target.onVisibilityChange);
  }

  removeVisibilityEventListeners()
  {
    this.clear();
    window.removeEventListener('blur', this.__target.onBlur);
    window.removeEventListener('focus', this.__target.onFocus);
    document.removeEventListener('visibilitychange', this.__target.onVisibilityChange);
  }

  attachKeyEventListeners()
  {
    this.clear();
    window.addEventListener('keydown', this.__target.onKeyDown);
    window.addEventListener('keyup', this.__target.onKeyUp);
  }

  removeKeyEventListeners()
  {
    this.clear();
    window.removeEventListener('keydown', this.__target.onKeyDown);
    window.removeEventListener('keyup', this.__target.onKeyUp);
  }

  isEmptyObject(keys_)
  {
    for (let key in keys_) { return false; }
    return true;
  }

}

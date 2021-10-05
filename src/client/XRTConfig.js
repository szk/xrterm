"use strict";

class XRTConfig
{
  constructor()
  {
    // this.config = require("config");
  }

  get_modkey()
  {
    return 'MetaLeft';
  }

  get_focus()
  {
    // hover gazing or click
  }

  get_move()
  {
    // grab & headmove or click & drag
  }


  key_to_cmdtype(pressed_)
  {
    console.log(pressed_ + ': cmd');
    if (pressed_ == 'Enter') { return CM.WS_CMD.OPEN_TERMINAL; }
    if (pressed_ == 'Tab') { return CM.WS_CMD.OPEN_BROWSER; }

    return null;
  }

  key_to_cmd_term(key_)
  {
    let result = 0;
    switch (key_) {
      case '\u001b[A': // Up
        result = CM.WS_CMD.MOVE_UP;
        break;
      case '\u001b[B': // Down
        result = CM.WS_CMD.MOVE_DOWN;
        break;
      case '\u001b[D': // Left
        result = CM.WS_CMD.MOVE_LEFT;
        break;
      case '\u001b[C': // Right
        result = CM.WS_CMD.MOVE_RIGHT;
        break;

      case 'p': // Up
        result = CM.WS_CMD.RESIZE_UP;
        break;
      case 'n': // Down
        result = CM.WS_CMD.RESIZE_DOWN;
        break;
      case 'f': // Left
        result = CM.WS_CMD.RESIZE_LEFT;
        break;
      case 'b': // Right
        result = CM.WS_CMD.RESIZE_RIGHT;
        break;
    }
    return result;
  }
}

CM.Config = new XRTConfig();

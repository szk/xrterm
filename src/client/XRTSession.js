"use strict";

class XRTSession
{
  constructor()
  {
    this.terminal_instance_ = 0;
  }

  init()
  {
  }

  get_term_id()
  {
    return 'terminal-' + this.terminal_instance_++;
  }
}

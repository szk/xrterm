"use strict";

class XRSession
{
  constructor()
  {
    this.terminalInstance = 0;
  }

  get_term_id()
  {
    return 'terminal-' + this.terminalInstance++;
  }
}

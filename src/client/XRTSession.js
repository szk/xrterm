"use strict";

class XRTSession
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

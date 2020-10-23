"use strict";

class XRTERM
{
  constructor()
  {
    this.session = new XRTSession();
  }

  init()
  {
    let ws = new XRTWorkspace();
    ws.register();
    let xrtty = new XRTTty(this.session);
    xrtty.register();
    let term_base = new XRTTermBase();
    term_base.register();
    let term_dx = new XRTTermDX();
    term_dx.register();
  }
}

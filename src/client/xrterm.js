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
    // let placement = new XRTPlacement();
    // placement.register();
    let xrtty = new XRTTty(this.session);
    xrtty.register();
    let base_term = new XRTTermBase();
    base_term.register();
    let dx_term = new XRTTermDX();
    dx_term.register();
  }
}

"use strict";

class XRTERM
{
  constructor()
  {
    this.session = new XRSession();
  }

  init()
  {
    let ws = new XRWorkspace();
    ws.register();
    // let placement = new XRPlacement();
    // placement.register();
    let xrtty = new XRTty(this.session);
    xrtty.register();
    let base_term = new XRBaseTerm();
    base_term.register();
    let dx_term = new XRDXTerm();
    dx_term.register();
  }
}

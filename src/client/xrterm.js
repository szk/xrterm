"use strict";

class XRTERM
{
  constructor()
  {
    this.session = new XRSession();
  }

  init()
  {
    let xrtty = new XRTty(this.session);
    xrtty.register();
    let base_term = new XRBaseTerm();
    base_term.register();
    let dx_term = new XRDXTerm();
    dx_term.register();
  }

}

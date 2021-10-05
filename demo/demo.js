'use strict';

class XRTDemo
{
  constructor()
  {
    this.session = new XRTSession();
  }

  init()
  {
    this.session.init();
    this.init_xrterm();
  }

  init_xrterm()
  {
    let ws = new XRTWorkspace();
    ws.register();
    let xrtty = new XRTTty(this.session);
    xrtty.register();

    let term_demo = new XRTTermDemo(ws);
    term_demo.register();
    let term_base = new XRTTermBase();
    term_base.register();
    let term_dx = new XRTTermDX();
    term_dx.register();
  }
}

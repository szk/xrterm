"use strict";
const cm = require('../Common.js');
const XRTShell = require('./XRTShell.js');

class XRTServer
{
  constructor ()
  {
    this.shell_ = new XRTShell();
  }

  init()
  {
    this.shell_.init();
  }

  start()
  {
    this.shell_.start();
  }
}

module.exports = XRTServer;

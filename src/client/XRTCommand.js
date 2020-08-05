"use strict";

class XRTCommand
{
  constructor()
  {
    this.type_ = null;
    this.argument_ = null;
  }

  init(type_, argument_)
  {
    this.type_ = type_;
    this.argument_ = argument_;
  }

  get_type()
  {
    return this.type_;
  }

  get_argument()
  {
    return this.argument_;
  }
}

/*
 * based on aframe-xterm-component by rangermauve
 * MIT license
 */
"use strict";

class XRTTermBase
{
  constructor ()
  {
  }

  init(self_)
  {
    const message = 'Initialized\r\n';
    const tty = self_.el.components['xrtty'];

    tty.write(message);

    const socket = new WebSocket('ws://localhost:' + String(CM.COMM_PORT)+ '/');

    // Listen on data, write it to the terminal
    socket.onmessage = ({data}) => {
      tty.write(data);
    };

    socket.onclose = () => {
      tty.write('\r\nConnection closed.\r\n');
    };

    // Listen on user input, send it to the connection
    self_.el.addEventListener('xrtty-data', ({detail}) => {
      socket.send(detail);
    });
  }

  register ()
  {
    let self_bs = this;

    AFRAME.registerComponent('term-base', {
      dependencies: ['xrtty'],
      init: function() { self_bs.init(this); }
    });
  }
}

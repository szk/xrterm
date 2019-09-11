/*
 * based on aframe-xterm-component by rangermauve
 * MIT license
 */
"use strict";

class XRBaseTerm
{
  constructor ()
  {
  }

  register ()
  {
    AFRAME.registerComponent('term-base', {
      dependencies: ['xrtty'],
      init: function() {
        const message = 'Initialized\r\n';
        const tty_base = this.el.components['xrtty'];

        tty_base.write(message);

        const socket = new WebSocket('ws://localhost:' + String(CM.COMM_PORT)+ '/');

        // Listen on data, write it to the terminal
        socket.onmessage = ({data}) => {
          tty_base.write(data);
        };

        socket.onclose = () => {
          tty_base.write('\r\nConnection closed.\r\n');
        };

        // Listen on user input, send it to the connection
        this.el.addEventListener('xrtty-data', ({detail}) => {
          socket.send(detail);
        });
      }
    });
  }
}

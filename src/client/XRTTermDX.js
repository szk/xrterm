"use strict";

/*
 * based on aframe-xterm-component by rangermauve
 * MIT license
 */

class XRTTermDX
{
  constructor()
  {
  }

  register()
  {
    AFRAME.registerComponent('term-dx', {
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

/*
    AFRAME.registerComponent('term-dx', {
      schema: Object.assign({
        cols: {
          type: 'number',
          default: 80
        },
        rows: {
          type: 'number',
          default: 25
        },
      }, this.TERMINAL_THEME),

      write: function (message_) {
        // if (message_.length != 1)
        // {
        //   this.term.write(message_[0]);
        // }
        // else
        {
          this.term.write(message_);
        }
        // message_.size();
        // console.log("write: " + message_);
      },
      tick: function (time_, timeDelta_) {
      },
      init: function () {
        const terminalElement = document.createElement('div');
        terminalElement.setAttribute('style', `width: 512px; height: 256px; opacity: 0.0; overflow: hidden;`);

        this.el.appendChild(terminalElement);
        this.el.terminalElement = terminalElement;

        // Build up a theme object
        const theme = Object.keys(this.data).reduce((theme, key) => {
          if (!key.startsWith('theme_')) { return theme; }
          const data = this.data[key];
          if(!data) { return theme; }
          theme[key.slice('theme_'.length)] = data;
          return theme;
        }, {});

        const term = new Terminal({
          theme: theme,
          allowTransparency: true,
          cursorBlink: true,
          disableStdin: false,
          rows: this.data.rows,
          cols: this.data.cols,
          fontSize: 64
        });

        this.term = term;
        term.open(terminalElement);

        this.canvas = terminalElement.querySelector('.xterm-text-layer');
        this.canvas.id = 'terminal-' + (this.terminalInstance++);
        this.canvasContext = this.canvas.getContext('2d');

        this.cursorCanvas = terminalElement.querySelector('.xterm-cursor-layer');

        this.el.setAttribute('material', 'transparent', true);
        this.el.setAttribute('material', 'src', '#' + this.canvas.id);

        term.on('refresh', () => {
          const material = this.el.getObject3D('mesh').material;
          if (!material.map) { return; }
          this.canvasContext.drawImage(this.cursorCanvas, 0,0);
          material.map.needsUpdate = true;
        });

        term.on('data', (data_) => { this.el.emit('xrtty-data', data_); });
        this.el.addEventListener('click', () => { term.focus(); });
      }
    });
  }
  }

  formouseoperator()
  {
    AFRAME.registerComponent('drag-rotate-component',{
      schema : { speed : {default:1}},
      init : function(){
        this.ifMouseDown = false;
        this.x_cord = 0;
        this.y_cord = 0;
        document.addEventListener('mousedown',this.OnDocumentMouseDown.bind(this));
        document.addEventListener('mouseup',this.OnDocumentMouseUp.bind(this));
        document.addEventListener('mousemove',this.OnDocumentMouseMove.bind(this));
      },
      OnDocumentMouseDown : function(event){
        this.ifMouseDown = true;
        this.x_cord = event.clientX;
        this.y_cord = event.clientY;
      },
      OnDocumentMouseUp : function(){
        this.ifMouseDown = false;
      },
      OnDocumentMouseMove : function(event)
      {
        if(this.ifMouseDown)
        {
          var temp_x = event.clientX-this.x_cord;
          var temp_y = event.clientY-this.y_cord;
          if(Math.abs(temp_y)<Math.abs(temp_x))
          {
            this.el.object3D.rotateY(temp_x*this.data.speed/1000);
          }
          else
          {
            this.el.object3D.rotateX(temp_y*this.data.speed/1000);
          }
          this.x_cord = event.clientX;
          this.y_cord = event.clientY;
        }
      }
    });
  }
  
*/

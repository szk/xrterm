/*
 * based on aframe-xterm-component by rangermauve
 * MIT license
 */
"use strict";

class XRTty
{
  constructor (session_)
  {
    this.session = session_;
    console.log(this.session + 'bogeboge');
  }

  register ()
  {
    self = this; // FIXME

    AFRAME.registerComponent('xrtty', {
      schema: Object.assign({
        cols: {
          type: 'number',
          default: 80
        },
        rows: {
          type: 'number',
          default: 25
        },
      }, TERMINAL_THEME),

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
        this.canvas.id = self.session.get_term_id();
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

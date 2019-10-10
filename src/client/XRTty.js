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
  }

  write(self_, message_) {
    // if (message_.length != 1)
    // {
    //   this.term.write(message_[0]);
    // }
    // else
    {
      self_.term.write(message_);
    }
    // message_.size();
    // console.log("write: " + message_);
  }
  tick(self_, time_, timeDelta_) {}
  init(obj_)
  {
    const terminalElement = document.createElement('div');
    terminalElement.setAttribute('style', `width: 512px; height: 256px; opacity: 0.0; overflow: hidden;`);

    obj_.el.appendChild(terminalElement);
    obj_.el.terminalElement = terminalElement;

    // Build up a theme object
    const theme = Object.keys(obj_.data).reduce((theme, key) => {
      if (!key.startsWith('theme_')) { return theme; }
      const data = obj_.data[key];
      if(!data) { return theme; }
      theme[key.slice('theme_'.length)] = data;
      return theme;
    }, {});

    const term = new Terminal({
      theme: theme,
      allowTransparency: true,
      cursorBlink: true,
      disableStdin: false,
      rows: obj_.data.rows,
      cols: obj_.data.cols,
      fontSize: 64
    });

    obj_.term = term;
    term.open(terminalElement);

    obj_.canvas = terminalElement.querySelector('.xterm-text-layer');
    obj_.canvas.id = this.session.get_term_id();
    obj_.canvasContext = obj_.canvas.getContext('2d');
    obj_.cursorCanvas = terminalElement.querySelector('.xterm-cursor-layer');

    obj_.el.setAttribute('material', 'transparent', true);
    obj_.el.setAttribute('material', 'src', '#' + obj_.canvas.id);

    term.on('refresh', () => {
      const material = obj_.el.getObject3D('mesh').material;
      if (!material.map) { return; }
      obj_.canvasContext.drawImage(obj_.cursorCanvas, 0,0);
      material.map.needsUpdate = true;
    });

    term.on('data', (data_) => { obj_.el.emit('xrtty-data', data_); });
    obj_.el.addEventListener('click', () => { term.focus(); });
  }

  register ()
  {
    let self_tty = this; // FIXME

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
      init: function() { self_tty.init(this); },
      write: function(message_) { self_tty.write(this, message_); },
      tick: function(time_, delta_) { self_tty.tick(this, time_, delta_); }
    });
  }
}

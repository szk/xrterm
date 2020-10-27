/*
 * based on aframe-xterm-component by rangermauve
 * MIT license
 */
"use strict";

class XRTTty
{
  constructor (session_)
  {
    this.session = session_;
  }

  init(obj_)
  {
    const terminalElement = document.createElement('div');
    terminalElement.setAttribute('style',
                                 `width: 512px; height: 512px; opacity: 0.0; overflow: hidden;`);
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
      allowTransparency: false,
      cursorBlink: true,
      disableStdin: false,
      rows: obj_.data.rows,
      cols: obj_.data.cols,
      fontSize: 12
    });

    obj_.term = term;
    term.open(terminalElement);

    obj_.canvas = terminalElement.querySelector('.xterm-text-layer');
    obj_.canvas.id = this.session.get_term_id();
    obj_.canvasContext = obj_.canvas.getContext('2d');
    obj_.cursorCanvas = terminalElement.querySelector('.xterm-cursor-layer');

    obj_.el.setAttribute('material', 'transparent', true);
    obj_.el.setAttribute('material', 'src', '#' + obj_.canvas.id);

    term.onRender((o_) => { this.redraw(obj_); });
    term.onData((data_) => { obj_.el.emit('xrtty-data', data_); });

    // event listener
    obj_.el.addEventListener('click', () => { term.focus(); console.log('focused on '); });
    obj_.el.addEventListener('raycaster-intersected', () => { term.focus(); console.log('intersected'); });
  }

  write(self_, message_) { self_.term.write(message_); }
  tick(self_, time_, timeDelta_) {}
  get_core(self_) { return self_.term._core; }
  get_col_num(self_) { return self_.term.cols; }
  get_term(self_) { return self_.term; }

  redraw(obj_)
  {
    const material = obj_.el.getObject3D('mesh').material;
    // material.map.image.width = 4096;
    // material.map.image.height = 2048;
    if (!material.map) { return; }

    // obj_.canvasContext.scale(0.5, 0.5);
    // obj_.canvasContext.drawImage(obj_.cursorCanvas,
    //                              0, 0, 1024, 512,
    //                              0, 0, 1024, 512);
    // obj_.canvasContext.drawImage(this.ctx, 0, 0, 4096, 2048,
    //                              0, 0, 4096, 2048);
    // this.ctx.drawImage(obj_.cursorCanvas, 0, 0, 4096, 2048,
    //                              0, 0, 4096, 2048);
    obj_.canvasContext.drawImage(obj_.cursorCanvas, 0, 0);
    material.map.needsUpdate = true;
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
      tick: function(time_, delta_) { self_tty.tick(this, time_, delta_); },
      get_core: function() { return self_tty.get_core(this); },
      get_buffer: function() { return self_tty.get_core(this).buffer; },
      get_col_num: function() { return self_tty.get_col_num(this); },
      get_term: function() { return self_tty.get_term(this); }
    });
  }
}

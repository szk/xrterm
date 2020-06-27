/*
 * based on aframe-xterm-component by rangermauve
 * MIT license
 */
"use strict";

class XRTTermDemo
{
  constructor ()
  {
  }

  async repl (echo_, bash_, tty_)
  {
    echo_.read(CM.DEMO_PROMPT, CM.DEMO_CONTINUOUS_PROMPT)
      .then(input => bash_.run(input).then((log_) => { tty_.write(log_); tty_.write('\r\n'); this.repl(echo_, bash_, tty_); },
                                           (error_) => { tty_.write(error_); tty_.write('\r\n');  this.repl(echo_, bash_, tty_);}))
      .catch(error => console.log(`Error reading: ${error}`));
  }

  init(self_)
  {
    const message = 'Initialized\r\n';
    let tty = self_.el.components['xrtty'];
    const bash = this.init_bash_emulator();

    const localEcho = new LocalEchoController();
    tty.term.loadAddon(localEcho);
    localEcho.addAutocompleteHandler((index, tokens) => {
      if (index == 0) { return Object.keys(bash.commands); }
      return [];
    });
    
    console.log(bash.state);
    
    tty.command = '';
    tty.write(CM.DEMO_BANNER);
    this.repl(localEcho, bash, tty);
  }

  init_bak(self_)
  {
    const message = 'Initialized\r\n';
    const tty = self_.el.components['xrtty'];
    const bash = this.init_bash_emulator();

    tty.command = '';
    tty.write(CM.DEMO_BANNER);
    this.write_newline_(tty);
    this.write_prompt_(tty);

    self_.el.addEventListener('xrtty-data', (e_) => {
      switch (e_.detail) {
        case '\r': // Enter
          this.write_newline_(tty);
          bash.run(tty.command).then((log_) => { tty.write(log_); },
                                     (error_) => { tty.write(error_); })
            .finally(() => { this.write_newline_(tty); this.write_prompt_(tty); tty.command = ''; });
          break;
        case '\u0003': // Ctrl+C
          this.write_prompt_(tty);
          tty.command = '';
          break;
        case '\u007F': // Backspace (DEL)
          // Do not delete the prompt
          if (tty.get_buffer().x > 2)
          {
            tty.write('\b \b');
            tty.command = tty.command.slice(0, -1);
          }
          break;
        case '\u0009': // Tab
          console.log('tabbed');
          break;
        case '\u001b[A': // Up
          this.clear_line_(tty);
          bash.completeUp(tty.command)
            .then((value_) => { if (value_ != undefined) { tty.write(value_); tty.command = value_; } });
          break;
        case '\u001b[B': // Down
          this.clear_line_(tty);
          bash.completeDown(tty.command)
            .then((value_) => { if (value_ != undefined) { tty.write(value_); tty.command = value_; } });;
          break;
        case '\u001b[D': // Left
          console.log('l');
          if (tty.get_buffer().x > 2)
          {
            tty.write(e_.detail);
          }
          break;
        case '\u001b[C': // Right
          console.log('r');
          // if (tty.get_buffer().x > 2)
          {
            tty.write(e_.detail);
          }
          break;
        default: // Print all other characters for demo
          if (tty.command.length + CM.DEMO_PROMPT.length >= tty.get_col_num())
          {
            console.log("over!");
          }

          tty.write(e_.detail);
          tty.command = tty.command + e_.detail;
      }
      console.log(tty.command);
    });
  }

  init_bash_emulator()
  {
    var emulator = bashEmulator({
      workingDirectory: '/',
      fileSystem: {
        '/': {
          type: 'dir',
          modified: Date.now()
        },
        '/README.txt': {
          type: 'file',
          modified: Date.now(),
          content: 'empty'
        },
        '/home': {
          type: 'dir',
          modified: Date.now()
        },
        '/home/user/journal.txt': {
          type: 'file',
          modified: Date.now(),
          content: 'this is private!'
        },
        '/home/user': {
          type: 'dir',
          modified: Date.now()
        }
      }
    });

    return emulator;
  }

  register ()
  {
    let self_bs = this;

    AFRAME.registerComponent('term-demo', {
      dependencies: ['xrtty'],
      init: function() { self_bs.init(this); }
    });
  }
}

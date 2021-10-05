"use strict";
const fs = require('fs');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');
const pty = require('node-pty');
const path = require('path');

const cm = require('../Common.js');

class XRTShell
{
  constructor ()
  {
    this.svr_port_ = cm.COMM_PORT;
    this.shell_ = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
    this.cmd_server_ = new http.createServer();
    /*
      const server = new https.createServer({
      key: fs.readFileSync('./src/server/private.key'),
      cert: fs.readFileSync('./src/server/private.pem')
      });
      */
    this.socket_ = new WebSocket.Server({ server: this.cmd_server_ });
  }

  init()
  {
    this.socket_.on('connection', (connection) => {
      const ptyProcess = pty.spawn(this.shell_, [], {
        cwd: process.env.HOME,
        env: process.env
      });

      ptyProcess.on('data', (data) => {
        connection.send(data);
      });

      connection.on('message', (message) => {
        ptyProcess.write(message);
      });

      ptyProcess.once('close', () => {
        connection.removeAllListeners();
        connection.close();
      });

      connection.once('close', () => {
        ptyProcess.removeAllListeners();
        ptyProcess.destroy();
      });
    });
  }

  start()
  {
    this.cmd_server_.listen(this.svr_port_);
    console.log("Server running on port " + String(this.svr_port_));
  }
}

module.exports = XRTShell;

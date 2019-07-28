"use strict";
const fs = require('fs');
const https = require('http');
const WebSocket = require('ws');
const os = require('os');
const pty = require('local-node-pty');
const path = require('path');

const cm = require('../common');

const svr_port = 8023;

const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';

const server = new https.createServer();

const wss = new WebSocket.Server({
  server
});

wss.on('connection', (connection) => {
  const ptyProcess = pty.spawn(shell, [], {
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

server.listen(svr_port);
console.log("Server running on port " + String(svr_port));

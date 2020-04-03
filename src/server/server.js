"use strict";
const fs = require('fs');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');
const pty = require('node-pty');
const path = require('path');

const cm = require('../common.js');
// const options = {
//   key: fs.readFileSync('./src/server/private.key'),
//   cert: fs.readFileSync('./src/server/private.pem')
// };

const svr_port = cm.COMM_PORT;
const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
const server = new http.createServer();
// const server = new https.createServer(options);
const socket = new WebSocket.Server({ server });

socket.on('connection', (connection) => {
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

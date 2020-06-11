"use strict";
const CmdServer = require('./server.js');

const cmd_svr = new CmdServer();
cmd_svr.init();
cmd_svr.start();

'use strict';

import { app, remote, BrowserWindow } from 'electron';
import * as path from 'path';
import fs from 'fs';
import { format as formatUrl } from 'url';
import CM from '../../src/Common.js';

const isDevelopment = process.env.NODE_ENV !== 'production';

// For local app
const host = 'localhost';
const port = 3000;

//// Run http server
const HttpServer = require('webpack-dev-server');
const webpack = require('webpack');
const webpackConfig = require('../../webpack.electron.config.js');

const compiler = webpack(webpackConfig);
const contentBase_path = path.join(path.dirname(process.execPath), 'resources', 'app.asar');
const config_path = (app || remote.app).getPath('userData');

const dev_http_server_opts = {
  stats: {
    colors: true
  },
  hot: true,
  inline: true,
  disableHostCheck: false,
  host,
  allowedHosts: [ host ],
  contentBase: contentBase_path,
};

HttpServer.addDevServerEntrypoints(webpackConfig, dev_http_server_opts);

const http_svr = new HttpServer(compiler, dev_http_server_opts);
http_svr.listen(port, host, () => {
  console.log('webpack server start.');
  // User Data
  const configDir = (app || remote.app).getPath('userData');
});

//// Store scene data and user data
const Store = require('./store.js');

//// Run command server
const CmdServer = require('../../src/server/XRTServer.js');
let cmd_svr = new CmdServer();
cmd_svr.init();
cmd_svr.start();

//// Create Electron window
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  const window = new BrowserWindow({webPreferences: {nodeIntegration: true}});

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  window.loadURL("http://" + host + ":" + port.toString());
  // window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);

  window.on('closed', () => { mainWindow = null; });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => { window.focus(); });
  });

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();

  const store = new Store(app, remote, {
    // We'll call our data file 'user-preferences'
    configName: 'config',
    defaults: {
      // 800x600 is the default size of our window
      windowBounds: { width: 800, height: 600 }
    }
  });

  let { width, height } = store.get('windowBounds');

  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
  });

});

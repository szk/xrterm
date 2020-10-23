'use strict';
const path = require('path');
const fs = require('fs');
const DefaultScene = require('./defaultscene.js');

class Store
{
  constructor(app_, remote_, opts_) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userdata_path = (app_ || remote_.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userdata_path, opts_.configName + '.json');
    this.data = this.parse_datafile_(this.path, opts_.defaults);

    console.log('store is construced:' + this.path);

    this.default_scene = new DefaultScene(null);
    this.default_scene.init(app_);
    this.default_scene.copy("scene", path.join(userdata_path, "scene"));
  }

  // This will just return the property on the `data` object
  get(key_)
  {
    return this.data[key_];
  }

  // ...and this will set it
  set(key_, val_)
  {
    this.data[key_] = val_;
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  parse_datafile_(path_, defaults_)
  {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    try {
      return JSON.parse(fs.readFileSync(path_));
    } catch(error) {
      // if there was some kind of error, return the passed in defaults instead.
      return defaults_;
    }
  }

}

// expose the class
module.exports = Store;

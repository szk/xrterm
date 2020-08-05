'use strict';
const ncp = require("ncp");
var path = require('path');
var fs = require("fs");
var fsj = require("fs-jetpack");

class DefaultScene
{
  constructor(opts_)
  {
  }

  init(app_)
  {
    this.app = app_;
    this.original_cwd = process.cwd();
  }

  copy(src_, dest_)
  {
    crawl_asar(this.app, src_, dest_);
  }
}

var crawl_asar = function(app, src_, dest_)
{
  if ( fs.existsSync( path.join(app.getAppPath(), src_) ) )
  {
    // file will be copied
    if ( fs.statSync( path.join(app.getAppPath(), src_) ).isFile() )
    {
      fsj.file( dest_, { mode: '644', content: fs.readFileSync( path.join(app.getAppPath(), src_), "utf8") });
    }

    // dir is browsed
    else if ( fs.statSync( path.join(app.getAppPath(), src_) ).isDirectory() )
    {
      fs.readdirSync( path.join(app.getAppPath(), src_) ).forEach(function(fileOrFolderName) {
        crawl_asar(app, path.join(src_, fileOrFolderName), path.join(dest_, fileOrFolderName) );
      });
    }
  }
};

module.exports = DefaultScene;

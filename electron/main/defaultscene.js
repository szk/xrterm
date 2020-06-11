'use strict';
const ncp = require("ncp");
var path = require('path');
var fs = require("fs");
var fsj = require("fs-jetpack");

// referred:
// https://gist.github.com/coclav/4fd17efc9efa2c0517b2

class DefaultScene
{
  constructor(opts)
  {
    // this.scene_html = ""
  }

  init(app_)
  {
    this.app = app_;
    this.original_cwd = process.cwd();
    // makef.createFile({
    //   // The following file will be created with empty content
    //   'a.txt': '',
    //   // The following file will be created in subdirectory b
    //   'b/c.log': 'some data',
    //   // The following file will not be created
    //   'd.file': false,
    //   // The object that is specified as content will be converted to JSON
    //   'file.json': {some: 'data'}
    // });
  }

  make()
  {
    // process.chdir('/temp/foo');
    // process.chdir();
  }
  copy(sourceInAsarArchive, destOutsideAsarArchive)
  {
    copyFileOutsideOfElectronAsar(this.app, sourceInAsarArchive, destOutsideAsarArchive);
  }
}

var copyFileOutsideOfElectronAsar = function(app, sourceInAsarArchive, destOutsideAsarArchive)
{
  if ( fs.existsSync( path.join(app.getAppPath(), sourceInAsarArchive) ) )
  {
    // file will be copied
    if ( fs.statSync( path.join(app.getAppPath(), sourceInAsarArchive) ).isFile() )
    {
      fsj.file( destOutsideAsarArchive, { mode: '644', content: fs.readFileSync( path.join(app.getAppPath(), sourceInAsarArchive), "utf8") });
    }

    // dir is browsed
    else if ( fs.statSync( path.join(app.getAppPath(), sourceInAsarArchive) ).isDirectory() ) {

      fs.readdirSync( path.join(app.getAppPath(), sourceInAsarArchive) ).forEach(function(fileOrFolderName) {

        copyFileOutsideOfElectronAsar(app, path.join(sourceInAsarArchive, fileOrFolderName), path.join(destOutsideAsarArchive, fileOrFolderName) );
      });
    }
  }

};

module.exports = DefaultScene;

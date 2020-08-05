var isNode = (typeof process !== "undefined" && typeof require !== "undefined");

var CM = CM || {};
CM.DEMO_PROMPT = "$ ";
CM.DEMO_CONTINUOUS_PROMPT = "> ";
CM.DEMO_BANNER =
" ████████╗███████╗██████╗ ███╗   ███╗      ██████╗ ███████╗███╗   ███╗ ██████╗ \r\n" +
" ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║      ██╔══██╗██╔════╝████╗ ████║██╔═══██╗\r\n" +
"    ██║   █████╗  ██████╔╝██╔████╔██║█████╗██║  ██║█████╗  ██╔████╔██║██║   ██║\r\n" +
"    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║╚════╝██║  ██║██╔══╝  ██║╚██╔╝██║██║   ██║\r\n" +
"    ██║   ███████╗██║  ██║██║ ╚═╝ ██║      ██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝\r\n" +
"    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝      ╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ \r\n" +
"Acceptable commands:                                                           \r\n" +
"|, ls -l -a, cd, pwd, history, cat -n, touch, mkdir,                           \r\n" +
"mv -n, cp -r -R, rm -r -R, rmdir                                               \r\n";

CM.BUILD = 'UNDEFINED';
CM.CONFIG_FILENAME = 'xrterm.conf';
CM.COMM_PORT = 8023;

CM.WS_MODE = { NONE:0,
               DEFAULT:1,
               CONTROL:2,
             };

CM.WS_CMD = { NONE: 0,
              OPEN_TERMINAL: 1,
              OPEN_BROWSER: 2,
              OPEN_MENU: 3,

              MOVE_UP: 4,
              MOVE_DOWN: 5,
              MOVE_FORWARD: 6,
              MOVE_BACKWARD: 7,
              MOVE_RIGHT: 8,
              MOVE_LEFT: 9,

              RESIZE_UP: 10,
              RESIZE_DOWN: 11,
              RESIZE_RIGHT: 12,
              RESIZE_LEFT: 13,
            };

CM.WS_PLACEMENT = { NONE: 0,
                    PLANE: 1,
                    CYLINDER: 2,
                    SPHERE: 3
                  };

CM.SYS_STATE = { POINTER_ACTIVE: 0,
               };


class Common
{
  constructor()
  {
  }

  init()
  {
  }

  identity_mtx(object3d_)
  {
    object3d_.matrix.identity();
    object3d_.matrix.decompose(object3d_.position, object3d_.quaternion, object3d_.scale);
  }

  copy_mtx(object3d_, mtx_)
  {
    object3d_.matrix.copy(mtx_);
    object3d_.matrix.decompose(object3d_.position, object3d_.quaternion, object3d_.scale);
  }

  copy_mtxworld(object3d_, mtx_)
  {
    object3d_.matrixWorld.copy(mtx_);
    object3d_.matrixWorld.decompose(object3d_.position, object3d_.quaternion, object3d_.scale);
  }

  billboard(object3d_, camera_)
  {
    this.target = new THREE.Vector3();
    this.target.setFromMatrixPosition(camera_.matrixWorld);
    return object3d_.lookAt(this.target);
  }

  show_caption()
  {
  }


  get_prefixed_name(array_, prefix_)
  {
    for (let strn of array_)
    {
      if (strn.startsWith(prefix_)) { return strn; }
    }
    return null;
  }

  get_random_color()
  {
    const letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

CM.FUNC = new Common();

if (isNode) { module.exports = CM; }

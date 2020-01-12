var isNode = (typeof process !== "undefined" && typeof require !== "undefined");

var CM = CM || {};
CM.COMM_PORT = 8023;

CM.WS_MODE = { NONE:0,
               DEFAULT:1,
               CONTROL:2
             };

CM.WS_CMD = { NONE: 0,
              OPEN_TERMINAL: 1,
              OPEN_BROWSER: 2,
              OPEN_MENU: 3,

              MOVE_UP: 4,
              MOVE_DOWN: 5,
              MOVE_RIGHT: 6,
              MOVE_LEFT: 7,

              RESIZE_UP: 8,
              RESIZE_DOWN: 9,
              RESIZE_RIGHT: 10,
              RESIZE_LEFT: 11,

            };

if (isNode) { module.exports = CM; }

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

CM.CONFIG_FILENAME = 'xrterm.conf';
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
              MOVE_FORWARD: 6,
              MOVE_BACKWARD: 7,
              MOVE_RIGHT: 8,
              MOVE_LEFT: 9,

              RESIZE_UP: 10,
              RESIZE_DOWN: 11,
              RESIZE_RIGHT: 12,
              RESIZE_LEFT: 13,
            };

if (isNode) { module.exports = CM; }

function init()
{
    AFRAME.registerComponent('xterm-example', {
        dependencies: ['xterm'],
        init: function() {
            const message = 'Initialized\r\n';
            const xterm = this.el.components['xterm'];

            xterm.write(message);

            const socket = new WebSocket('ws://localhost:8080/');

            // Listen on data, write it to the terminal
            socket.onmessage = ({data}) => {
                xterm.write(data);
            };

            socket.onclose = () => {
                xterm.write('\r\nConnection closed.\r\n');
            };

            // Listen on user input, send it to the connection
            this.el.addEventListener('xterm-data', ({detail}) => {
                socket.send(detail);
            });
        }
    });
}

function requireAll (req) { req.keys().forEach(req); }

// Require all components.
requireAll(require.context('./components/', true, /\.js$/));
// Load XRScreen
require('../src/client/term/XRScreen.js');
// Load Scene
require('./scene.html');

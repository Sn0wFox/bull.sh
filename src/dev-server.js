/**
 * A simple server to serve Sn0wFox.com.
 *
 * Webpack dev server is not really suitable given
 * the project's architecture, so the easiest way to have
 * a dev server is to setup a quick express server.
 */
const express = require('express');
const path    = require('path');

// Create server app
const app = express();
app.set('port', 3333);

// Serve static files
app.use(express.static(path.resolve('dist')));

// Run server
app.listen(app.get('port'), () => console.log('Dev server running on port', app.get('port')));
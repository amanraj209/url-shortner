const express = require('express');
const app = express();
const path = require('path');
const opts = require(path.join(__dirname, 'config', 'opts.js'));
const shortner = require(path.join(__dirname, 'lib', 'shortner.js'))(opts);

process.addListener('uncaughtException', function (err, stack) {
    console.log(`Caught exception: ${err}\n${err.stack}`);
    console.log('\u0007');
});

app.set('__dirname', __dirname);
app.set('opts', opts);
app.set('x-powered-by', false);

require(path.join(__dirname, 'config', 'env.js'))(express, app);

require(path.join(__dirname, 'routes'))(app, shortner);

module.exports = app;
'use strict';
const express = require('express');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 3000;

require('./routes/routes')(express, app);

const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(port, () => {
  console.log(`PhotoGRID running on port ${port}`);
});

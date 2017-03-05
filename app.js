'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const formidable = require('formidable');
const gm = require('gm');
const config = require('./config/config');
const knox = require('knox');
const mongoose = require('mongoose').connect(config.dbURL);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.set('host', config.host);
const port = process.env.PORT || 3000;

const knoxClient = knox.createClient({
  key: config.S3AccessKey,
  secret: config.S3Secret,
  bucket: config.S3Bucket
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

require('./routes/routes')(express, app, formidable, fs, os, gm, knoxClient, mongoose, io);

server.listen(port, () => {
  console.log(`PhotoGRID running on port ${port}`);
});

const config = require('./config.json')

var BoomServer = require('./server/server.js');

var express = require('express')
var http = require('http');
var socketIo = require('socket.io');

var app = express();
var httpServer = http.Server(app);
var io = socketIo(httpServer);
var boomServer = new BoomServer(io);

app.use(express.static(__dirname + '/client'))

app.get('/kug/', function(req, res) {
    res.send('Hello fedaaadaah!');
});

httpServer.listen(config.port, function() {
    console.log('Server running at: ' + config.ip + ':' + config.port);
});
function BoomServer(io) {
    var self = this;
    self.socketIo = io;
    self.numberOfCurrentClientsConnected = 0;
    self.numberOfClientsConnectedSinceStart = 0;
    
    
    self.connectedDevices = [];
    
    self.socketIo.on('connection', function(socket) {
        self.onClientConnect(socket);
    });
    
    
    self.eventHandler = require('./eventHandler');
}

BoomServer.prototype.onClientConnect = function(socket) {
    var self =  this;
    
    self.numberOfCurrentClientsConnected++;
    self.numberOfClientsConnectedSinceStart++;
    
    socket.broadcast.emit('numberOfClients', self.numberOfCurrentClientsConnected);
    socket.emit('numberOfClients', self.numberOfCurrentClientsConnected)
    
    socket.on('disconnect', function() {
        self.onClientDisconnect();
    });
    
    
    //eventHandler
    socket.on('event', function(event) {
        self.eventHandler.handleEvent(socket, event);
    });
    
    
    console.log('User connected, number of clients since server start: ' + self.numberOfClientsConnectedSinceStart);
    console.log('User connected now: ' + self.numberOfCurrentClientsConnected);
}

BoomServer.prototype.onClientDisconnect = function() {
    var self = this;
    
    self.numberOfCurrentClientsConnected--;
    
    self.socketIo.emit('numberOfClients', self.numberOfCurrentClientsConnected);
    
    console.log('User disconnected, currently connected now: ' + self.numberOfCurrentClientsConnected);
}

module.exports = BoomServer;
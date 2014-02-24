
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var Bleacon = require('./index');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server); // Socket.io

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

// ポートをリッスンする
server.listen(app.get('port'), '::');
console.log('Listening...');

// iBeaconの検索
Bleacon.on('discover', function(bleacon) {
    console.log('discover');
    io.sockets.json.emit('message', { value: bleacon });
});

// クライアントが接続してきたときの処理
io.sockets.on('connection', function(socket) {
    console.log("connect");

    // iBeaconのスキャンを開始
    Bleacon.startScanning();

    // メッセージを受けた時の処理
    socket.on('message', function(data) {
        // 接続しているクライアントに全てに送信
        console.log("message: " + JSON.stringify(data.value));
        socket.broadcast.emit('message', { value: data.value });
    });

    // クライアントが切断した時に処理
    socket.on('disconnection', function() {
        console.log("disconnect");
    });
});

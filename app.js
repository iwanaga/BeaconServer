
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

var sets = require('simplesets');

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

// iBeaconのスキャンを開始
Bleacon.startScanning();

var devSet = new sets.Set();
var devMap = new Object();
var currentDevice = new Array();

// iBeaconの検索
Bleacon.on('discover', function(bleacon) {

    // 見つかったデバイスのkeyを作成
    var key = bleacon.name + bleacon.uuid + bleacon.major;

    // 同じデバイスが無ければ追加
    if (!devSet.has(key)) {
        devSet.add(key);
        devMap[key] = bleacon.proximity;
        currentDevice.push(bleacon);
    }
    // 同じデバイスがあった場合
    else {
        // Unknownになった場合は削除してしまおう
        if (bleacon.proximity === 'unknown') {
            console.log(key + ': ' + devMap[key]  + ' to '+ bleacon.proximity);
            devSet.remove(key);
            devMap[key].remove();
        }
        // デバイスのProximityが変更された
        if (devMap[key] !== bleacon.proximity) {
            console.log(key + ': ' + devMap[key]  + ' to '+ bleacon.proximity);
            devMap[key] = bleacon.proximity;
        }
    }

    // 現在の検索済みのデバイスを表示
//    console.log(currentDevice.length);
//    console.dir(currentDevice);
});

// クライアントが接続してきたときの処理
io.sockets.on('connection', function(socket) {
    console.log("connect");

    // 見つかったデバイスを接続してきたブラウザに送信
    for (var i in  currentDevice) {
        socket.json.emit('message', { value: currentDevice[i] });
    }

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

/**
 * Created by tomo on 2014/02/21.
 */
(function (global) {
    // socket.io
    var socket = io.connect();
    var msg = {
        'command': 'Message',
        'message': ''
    };

    // サーバに送信
    $(this).keydown(function (key) {
        if (key.keyCode === 13) {
            msg.message = $('#send').val();
            console.log('send message --> ' + JSON.stringify(msg));
            socket.emit('message', { value: msg });
            $('#send').val('');
        }
    });

    // メッセージを受けた時
    socket.on('message', function (event) {
        var receive_message = event.value;

        $('body').append('<div>device:    ' + receive_message.name + '</div>');
        $('body').append('<div>UUID:      ' + receive_message.uuid + '</div>');
        $('body').append('<div>MAJOR:     ' + receive_message.major + '</div>');
        $('body').append('<div>MINOR:     ' + receive_message.minor + '</div>');
        $('body').append('<div>PROXIMITY: ' + receive_message.proximity + '</div>');
        $('body').append('<br>');
    });
}(this));
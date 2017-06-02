var app = (require('express').Router)();
var fs = require('fs');

var AudioContext = require('web-audio-api').AudioContext;
var context = new AudioContext;
var recognition = require('./lib/vr').construct(256);

app.get('/service/recognition', function (request, response) {

    let path = __dirname + '/files/signal.wav';

    fs.readFile(path, function (err, data) {

        if (err) throw err;

        context.decodeAudioData(data, function (decodedArrayBuffer) {
            response.status(200).json({
                success: true,
                data: recognition(decodedArrayBuffer.getChannelData(0).slice(2000,10000), true)
            });
        }, function (error) {
            response.status(500).json({
                success: false,
                error: error
            });
        });
    });
});

module.exports = app;
var app = (require('express').Router)();
var fs = require('fs');

var AudioContext = require('web-audio-api').AudioContext;
var context = new AudioContext;
var recognition = require('./lib/vr').construct(512);

app.get('/service/recognition', function (request, response) {

    let path = __dirname + '/files/1.wav';
    let path2 = __dirname + '/files/1_1.wav';
    let path3 = __dirname + '/files/2.wav';

    fs.readFile(path, function (err, data) {

        if (err) throw err;

        fs.readFile(path2, function (err, data2) {

            if (err) throw err;

            fs.readFile(path3, function (err, data3) {

                if (err) throw err;

                context.decodeAudioData(data, function (decodedArrayBuffer) {
                    context.decodeAudioData(data2, function (decodedArrayBuffer2) {
                        context.decodeAudioData(data3, function (decodedArrayBuffer3) {
                            response.status(200).json({
                                success: true,
                                data: recognition(
                                    decodedArrayBuffer.getChannelData(0),
                                    decodedArrayBuffer2.getChannelData(0),
                                    decodedArrayBuffer3.getChannelData(0))
                            });
                        }, function (error) {
                            response.status(500).json({
                                success: false,
                                error: error
                            });
                        });
                    }, function (error) {
                        response.status(500).json({
                            success: false,
                            error: error
                        });
                    });
                }, function (error) {
                    response.status(500).json({
                        success: false,
                        error: error
                    });
                });
            });

        });
    });
});

module.exports = app;
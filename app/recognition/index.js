var app = (require('express').Router)();
var fs = require('fs');

var bodyParser = require("body-parser");
var cors = require('cors');

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var AudioContext = require('web-audio-api').AudioContext;
var context = new AudioContext;
var recognition = require('./lib/vr').construct(256);

var Word = require('./../models').Word;

app.use(bodyParser.urlencoded({limit: '10mb', extended: false, parameterLimit: 999999}));
app.use(bodyParser.json());

app.post('/service/wordAdd', function (request, response) {
    if (!request.body) {
        return response.status(400).json({
            success: false,
            message: 'Тело запроса пусто!'
        });
    }
    var waveform = request.body['waveform[]'];


    var word = new Word({
        word: request.body['word'],
        mfcc: recognition.mfcc(request.body['waveform[]'])
    });

    word.save((err) => {
        if (err) {
            if (err.name = 'ValidationError') {
                return response.status(400).json({
                    success: false,
                    message: 'Ошибка валидации! Убедитесь что все поля заполнены и повторите попытку.',
                    error: err
                });
            }
            return response.status(500).json({
                success: false,
                message: 'Ошибка сервера.',
                error: err
            });
        }
        response.status(200).json({
            success: true,
            message: 'Слово добавлено в базу!'
        });
    });
});

app.post('/service/recognize', function (request, response) {
    if (!request.body) {
        return response.status(400).json({
            success: false,
            message: 'Тело запроса пусто!'
        });
    }

    var waveform = request.body['waveform[]'];

    console.log(waveform.length);

    Word.find({}, (err, words) => {
        if (err) {
            return response.status(500).json({
                success: false,
                message: 'Ошибка сервера.'
            });
        }

        response.status(200).json({
            success: true,
            word: recognition.recornize(waveform, words)
        });
    });
});

app.get('/service/recognition2', function (request, response) {

    let path = __dirname + '/files/2.wav';
    let path2 = __dirname + '/files/2_1.wav';
    let path3 = __dirname + '/files/6.wav';

    fs.readFile(path, function (err, data) {

        if (err) throw err;

        fs.readFile(path2, function (err, data2) {

            if (err) throw err;

            fs.readFile(path3, function (err, data3) {

                if (err) throw err;

                context.decodeAudioData(data, function (decodedArrayBuffer) {
                    context.decodeAudioData(data2, function (decodedArrayBuffer2) {
                        context.decodeAudioData(data3, function (decodedArrayBuffer3) {
                            console.log(22222222222222222222);
                            console.log(decodedArrayBuffer2.getChannelData(0).length);
                            response.status(200).json({
                                success: true,
                                data: recognition.r(
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
var app = (require('express').Router)();
var bodyParser = require("body-parser");
var recognition = require('./lib/vr').construct(128);
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

    var res = recognition.mfcc(request.body['waveform[]'], true);

    var word = new Word({
        word: request.body['word'],
        mfcc: res.mel
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
            message: 'Слово "' + request.body['word'] + '" добавлено в словарь!',
            mfcc: res
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
            word: recognition.recornize(waveform, words, true)
        });
    });
});

module.exports = app;
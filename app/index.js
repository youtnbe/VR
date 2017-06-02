var express = require("express");
var app = express();
var config = require('../config');
// ------------------------------------------------------------------------
var fs = require('fs');

var AudioContext = require('web-audio-api').AudioContext;
var context = new AudioContext;
var recognition = require('./recognition/lib/vr').construct(256);
// ------------------------------------------------------------------------

var bodyParser = require("body-parser");
var cors = require('cors');

var http = require('http');
var wav = require('wav');

app.use(express.static(__dirname + '/front'));

fs.readFile(__dirname + '/recognition/files/signal.wav', function (err, data) {

        if (err) throw err;

        context.decodeAudioData(data, function (decodedArrayBuffer) {
            recognition(decodedArrayBuffer.getChannelData(0));
        });
    });

app.use(require('./recognition'));


app.listen(config.port, (err) => {
    if (err)
        throw err;
    else
        console.log('Running server at port 3000!');
});

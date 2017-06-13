var express = require("express");
var app = express();
var config = require('../config');

var bodyParser = require("body-parser");
var cors = require('cors');

var http = require('http');
var wav = require('wav');

var config = require('./config');

require('./dbinit');

app.use(express.static(__dirname + '/front'));


app.use(require('./recognition'));


app.listen(config.port, (err) => {
    if (err)
        throw err;
    else
        console.log('Running server at port 3000!');
});

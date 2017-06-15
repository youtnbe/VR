var context = new window.AudioContext();

const API_ENDPOINT = 'http://localhost:3000/service/';

$(function () {



    $('#add').click(function () {
        var data = {};
        data.word = $('#word').val();
        var path = window.URL.createObjectURL(document.getElementById('file').files[0]);
        getWaveformFromFile(path).then(function (waveform) {
            data['waveform'] = waveform;
            setGraph(arrayToGraph(waveform), '#gr1');
            $.post(API_ENDPOINT + 'wordAdd', data, function (data) {
                console.log(data);
            });
        });

    });

    $('#rec').click(function () {
        var data = {};
        var path = window.URL.createObjectURL(document.getElementById('file_r').files[0]);
        getWaveformFromFile(path).then(function (waveform) {
            data['waveform'] = waveform;
            setGraph(arrayToGraph(waveform, 0.006), '#gr1');
            setGraph(arrayToGraph(waveform), '#gr2');
            console.log(data);
            $.post(API_ENDPOINT + 'recognize', data, function (data) {
                console.log(data);
            });
        });
    });

    $('#recognize').hide();
    $('#dictionary').show();
    $('#dict_tab').click(() => {
        $('#dictionary').show();
        $('#recognize').hide();
    });
    $('#recg_tab').click(() => {
        $('#recognize').show();
        $('#dictionary').hide();
    });


});

function setGraph(array, graph, min, max, width) {
    $.plot($(graph), [array], {
        series: {
            lines: {
                lineWidth: width ? width : 1
            },
            points: {
                show: false,
                radius: 3
            },
            shadowSize: 0
        },
        yaxis: {
            min: min ? min : -1,
            max: max ? max : 1
        },
        colors: ["#FF7070", "#0022FF"],
    });
}


function arrayToGraph(array, e) {
    e ? array = trim(array, e) : '';
    var new_array = [];
    if (array[0][0]) {
        for (var i = 0; i < array.length; i++)
            new_array[i] = [i, array[i][0]];
    } else {
        for (var i = 0; i < array.length; i++)
            new_array[i] = [i, array[i]];
    }
    return new_array;
}

function trim(waveform, e) {

    let n1 = 0;
    let n2 = waveform.length - 1;
    while (waveform[n1] < e)
        n1++;
    while (waveform[n2] < e)
        n2--;
    return waveform.slice(n1, n2);
}


function waveformCopy(waveform) {
    var new_waveform = [];

    for (var i = 0; i < waveform.length; i++)
        new_waveform.push(waveform[i]);

    return new_waveform;
}

function getWaveformFromFile(url) {
    var deferred = $.Deferred();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (e) {
        context.decodeAudioData(this.response,
            function (decodedArrayBuffer) {
                deferred.resolve(waveformCopy(decodedArrayBuffer.getChannelData(0)));
            }, function (e) {
                console.log('Error decoding file', e);
                deferred.reject(e);
            });
    };
    xhr.send();
    return deferred;
}

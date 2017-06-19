const context = new window.AudioContext();

const API_ENDPOINT = 'http://localhost:3000/service/';

$(function () {


    $('#file').change(() => {
        $('#dictionary .result').hide();
    });
    $('#add').click(function () {
        var data = {};
        data.word = $('#word').val();
        var path = window.URL.createObjectURL(document.getElementById('file').files[0]);
        getWaveformFromFile(path).then(function (waveform) {
            data['waveform'] = waveform;
            $.post(API_ENDPOINT + 'wordAdd', data, function (data) {
                console.log(data);
                $('#dictionary .result').show(0, () => {
                    setGraph([arrayToGraph(waveform, 0.006)], '#gr1');
                    setGraph([arrayToGraph(data.mfcc.filters[0]),
                        arrayToGraph(data.mfcc.filters[1]),
                        arrayToGraph(data.mfcc.filters[2]),
                        arrayToGraph(data.mfcc.filters[3]),
                        arrayToGraph(data.mfcc.filters[4]),
                        arrayToGraph(data.mfcc.filters[5]),
                        arrayToGraph(data.mfcc.filters[6]),
                        arrayToGraph(data.mfcc.filters[7]),
                        arrayToGraph(data.mfcc.filters[8]),
                        arrayToGraph(data.mfcc.filters[9])], '#gr2', 0, 1);
                    $('#filter').bind("input change", function () {
                        setGraph([arrayToGraph(data.mfcc.mel, null, +$('#filter').val() - 1)], '#gr3', 0, 1);
                        $('#filterNumber').text($('#filter').val());
                    }).val(1).change();
                    $('#dictionary .result .answer').text(data.message);
                });
            });
        });
    });

    $('#file_r').change(() => {
        $('#recognize .result').hide();
    });
    $('#rec').click(function () {
        var data = {};
        var path = window.URL.createObjectURL(document.getElementById('file_r').files[0]);
        getWaveformFromFile(path).then(function (waveform) {
            data['waveform'] = waveform;
            console.log(data);
            $.post(API_ENDPOINT + 'recognize', data, function (data) {
                console.log(data);
                $('#recognize .result').show(0, () => {
                    $('#recognize .result .answer').text('Произнесенное слово: "' + data.word.a.word + '".');
                    setGraph([arrayToGraph(waveform, 0.006)], '#gr4');
                    $('#filterIn').bind("input change", function () {
                        setGraph([arrayToGraph(data.word.input, null, +$('#filterIn').val() - 1)], '#gr5');
                        setGraph([arrayToGraph(data.word.a.mfcc, null, +$('#filterIn').val() - 1)], '#gr6');
                        $('#filterNumberIn').text($('#filterIn').val());
                        $('#filterNumberFind').text($('#filterIn').val());
                    }).val(1).change();
                });
            });
        });
    });

    $('#recognize').hide();
    $('#dictionary').show();
    $('#recg_tab').show();
    $('#dict_tab').hide();
    $('#dict_tab').click(() => {
        $('#dictionary').show();
        $('#recg_tab').show();
        $('#dict_tab').hide();
        $('#recognize').hide();
    });
    $('#recg_tab').click(() => {
        $('#recognize').show();
        $('#dict_tab').show();
        $('#recg_tab').hide();
        $('#dictionary').hide();
    });


});

function setGraph(array, graph, min, max, width) {
    $.plot($(graph), array, {
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
            min: min != undefined ? min : undefined,
            max: max != undefined ? max : undefined
        },
        colors: ["#FF7070", "#0022FF"],
    });
}


function arrayToGraph(array, e, n) {
    e ? array = trim(array, e) : '';
    var new_array = [];
    if (array[0] && array[0][0]) {
        for (var i = 0; i < array.length; i++)
            new_array[i] = [i, array[i][n]];
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

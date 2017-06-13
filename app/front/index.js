var contextClass = (window.AudioContext ||
window.webkitAudioContext ||
window.mozAudioContext ||
window.oAudioContext ||
window.msAudioContext);
if (contextClass) {
    var context = new contextClass();
} else {
    alert('The WebAudio API are not supported in this browser.');
}

const API_ENDPOINT = 'http://localhost:3000/service/';

$(function () {
    console.log('start!');

    $('#add').click(function () {
        var data = {};
        data.word = $('#word').val();
        var path = window.URL.createObjectURL(document.getElementById('file').files[0]);
        getWaveformFromFile(path).then(function (waveform) {
            data['waveform'] = waveform;
            console.log(data);
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
            console.log(data);
            $.post(API_ENDPOINT + 'recognize', data, function (data) {
                console.log(data);
            });
        });
    });

    $.get(API_ENDPOINT + 'recognition2', function (data) {
        console.log(data);
    });


    function dataProcessing(data) {
        console.log(data.data);


        setGraph(arrayToGraph(data.data.wav1), '#gr1');
        setGraph(arrayToGraph(data.data.wav2), '#gr2');
        setGraph(arrayToGraph(data.data.wav3), '#gr6');

        let m1 = [];
        for (let i = 0; i < data.data.m1.length; i++) {
            m1[i] = data.data.m1[i][8];
        }
        setGraph(arrayToGraph(m1), '#gr3');

        let m2 = [];
        for (let i = 0; i < data.data.m2.length; i++) {
            m2[i] = data.data.m2[i][8];
        }
        setGraph(arrayToGraph(m2), '#gr4');

        let w12 = [];
        for (let i = 0; i < data.data.d12.w.length; i++) {
            w12[i] = data.data.d12.w[i];
        }
        setGraph(arrayToGraph(w12), '#gr5');


        let m3 = [];
        for (let i = 0; i < data.data.m3.length; i++) {
            m3[i] = data.data.m3[i][8];
        }
        setGraph(arrayToGraph(m3), '#gr7');

        let w23 = [];
        for (let i = 0; i < data.data.d23.w.length; i++) {
            w23[i] = data.data.d23.w[i];
        }
        setGraph(arrayToGraph(w23), '#gr8');

        // setGraph(arrayToGraph(data.data.fft[0]), '#gr2');

    }

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
            }, /*
             yaxis: {
             min: min ? min : -1,
             max: max ? max : 1
             },*/
            colors: ["#FF7070", "#0022FF"],
        });
    }

    function arrayToGraph(array) {
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
});


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
                console.log(1111111111111111111111111);
                console.log(decodedArrayBuffer.getChannelData(0).length);
                deferred.resolve(waveformCopy(decodedArrayBuffer.getChannelData(0)));
            }, function (e) {
                console.log('Error decoding file', e);
                deferred.reject(e);
            });
    };
    xhr.send();
    return deferred;
}

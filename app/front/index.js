const API_ENDPOINT = 'http://localhost:3000/service/';

$(function () {
    console.log('start!');
    $.ajax({
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    console.log(percentComplete);
                }
            }, false);
            return xhr;
        },
        url: API_ENDPOINT + 'recognition',
        success: function (data) {
            dataProcessing(data);
        }
    });

    function dataProcessing(data) {
        console.log(data.data);


        setGraph(arrayToGraph(data.data.wav1), '#gr1');
        setGraph(arrayToGraph(data.data.wav2), '#gr3');
        setGraph(arrayToGraph(data.data.wav3), '#gr5');

        let m1 = [];
        for (let i = 0; i < data.data.m1.length; i++) {
            m1[i] = data.data.m1[i][8];
        }
        setGraph(arrayToGraph(m1), '#gr2');

        let m2 = [];
        for (let i = 0; i < data.data.m2.length; i++) {
            m2[i] = data.data.m2[i][8];
        }
        setGraph(arrayToGraph(m2), '#gr4');

        let m3 = [];
        for (let i = 0; i < data.data.m3.length; i++) {
            m3[i] = data.data.m3[i][8];
        }
        setGraph(arrayToGraph(m3), '#gr6');

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
            },/*
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


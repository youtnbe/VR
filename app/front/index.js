const API_ENDPOINT = 'http://localhost:3000/service/';

$(function () {
    $.ajax({
        url: API_ENDPOINT + 'recognition',
        success: function (data) {
            dataProcessing(data);
        }
    });

    function dataProcessing(data) {
        console.log(data.data);


        setGraph(arrayToGraph(data.data.wav), '#gr1');
        setGraph(arrayToGraph(data.data.fft), '#gr2');

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


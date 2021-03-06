var fftcopm = require('./fft').fft;
var complex = require('./complex');

module.exports = {
    normalizeWaveform: normalizeWaveform,
    waveformForFFT: waveformForFFT,
    waveformCopy: waveformCopy,
    getFrames: getFrames,
    isVoice: isVoice,
    hammingWindow: hammingWindow,
    fft: fft
};

function fft(waveform) {
    var fourierTransform = fftcopm(waveform);

    var f = [];

    for (let i = 0; i < fourierTransform.length; i++) {
        f[i] = complex.magnitude(fourierTransform[i]);
    }

    return f;
}

function waveformCopy(waveform) {
    var new_waveform = [];

    for (var i = 0; i < waveform.length; i++)
        new_waveform.push(waveform[i]);

    return new_waveform;
}

function waveformForFFT(waveform) {
    var new_waveform = waveformCopy(waveform);
    var norm_length = 2;

    while (norm_length < waveform.length)
        norm_length *= 2;
    while (new_waveform.length != 16384)
        new_waveform.push(0);

    return new_waveform;
}

function normalizeWaveform(waveform) {
    var new_waveform = [];
    var max = 0;

    for (var i = 0; i < waveform.length; i++)
        if (Math.abs(waveform[i]) > max)
            max = waveform[i];

    for (var i = 0; i < waveform.length; i++)
        new_waveform[i] = waveform[i] / max;

    return new_waveform;
}

function getFrames(waveform, width) {

    var frames = [];
    var wave = waveform.slice();
    var step = Math.floor(width / 2);

    while (wave.length > step) {
        frames.push(wave.slice(0, width));
        wave.splice(0, step);
    }

    return frames;
}


function isVoice(frame) {
    let s = 0;
    const e = 0.003;
    for (let i = 0; i < frame.length; i++)
        s += Math.abs(frame[i]);

    s /= frame.length;

    return s > e;
}

function hammingWindow(array) {
    var new_array = [];

    for (var i = 0; i < array.length; i++) {
        var h = 0.56 - 0.46 * Math.cos(2 * Math.PI * i / (array.length - 1));
        new_array[i] = array[i] * h;
    }

    return new_array;

}
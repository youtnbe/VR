var fftcopm = require('./fft').fft;
var complex = require('./complex');
var mfccc = require('./mfcc').construct(256, 10, 300, 8000, 16000);
var powerSpectrum = require('./mfcc').powerSpectrum;

module.exports = {
    normalizeWaveform: normalizeWaveform,
    waveformForFFT: waveformForFFT,
    waveformCopy: waveformCopy,
    getFrames: getFrames,
    isVoice: isVoice,
    hammingWindow: hammingWindow,
    fft: fft,
    mfcc: mfcc,
    DTWDistance: DTWDistance,
    trim: trim
};

function trim(waveform) {
    const e = 0.006;

    let n1 = 0;
    let n2 = waveform.length - 1;
    while (waveform[n1] < e)
        n1++;
    while (waveform[n2] < e)
        n2--;
    return waveform.slice(n1, n2);
}

function DTWDistance(a, b, distance) {
    let DTW = [];
    let n = a.length;
    let m = b.length;

    DTW[0] = [];
    DTW[0][0] = 0;
    for (let i = 1; i < n; i++) {
        DTW[i] = [];
        DTW[i][0] = distance(a[i], b[0]) + DTW[i - 1][0];
    }

    for (let i = 1; i < m; i++) {
        DTW[0][i] = distance(a[0], b[i]) + DTW[0][i - 1];
    }


    for (let i = 1; i < n; i++)
        for (let j = 1; j < m; j++) {
            let cost = distance(a[i], b[j]);
            DTW[i][j] = cost + Math.min(DTW[i - 1][j],    // insertion
                    DTW[i][j - 1],    // deletion
                    DTW[i - 1][j - 1]);    // match
        }

    let i = n - 1, j = m - 1;
    let w = [];
    // determinate of warping path
    w.push(DTW[i][j]);
    do {
        if (i > 0 && j > 0)
            if (DTW[i - 1][j - 1] <= DTW[i - 1][j])
                if (DTW[i - 1][j - 1] <= DTW[i][j - 1]) {
                    i--;
                    j--;
                }
                else j--;
            else if (DTW[i - 1][j] <= DTW[i][j - 1])
                i--;
            else
                j--;
        else if (i == 0)
            j--;
        else i--;
        w.push(DTW[i][j]);
    }
    while (i != 0 || j != 0);

    return DTW[n - 1][m - 1];
}

function mfcc(frames) {

    let mel = [];
    let fourier = [];

    for (let i = 0; i < frames.length; i++) {

        fourier[i] = fft(waveformForFFT(frames[i]));

        fourier[i] = hammingWindow(fourier[i]);

        mel[i] = mfccc(powerSpectrum(fourier[i]));

    }
    return mel;
}

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
    while (new_waveform.length != norm_length)
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
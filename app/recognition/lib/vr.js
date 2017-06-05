var vrUtil = require('./vrutil');


module.exports = {
    construct: construct
};

function construct(frameWidth) {
    if (!frameWidth) throw Error('Please provide an frame width');

    return function (wav, wav2, wav3) {

        let m1 = melcep(wav);
        let m2 = melcep(wav2);
        let m3 = melcep(wav3);

        let d12 = dtw(m1, m2, distance);
        let d23 = dtw(m1, m3, distance);

        return {
            wav1: vrUtil.waveformCopy(wav),
            wav2: vrUtil.waveformCopy(wav2),
            wav3: vrUtil.waveformCopy(wav3),
            m1: m1,
            m2: m2,
            m3: m3,
            d12: d12,
            d23: d23
        };

    };


    function melcep(wav) {
        var waveform = vrUtil.waveformCopy(wav);

        var normalizedWaveform = vrUtil.normalizeWaveform(waveform);

        var frames = vrUtil.getFrames(normalizedWaveform, frameWidth);

        return vrUtil.mfcc(frames);
    }
}

function distance(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) {
        s += Math.pow(a[i] - b[i], 2);
    }

    return Math.sqrt(s);

}

function dtw(a, b, distance) {
    let dw = [];
    let w = [];
    // a,b - the sequences, dw - the minimal distances matrix
    // w - the warping path
    let n = a.length;
    let m = b.length;
    let d = []; // the euclidian distances matrix
    for (let i = 0; i < n; i++) {
        d[i] = [];
        for (let j = 0; j < m; j++) {
            d[i][j] = distance(a[i], b[j]);
        }
    }
    // determinate of minimal distance
    dw[0] = [];
    dw[0][0] = d[0][0];
    for (let i = 1; i < n; i++) {
        dw[i] = [];
        dw[i][0] = d[i][0] + dw[i - 1][0];
    }
    for (let j = 1; j < m; j++)
        dw[0][j] = d[0][j] + dw[0][j - 1];
    for (let i = 1; i < n; i++)
        for (let j = 1; j < m; j++)
            if (dw[i - 1][j - 1] <= dw[i - 1][j])
                if (dw[i - 1][j - 1] <= dw[i][j - 1])
                    dw[i][j] = d[i][j] + dw[i - 1][j - 1];
                else
                    dw[i][j] = d[i][j] + dw[i][j - 1];
            else if (dw[i - 1][j] <= dw[i][j - 1])
                dw[i][j] = d[i][j] + dw[i - 1][j];
            else
                dw[i][j] = d[i][j] + dw[i][j - 1];
    let i = n - 1, j = m - 1;
    let element = dw[i][j];
    // determinate of warping path
    w.push(dw[i][j]);
    do {
        if (i > 0 && j > 0)
            if (dw[i - 1][j - 1] <= dw[i - 1][j])
                if (dw[i - 1][j - 1] <= dw[i][j - 1]) {
                    i--;
                    j--;
                } else j--;
            else if (dw[i - 1][j] <= dw[i][j - 1])
                i--;
            else
                j--;
        else if (i == 0)
            j--;
        else i--;
        w.push(dw[i][j]);
    }
    while (i != 0 || j != 0);

    let s = 0;
    for (let i = 0; i < w.length; i++) {
        s += w[i];
    }

    return s / w.length;
}






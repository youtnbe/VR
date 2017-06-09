var vrUtil = require('./vrutil');


module.exports = {
    construct: construct
};

function construct(frameWidth) {
    if (!frameWidth) throw Error('Please provide an frame width');

    return {
        mfcc: function (waveform) {
            var normalizedWaveform = vrUtil.normalizeWaveform(waveform);
            var frames = vrUtil.getFrames(normalizedWaveform, frameWidth);
            return vrUtil.mfcc(frames);
        },
        recornize: function (wav, wav2, wav3) {

            var wav = trim(wav);
            var wav2 = trim(wav2);
            var wav3 = trim(wav3);

            let m1 = melcep(wav);
            let m2 = melcep(wav2);
            let m3 = melcep(wav3);

            let d12 = DTWDistance(m1, m2, distance);
            let d23 = DTWDistance(m1, m3, distance);


            return {
                wav1: vrUtil.waveformCopy(wav),
                wav2: vrUtil.waveformCopy(wav2),
                wav3: vrUtil.waveformCopy(wav3),
                m1: m1,
                m2: m2,
                m3: m3,
                d12: d12,
                d23: d23,
                qqq: DTWDistance([0, 0, 1, 2, 4, 9, 2, 0, 0, 0], [0, 2, 9, 1, 0], function (a, b) {
                    return Math.abs(a - b);
                }),
                qqq1: DTWDistance([9, 6, 7, 0, 0, 1, 3, 4, 9, 8], [0, 2, 9, 1, 0], function (a, b) {
                    return Math.abs(a - b);
                })
            };

        },

    }

    function trim(waveform) {
        const e = 0.001;

        let n1 = 0;
        let n2 = waveform.length - 1;
        while (waveform[n1] < e)
            n1++;
        while (waveform[n2] < e)
            n2--;
        return waveform.slice(n1, n2);
    }

    function mfcc(wav) {

    }
}

function distance(a, b) {

    let s = 0;

    for (let i = 0; i < a.length; i++) {
        s += Math.pow(a[i] - b[i], 2);
    }

    return Math.sqrt(s) > 0.04 ? Math.sqrt(s) : 0;
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


    return {
        val: DTW[n - 1][m - 1],
        dtw: DTW,
        w: w.reverse()
    };
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
                }
                else j--;
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

    return {
        val: s / w.length,
        w: w,
        dw: dw
    };
}






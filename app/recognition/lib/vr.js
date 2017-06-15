var vrUtil = require('./vrutil');

module.exports = {
    construct: function (frameWidth) {
        if (!frameWidth) throw Error('Please provide an frame width');

        return {
            mfcc: function (waveform) {
                var normalizedWaveform = vrUtil.normalizeWaveform(vrUtil.trim(waveform));
                var frames = vrUtil.getFrames(normalizedWaveform, frameWidth);
                return vrUtil.mfcc(frames);
            },
            recornize: function (waveform, words, debug) {

                let currentMfcc = this.mfcc(vrUtil.trim(waveform));
                let minDistance = 100;
                let answer = '';

                let ds = [];

                words.forEach((word) => {
                    let d = vrUtil.DTWDistance(currentMfcc, word.mfcc, function (a, b) {
                        let s = 0;
                        for (let i = 0; i < a.length; i++) {
                            s += Math.pow(a[i] - b[i], 2);
                        }
                        return Math.sqrt(s) > 0.04 ? Math.sqrt(s) : 0;
                    });

                    ds.push({
                        d: d,
                        w: word
                    });

                    if (d < minDistance) {
                        minDistance = d;
                        answer = word.word;
                    }
                });

                return debug ? {
                    min: minDistance,
                    a: answer,
                    ds: ds
                } : answer;
            }
        };
    }
};

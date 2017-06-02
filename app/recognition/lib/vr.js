var fft = require('./fft').fft;
var vrUtil = require('./vrutil');
var mfcc = require('./mfcc').construct(16384, 10, 300, 8000, 256);
var powerSpectrum = require('./mfcc').powerSpectrum;

var complex = require('./complex');

module.exports = {
    construct: construct
};

function construct(frameWidth) {
    if (!frameWidth) throw Error('Please provide an frame width');

    return function (wav, debug) {

        var result = '';

        var waveform = vrUtil.waveformCopy(wav);
        console.log(waveform.length);

        var normalizedWaveform = vrUtil.normalizeWaveform(waveform);
        console.log(normalizedWaveform.length);

        var frames = vrUtil.getFrames(normalizedWaveform, frameWidth);
        console.log(frames.length);

        var voice = [];

        for (let i = 0; i < frames.length; i++) {
            if (vrUtil.isVoice(frames[i]))
                for (let j = 0; j < Math.floor(frameWidth /2 ); j++)
                    voice.push(1);
            else
                for (let j = 0; j <  Math.floor(frameWidth /2 ); j++)
                    voice.push(0);
        }

        var waveformForFFT = vrUtil.waveformForFFT(normalizedWaveform);
        console.log(waveformForFFT.length);

        var fourierTransform = vrUtil.fft(vrUtil.waveformForFFT(waveform));


        fourierTransform = vrUtil.hammingWindow(fourierTransform);

        var power = powerSpectrum(fourierTransform)

        var mel = mfcc(power, true);

        return debug ? {
            wav: waveform,
            fft: fourierTransform,
            frames: frames,
            voice: voice,
            mfcc: mel
        } : result;

    }
}





var complex = require('./complex'),
    fftUtil = require('./fftutil'),
    twiddle = require('bit-twiddle');

module.exports = {
    fft: function fft(vector) {
        var X = [],
            N = vector.length;

        // Base case is X = x + 0i since our input is assumed to be real only.
        if (N == 1) {
            if (Array.isArray(vector[0])) //If input vector contains complex numbers
                return [[vector[0][0], vector[0][1]]];
            else
                return [[vector[0], 0]];
        }

        // Recurse: all even samples
        var X_evens = fft(vector.filter(even)),

        // Recurse: all odd samples
            X_odds = fft(vector.filter(odd));

        // Now, perform N/2 operations!
        for (var k = 0; k < N / 2; k++) {
            // t is a complex number!
            var t = X_evens[k],
                e = complex.multiply(fftUtil.exponent(k, N), X_odds[k]);

            X[k] = complex.add(t, e);
            X[k + (N / 2)] = complex.subtract(t, e);
        }

        function even(__, ix) {
            return ix % 2 == 0;
        }

        function odd(__, ix) {
            return ix % 2 == 1;
        }

        return X;
    },
    fftInPlace: function (vector) {
        var N = vector.length;

        var trailingZeros = twiddle.countTrailingZeros(N); //Once reversed, this will be leading zeros

        // Reverse bits
        for (var k = 0; k < N; k++) {
            var p = twiddle.reverse(k) >>> (twiddle.INT_BITS - trailingZeros);
            if (p > k) {
                var complexTemp = [vector[k], 0];
                vector[k] = vector[p];
                vector[p] = complexTemp;
            } else {
                vector[p] = [vector[p], 0];
            }
        }

        //Do the DIT now in-place
        for (var len = 2; len <= N; len += len) {
            for (var i = 0; i < len / 2; i++) {
                var w = fftUtil.exponent(i, len);
                for (var j = 0; j < N / len; j++) {
                    var t = complex.multiply(w, vector[j * len + i + len / 2]);
                    vector[j * len + i + len / 2] = complex.subtract(vector[j * len + i], t);
                    vector[j * len + i] = complex.add(vector[j * len + i], t);
                }
            }
        }
    }
};
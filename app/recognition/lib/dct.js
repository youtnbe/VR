cosMap = null;

var memoizeCosines = function(N) {
  cosMap = cosMap || {};
  cosMap[N] = new Array(N*N);

  var PI_N = Math.PI / N;

  for (var k = 0; k < N; k++) {
    for (var n = 0; n < N; n++) {
      cosMap[N][n + (k * N)] = Math.cos(PI_N * (n + 0.5) * k);
    }
  }
};

function run(signal, scale) {
  var L = signal.length,
      self = this;

  scale = scale || 2;

  if (!cosMap || !cosMap[L]) memoizeCosines(L);

  var coefficients = signal.map(function () {return 0;});

  return coefficients.map(function (__, ix) {
    return scale * signal.reduce(function (prev, cur, ix_, arr) {
      return prev + (cur * cosMap[L][ix_ + (ix * L)]);
    }, 0);
  });
};

module.exports = run;

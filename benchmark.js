//
// bw_benchmark
// benchmark.js
// this script is the main launcher
//


(function(window) {

window._bwBenchmark = window._bwBenchmark || {
  config: {
    delay: 1000, // wait XXms until start
    endpoint: 'lab.videodesk.com/bw_benchmark/api.php',
    bwjs: 'dev.videodesk.com/cyrille/network/js/network.min.js'
  },
  // various flags, has to be true when ready js, flash ...
  flags: {
    js: false
  },
  // the test suite is an array of functions
  tests: [
    function (cb) {
      var net = new Network({
        // If you define a value at the top level of the object,
        // it will be applied to every module.
        endpoint: _bwBenchmark.makeURL('dev.videodesk.com/cyrille/network/server/server.php'),
        download: {
          measures: 5,
          attempts: 3,
          delay: 8000,
          data: {
            size: 130 * 1024, // 130KB
            multiplier: 2.5
          }
        }
      });

      net.download
       .on('start', function(dataSize) {
           console.log('start', dataSize);
       })
       .on('progress', function(averageSpeed, instantSpeed) {
           console.log('progress', averageSpeed, instantSpeed);
       })
       .on('restart', function(dataSize) {
           console.log('restart', dataSize);
       })
       .on('end', function(averageSpeed, allInstantSpeeds) {
           console.log('end', averageSpeed, allInstantSpeeds);
           cb('js', averageSpeed);
       })
       .start();
    }
  ],
  init: function () {
    if(!this.isCandidate()) return;
    var that = this;
    window.setTimeout(function () {
      that.getReady(function () {
        that.run();
      });
    }, this.config.delay)
  },
  clear: function () {
    localStorage.removeItem('_bwBenchmark');
  },
  shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },
  isCandidate: function () {
    // doesn't support localStorage, let's give up
    if (!localStorage) return false;

    // doesn't support xhr2
    if (!new XMLHttpRequest().upload) {
      localStorage.setItem('_bwBenchmark', 'ineligible')
      return false
    }

    // already flagged visitor
    if (localStorage.getItem('_bwBenchmark') === 'measured' ||
      (localStorage.getItem('_bwBenchmark') === 'ineligible')) {
      console.log(localStorage.getItem('_bwBenchmark'));
      return false;
    }

    // forcing (for dev)
    if (localStorage.getItem('_bwBenchmark') === 'forced') {
      return true;
    }

    // randomly ignore 89% of candidates
    if (Math.floor(Math.random()*9)) {
      localStorage.setItem('_bwBenchmark', 'ineligible')
      return false;
    }
    // okay, let's give it a chance
    return true;
  },
  publish: function (results) {
    var r = new XMLHttpRequest();
    r.open("POST", this.makeURL(this.config.endpoint), true);
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) return;
      console.log('success: ' + r.responseText);
    };
    r.send(JSON.stringify(results));
  },
  // make a http(s) url
  makeURL: function (url) {
    return window.location.protocol + '//' + url;
  },
  // load a js and cb
  loadJS: function (src, cb) {
    var ref = window.document.getElementsByTagName( "script" )[ 0 ];
    var script = window.document.createElement( "script" );
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore( script, ref );
    if (cb && typeof(cb) === "function") {
      script.onload = cb;
    }
    return script;
  },
  // get ready for starting js
  getReady: function (cb) {
    var that = this;
    this.loadJS(this.makeURL(this.config.bwjs), function () {
      console.log('blah');
      that.isReady('js', cb);
    });
  },
  // check if ready, callback when ready
  // @param flagname
  // @callback called when all is green
  isReady: function (flag, cb) {
    this.flags[flag] = true;
    console.log('%s flag to green', flag);
    // if all flags are green, let's callback
    var allGreen = true;
    for(flag in this.flags) {
      if(this.flags.hasOwnProperty(flag)) {
        if(!flag) allGreen = false;
      }
    }
    if(allGreen && typeof(cb) === 'function') cb();
  },
  run: function () {
    console.log('run!')
    // let's make a shuffle
    var testIds = []
    for (var i = 0; i < this.tests.length; i++) {
      testIds.push(i);
    }
    testIds = this.shuffle(testIds);
    this.next(testIds, 0, {});
  },
  next: function (testIds, index, results) {
    var that = this;
    this.tests[testIds[0]](function (who, averageSpeed) {
      console.log('results from first test: %s measured %d', who, averageSpeed);
      results[who] = averageSpeed;
      var nextIndex = index +1;
      if(nextIndex < testIds.length) {
        next(testIds, nextIndex, results);
      }
      else {
        that.publish(results);
      }
    });
  },
  //
};

_bwBenchmark.init();
})(window);
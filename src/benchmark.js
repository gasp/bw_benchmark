var _bwBenchmark = window._bwBenchmark || {
  config: {
    host: 'bwbenchmark.videodesk.com',
    delay: 8000, // wait 8s until start
    bwjs: '/dist/network.min.js',
    bwswf: '/bwTesterLight.swf',
    bwswfjs: '/swfobject.js', // swfObject
    endpoint: '/api/bandwidth' // api endpoint
  },
  // various flags, has to be true when ready js, flash ...
  flags: {
    js: false,
    swf: false
  },
  // the test suite is an array of functions
  tests: [
    // network-js benchmark
    function (cb) {
      console.info('js bw tester');
      var net = new Network({
        // If you define a value at the top level of the object,
        // it will be applied to every module.
        endpoint: _bwBenchmark.makeURL('/dist/server.php'),
        download: {
          measures: 5,
          attempts: 3,
          delay: 2000,
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
           // console.log('progress', averageSpeed, instantSpeed);
       })
       .on('restart', function(dataSize) {
           console.log('restart', dataSize);
       })
       .on('end', function(averageSpeed, allInstantSpeeds) {
           console.log('end', averageSpeed, allInstantSpeeds);
           cb('js', averageSpeed);
       })
       .start();
    },
    // flash bw tester
    function (cb) {
      console.info('flash bw tester');
      document.getElementById('vdBwTester').startBwTester();
      window.bwTesterMsg = function (msg) {
        if(msg.indexOf('=>') === -1) {
          return;
        }
        // extracting Kbps from string
        msg = parseInt(msg.match(/(\d+)/g)[0], 10);
        cb('swf', msg);
      }
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
  shuffle: function (o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },
  isCandidate: function () {
    // doesn't support localStorage, let's give up
    if (!localStorage) return false;

    // doesn't support xhr2
    if (!new XMLHttpRequest().upload) {
      localStorage.setItem('_bwBenchmark', 'ineligible');
      return false;
    }

    // already flagged visitor
    if (localStorage.getItem('_bwBenchmark') === 'measured' ||
      localStorage.getItem('_bwBenchmark') === 'ineligible') {
      console.log(localStorage.getItem('_bwBenchmark'));
      return false;
    }

    // forcing (for dev)
    if (localStorage.getItem('_bwBenchmark') === 'forced') {
      return true;
    }

    // // randomly ignore 89% of candidates
    // if (Math.floor(Math.random()*9)) {
    //   localStorage.setItem('_bwBenchmark', 'ineligible')
    //   return false;
    // }
    // okay, let's give it a chance
    return true;
  },
  publish: function (results) {
    var r = new XMLHttpRequest();
    r.open('POST', this.makeURL(this.config.endpoint), true);
    r.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) return;
      console.log('success: ' + r.responseText);
      if (localStorage.getItem('_bwBenchmark') !== 'forced') {
        localStorage.setItem('_bwBenchmark', 'measured');
      }
    };
    r.send(JSON.stringify(results));
  },
  // make a http(s) url
  makeURL: function (url) {
    if(url[0] === '/') url = this.config.host + url;
    return window.location.protocol + '//' + url;
  },
  // load a js and cb
  loadJS: function (src, cb) {
    var ref = window.document.getElementsByTagName('script')[ 0 ];
    var script = window.document.createElement('script');
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore( script, ref );
    if (cb && typeof(cb) === 'function') {
      script.onload = cb;
    }
    return script;
  },
  // get ready for starting js
  getReady: function (cb) {
    var that = this;
    this.loadJS(this.makeURL(this.config.bwjs), function () {
      that.isReady('js', cb);
    });
    this.loadJS(this.makeURL(this.config.bwswfjs), function () {
      // flash container
      var div = document.createElement('div');
      div.id = 'videodesk-bwTester-outer';
      document.body.appendChild(div);

      var swfVersionStr = '11.1.0';
      var xiSwfUrlStr = 'https://cdn-videodesk.com/swf/playerProductInstall.swf';
      var flashvars = {};

      flashvars.from = 'player';
      flashvars.server_ip = '54.246.12.85';

      var params = {};
      params.allowscriptaccess = 'always';
      var attributes = {};
      attributes.id = 'vdBwTester';
      attributes.name = 'vdBwTester';
      swfobject.embedSWF(that.makeURL(that.config.bwswf),
        'videodesk-bwTester-outer',
        '1', '1',
        swfVersionStr, xiSwfUrlStr, flashvars, params, attributes);
      window.bwTesterReady = function () {
        that.isReady('swf', cb);
      }
    });
  },
  // check if ready, callback when ready
  // @param flagname
  // @callback called when all is green
  isReady: function (flag, cb) {
    this.flags[flag] = true;
    console.log('%s flag to green', flag);
    // if all flags are green, let's callback
    var greens = 0;
    var total = 0;
    for(f in this.flags) {
      if(this.flags.hasOwnProperty(f)) {
        if(this.flags[f]) greens ++;
      }
      total++;
    }
    if(greens === total && typeof(cb) === 'function') cb();
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
    this.tests[testIds[index]](function (who, averageSpeed) {
      console.log('results from test: %s measured %s', who, averageSpeed);
      results[who] = averageSpeed;
      var nextIndex = index +1;
      if(nextIndex < testIds.length) {
        that.next(testIds, nextIndex, results);
      }
      else {
        that.publish(results);
      }
    });
  }
};

_bwBenchmark.init();

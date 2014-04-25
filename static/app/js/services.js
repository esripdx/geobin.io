(function(){

  // Services
  angular.module('Geobin.services', [])

  // App Version
  .value('appVersion', '0.0.0')

  // API Version
  .value('apiVersion', '1')

  // Basemaps
  // --------
  // Houses all available basemaps, specifies default

  .service('basemaps', function () {
    this.init = function () {
      var streets = L.esri.basemapLayer('Streets');
      var topo = L.esri.basemapLayer('Topographic');
      var oceans = L.esri.basemapLayer('Oceans');
      var natgeo = L.esri.basemapLayer('NationalGeographic');
      var gray = L.layerGroup([
        L.esri.basemapLayer('Gray'),
        L.esri.basemapLayer('GrayLabels')
      ]);
      var darkgray = L.layerGroup([
        L.esri.basemapLayer('DarkGray'),
        L.esri.basemapLayer('DarkGrayLabels')
      ]);
      var imagery = L.layerGroup([
        L.esri.basemapLayer('Imagery'),
        L.esri.basemapLayer('ImageryLabels')
      ]);
      var shadedrelief = L.layerGroup([
        L.esri.basemapLayer('ShadedRelief'),
        L.esri.basemapLayer('ShadedReliefLabels')
      ]);
      var mapattack = L.tileLayer('http://mapattack-tiles-{s}.pdx.esri.com/dark/{z}/{y}/{x}', {
        maxZoom: 18,
        subdomains: '0123'
      });

      this.all = {
        'Streets': streets,
        'Topographic': topo,
        'Oceans': oceans,
        'Nat Geo': natgeo,
        'Gray': gray,
        'Dark Gray': darkgray,
        'Imagery': imagery,
        'Shaded Relief': shadedrelief,
        'Map Attack': mapattack
      };

      this.def = 'Map Attack';
    };

    this.init();
  })

  // Store
  // -----
  // localStorage interface for browser-based user persistence

  .service('store', function () {

    var local = new TinyStore('geobin');

    (function cleanHistory () {
      var h = local.session.history = local.session.history || [];
      var n = Math.floor(new Date().getTime() / 1000);

      for (var i = h.length - 1; i >= 0; i--) {
        var diff = h[i].expires - n;
        if (diff < 1) {
          h.splice(i, 1);
        }
      }

      local.save();
    })();

    this.local = local;

  })

  // API
  // ---
  // helpers for interacting with the Geobin API

  .service('api', ['$http', '$location', 'store', 'apiVersion', function ($http, $location, store, apiVersion) {

    // Create
    // ------
    // POST to /api/{apiVersion}/create
    // expects to get back an object with:
    // * id (string)
    // * expires (unix timestamp)

    this.create = function () {
      $http.post('/api/' + apiVersion + '/create', {})
      .success(function createSuccess (data, status, headers, config) {
        store.local.session.history.push(data);
        store.local.save();
        $location.path('/' + data.id);
      });
    };

    // History
    // -------
    // POST to /api/{apiVersion}/history/{binId}
    // expects to get back an object with:
    // * timestamp
    // * headers
    // * body
    // * geo

    this.history = function (binId, callback) {
      $http.post('/api/' + apiVersion + '/history/' + binId, {})
      .success(function historySuccess (data, status, headers, config) {
        if (status === 200) {
          callback(data);
        }
      });
    };

  }]);

})();

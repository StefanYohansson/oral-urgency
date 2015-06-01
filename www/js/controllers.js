angular.module('starter.controllers', ['cordovaGeolocationModule'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('PlaylistsCtrl', function($scope, urgencias) {
  var handleSuccess = function(data, status) {
    for(x=0;x<data.length;x++) {
      data[x].fields.isVisible = false;
      data[x].id = x;
    }
    $scope.protests = data;

  };

  urgencias.all().success(handleSuccess);

  $scope.cardClick = function(index) {
    $scope.protests[index].fields.isVisible = !$scope.protests[index].fields.isVisible;
  }
})

.controller('MapController', function($scope, $ionicLoading, $timeout, cordovaGeolocationService, hospitais) {
  var marker_image = 'img/marker.png';
  var markers = [];
  var myLocation;
  var geocoder;
  var map;
  var marker_title;
  var lat;
  var long;

  var posOptions = {enableHighAccuracy: false};

  $scope.loading = $ionicLoading.show({
    content: 'carregando localização...',
    showBackdrop: true
  });

  navigator.geolocation.getCurrentPosition(function (position) {
      lat  = position.coords.latitude
      long = position.coords.longitude
    }, function(err) {
      // error
    });

  var handleSuccess = function(data, status) {
    for(x=0;x<data.length;x++) {
      marker_title = data[x].fields.nome;
      geocoder.geocode( { 'address': data[x].fields.endereco_completo}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              title: marker_title,
              map: map,
              icon: marker_image,
              position: results[0].geometry.location
          });
          markers.push(marker);
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    }
  };


    var initialize = function() {
        var myLatlng = new google.maps.LatLng(lat, long);

        var mapOptions = {
            center: myLatlng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: true
        };

        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        geocoder = new google.maps.Geocoder();

        myLocation = new google.maps.Marker({
          position: new google.maps.LatLng(lat, long),
          map: map,
          icon: marker_image,
          title: "Minha localização"
        });

        $ionicLoading.hide();

        hospitais.all().success(handleSuccess);

        $scope.map = map;

        $timeout(function() {
          nearest = find_closest_marker(myLocation.position.lat(), myLocation.position.lng());

          var start = new google.maps.LatLng(myLocation.position.lat(), myLocation.position.lng());
          var end = new google.maps.LatLng(nearest.position.lat(), nearest.position.lng());

          var directionsDisplay = new google.maps.DirectionsRenderer();// also, constructor can get "DirectionsRendererOptions" object
          directionsDisplay.setMap(map); // map should be already initialized.

          var request = {
              origin : start,
              destination : end,
              travelMode : google.maps.TravelMode.DRIVING
          };
          var directionsService = new google.maps.DirectionsService();
          directionsService.route(request, function(response, status) {
              if (status == google.maps.DirectionsStatus.OK) {
                  directionsDisplay.setDirections(response);
              }
          });

        },8000);

    };

    $timeout(function() {
      ionic.Platform.ready(initialize);
    }, 3000);

    function rad(x) {return x*Math.PI/180;}
    function find_closest_marker( lat, lng ) {
        var R = 6371; // radius of earth in km
        var distances = [];
        var closest = -1;
        for( i=0;i<markers.length; i++ ) {
            var mlat = markers[i].position.lat();
            var mlng = markers[i].position.lng();
            var dLat  = rad(mlat - lat);
            var dLong = rad(mlng - lng);
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            distances[i] = d;
            if ( closest == -1 || d < distances[closest] ) {
                closest = i;
            }
        }

        return markers[closest];
    }



});

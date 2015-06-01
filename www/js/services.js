angular.module('starter.services', [])

.factory('urgencias', function($http) {
  return {
    all: function() {
      return $http.get('http://oralurgency.pythonanywhere.com/urgencias/');
    }
  };
})

.factory('hospitais', function($http) {
  return {
    all: function() {
      return $http.get('http://oralurgency.pythonanywhere.com/hospitais/');
    }
  };
});

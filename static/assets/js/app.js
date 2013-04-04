var app = angular.module('sparker', ['ui', 'ui.directives', 'ui.bootstrap']);

app.controller('MainCtrl', function($scope, $http) {
    var items;
  
    $http.get('assets/js/data.json').success(function(response){
        // Version 1
        $scope.items = response;
    
        // Version 2
        items = response;
    
        // Version 3
        angular.extend($scope.version3.data, response);
    });

    // Requires us to write comparison code ourselves :(
    $scope.version2 = {
        query: function (query) {
            var data = {results: []};
            angular.forEach(items, function(item, key){
                if (query.term.toUpperCase() === item.text.substring(0, query.term.length).toUpperCase()) {
                    data.results.push(item);
                }
            });
            query.callback(data);
        }
    };
    
    // Simply updating an existing reference :) (refer to $http.get() above)
    $scope.version3 = {
        data: []
    };
  
    // Built-in support for ajax
    $scope.version4 = {
        ajax: {
            url: "assets/js/data.json",
            data: function (term, page) {
                return {}; // query params go here
            },
            results: function (data, page) { // parse the results into the format expected by Select2.
                // since we are using custom formatting functions we do not need to alter remote JSON data
                return {results: data};
            }
        }
    }
});
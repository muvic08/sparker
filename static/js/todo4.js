var myModule = angular.module('sparker', ['ui', 'ui.directives', 'ui.bootstrap']);

myModule.factory('GeoLocation', function ($rootScope) {
    return {
        getCurrentPosition: function (onSuccess, onError, options) {
            navigator.geolocation.getCurrentPosition(function () {
                var that = this,
                args = arguments;
          
                if (onSuccess) {
                    $rootScope.$apply(function () {
                        onSuccess.apply(that, args);
                    });
                }

            }, function () {
                var that = this,
                args = arguments;
          
                if (onError) {
                    $rootScope.$apply(function () {
                        onError.apply(that, args);
                    });
                }
            },
            options);
        }
    };
});


myModule.factory('TasksManager', function() {

    var url = "ws://" + location.host + "/chatsocket";
    return {
        init : function(coordinates) {
            var self = this;

            this.connection = $.gracefulWebSocket(url);

            this.connection.onopen = function() {
                console.log("websocket connected :D");
                self.getSparks(coordinates);
            }
            this.connection.onclose = function() {
                console.log("websocket closed :(");
            }
            this.connection.onerror = function (error) {
                console.log(error);
            }
            this.connection.onmessage = function(event) {
                console.log("refresh: new message");
                var data = angular.fromJson(event.data);
                self.refresh(data);
            }
        },

        getSparks : function(coordinates) {
            this.sendMessage({
                location : coordinates,
                INTENT   : 'SET_USER_LOCATION'
            }); 
        },

        addTask : function(newSpark, coordinates, tags) {
            this.sendMessage({
                location : coordinates,
                INTENT   : 'SPARK',
                tags     :  tags,
                _xsrf    : "553eda96ea92457f8cd65c22198a760f",
                body     :  newSpark,
            }); 
        },

        upVoteSpark : function(id, status, votes, coordinates) {
            this.sendMessage({
                _id     : id,
                vote    : status,
                votes   : votes,
                INTENT  : 'UP_OR_DOWN_VOTE',
                location : coordinates,

            });
        },

        delTask : function(id) {
            this.sendMessage({
                method : "delTask",
                params : {
                    id : id
                }
            });
        },

        sendMessage : function(event) {
            this.connection.send(JSON.stringify(event));
        }
    }
});


function TodoCtrl($scope, TasksManager, GeoLocation, $timeout) {

    $scope.predicate = '-timeCreated';
    $scope.sortList = [
        {name: "Popular", icon: "icon-star", predicate: "votes", reverse: "!reverse"}, 
        {name: "Recent Sparks", icon:"icon-clock", predicate: "timeCreated", reverse: true}, 
        { name: "Sparks Near Me", icon: "icon-location", predicate: "distancePosted", reverse: false}
    ];

    $scope.tasks = [];
    $scope.unique_tags = [];
    $scope.total_count = 0;
    $scope.sortTags = "-count";
    $scope.showAllTags = false;

    GeoLocation.getCurrentPosition(function (position) {
        $scope.coordinates = [position.coords.latitude, position.coords.longitude];
        TasksManager.init($scope.coordinates);
    });

    $scope.addTask = function() {
        //TasksManager.addTask($scope.taskName);
        TasksManager.addTask($scope.newSpark, $scope.coordinates);
        $scope.newSpark = "";
    }

    $scope.upVoteSpark = function(element, vote) {
        var id = element._id;
        var votes = element.votes;
        if (votes > 0 || votes == 0 && parseInt(vote) == 1 ) {
            TasksManager.upVoteSpark(id, parseInt(vote), votes, $scope.coordinates);
        }
    }

    $scope.delTask = function(task) {
        TasksManager.delTask(task.id);
    }

    TasksManager.refresh = function(tasks) {

        if(tasks.length > 1) {
            angular.forEach(tasks, function(task) {
                var modifiedTask = $scope.sparkDict(task);
                $scope.tagsList(task);
                $scope.tasks.push(modifiedTask);
            });
        } else {
            if(tasks.INTENT && tasks.INTENT == 'UP_OR_DOWN_VOTE') { 
                angular.forEach($scope.tasks, function(task) {
                    if (task._id == tasks._id) {
                        task.votes = tasks.votes;
                    } 
                });
            } else {
                var modifiedTask = $scope.sparkDict(tasks);
                $scope.tagsList(tasks);
                $scope.tasks.push(modifiedTask);
            }
        }

        $scope.$digest();
    } 

    $scope.sparkDict = function(task) {
        task.timeCreated = new Date(task.datetime_created);
        var location_posted = new google.maps.LatLng(task.location[0], task.location[1]);
        var current_location = new google.maps.LatLng($scope.coordinates[0], $scope.coordinates[1]);
        task.distancePosted = parseInt(google.maps.geometry.spherical.computeDistanceBetween(current_location, location_posted).toFixed(0));
        task.taskTags = [];
        angular.forEach(task.tags, function(tag) {
            task.taskTags.push("#"+tag);
        });

        return task;
    }

    $scope.tagsList = function(task) {
        angular.forEach(task.tags, function(tag) {
            var tag_info = _.find($scope.unique_tags, function (x) { return x.tag === tag; });
            if (! tag_info)
                $scope.unique_tags.push({tag: tag, count: 1});
            else
                tag_info.count++;   
                $scope.total_count++
        });
    }

    $scope.tagFilter = function(tag, searchText) {
        if(tag) {
            $scope.searchText = "#"+tag;
        } else {
            $scope.searchText = "";   
        }
    };

    $scope.changeSort = function(predicate, reverse) {
        $scope.predicate = predicate;
        $scope.reverse = reverse;
    }; 

}

myModule.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString, "YYYY-MM-DD HH:mm:ss ZZ").fromNow()
    };
});
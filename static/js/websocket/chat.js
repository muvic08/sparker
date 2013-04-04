$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    activeLink.addClass("activeLink");
    $(".nav-link").bind('click', function(e) {
        e.preventDefault();
        $(".nav-link").removeClass("activeLink");
        activeLink = $(this);
        activeLink.addClass("activeLink");
    });

    $("#messageform").on("submit", function() {  // Using depricated JS. Use .on() instead to bind events to the selector
        newMessage($(this));
        return false;
    });
    $("#messageform").on("keypress", function(e) {
        if (e.keyCode == 13) {
            newMessage($(this));
            return false;
        }
    });

    $("#message").select();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            position = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            latlng = position;
            lat = position.lat();
            lon = position.lng();
            updater.start();
        });
    } else {
        alert("we could not get your location");
    }
});

function newMessage(form) {
    var message = form.formToDict();
    message['INTENT'] = "SPARK"
    message['location'] = [lat, lon];
    if (message.body.length > 1 && message.body != "Do you have an idea, spark it!" ) {
        updater.socket.send(JSON.stringify(message));
        console.log(JSON.stringify(message));
        $("#message").val("").select();
    };
}

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};

var updater = {
    socket: null,

    start: function() {
        var url = "ws://" + location.host + "/chatsocket";

        if ("WebSocket" in window) {
            updater.socket = new WebSocket(url);
        } else {
            console.log("WebSocket Connected to MozWebSocket(url)");
            updater.socket = new MozWebSocket(url);
        }
        updater.socket.onopen = function(event) {
            location_update_msg = {'location': [lat, lon], 'INTENT': 'SET_USER_LOCATION'}
            updater.socket.send(JSON.stringify(location_update_msg));
            console.log("WebSocket Connected to WebSocket(url)");
        }

        updater.socket.onmessage = function(event) {
            results = JSON.parse(event.data);
            if (sparksArray.length == 0) {
                sparksArray = results;
            };

            if (results.length >= 1) {
                $.each(sparksArray, function() {
                    popularArray.push(this);
                });
                updater.sortArray(popularArray);
                my = { viewModel: new ViewModel() };
                ko.applyBindings(my.viewModel); 
            } else {
                var spark = JSON.parse(event.data);
                updater.updateArray(results);
            };
        }

        updater.socket.onclose = function(event) {
            console.log("WebSocket Now Closed");
        }
    },

    updateArray: function(spark) {
        var existingItem;
        $.each(popularArray, function() {
            if (this._id == spark._id) {
                existingItem = spark;
                t = popularArray.indexOf(this);
                popularArray[t] = spark;
                updater.sortArray(popularArray);
                my.viewModel.change(popularArray);
            };
        });

        if (!existingItem) {
            popularArray.push(spark);
            updater.sortArray(popularArray);
            my.viewModel.change(popularArray);
        };
    },

    sortArray: function(array) {
        array.sort(function(a, b){
            var a1= a.votes, b1= b.votes;
            if(a1== b1) return 0;
            return a1> b1? 1: -1;
        });
        return array;
    },
};

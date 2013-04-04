// Filename : main.js
// Shortcut aliases

require.config({
	//baseUrl: '/static/js/',
	paths: {
		jquery: "/static/js/lib/jquery-1.9.1.min", 
		jqueryui: "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.0/jquery-ui.min",
		async: "/static/js/lib/async",
		underscore: "/static/js/lib/underscore.min",
		backbone: "/static/js/lib/backbone.min",
		knockout: "//cdnjs.cloudflare.com/ajax/libs/knockout/2.2.1/knockout-min",
		knockout_mapping: "//cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.3.5/knockout.mapping",
		modernizr: "/static/static_extra/js/vendor/modernizr-2.6.2-respond-1.1.0.min",
		bootstrap: "/static/static_extra/js/vendor/bootstrap.min",
		global_var: "/static/js/global_variable",
		ws: "/static/js/websocket/ws",
		ko_array: "/static/js/websocket/ko_array", // Knockout arrays
		sidebar: "/static/static_extra/js/sidebar",
		doc_ready: "/static/js/user_interface/doc_ready",
		win_resize: "/static/js/user_interface/win_resize",
		nav: "/static/js/user_interface/navigation",
		spark_form: "/static/js/user_interface/spark_form",
		autogrow: "/static/js/lib/autogrow",
		todo: "/static/static_extra/js/todo",
		last_load: "/static/js/user_interface/last_load",
	}
});

// convert Google Maps into an AMD module
define('gmaps', ['async!http://maps.google.com/maps/api/js?sensor=false&v=3&libraries=geometry'], 
function(){
    // return the gmaps namespace for brevity
    return window.google.maps;
});

/*
define('Sparker', ['/static/js/sparker.js'],
function(){
    // return the gmaps namespace for brevity
    return Sparker;
});
*/


require(['app'], function(App){
  // The "app" dependency is passed in as "App"
  App.initialize();
});
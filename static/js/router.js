// Filename: router.js

define([
  	'jquery',    
  	'gmaps',
  	'global_var',
    'ws',
    'modernizr',
    'bootstrap',
    'jqueryui',
    'doc_ready',
    'win_resize',
    'nav',
    'spark_form',
], function($, Gmaps, GVar, ws, modernizr, bootstrap, jqueryui, doc_ready, win_resize, nav, spark_form) {

  	var initialize = function() {
		if (navigator.geolocation) {
        	navigator.geolocation.getCurrentPosition( function(position) {
                position = new Gmaps.LatLng(position.coords.latitude,position.coords.longitude);
                Global_Var.latlng = position;
                Global_Var.lat = position.lat();
                Global_Var.lon = position.lng();
                Global_Var.latlon = [Global_Var.lat, Global_Var.lon];
                if (Global_Var.latlon != []) {
                    Global_Var.updater = ws.initialize();
                    Global_Var.updater.start();
                };
        	});
        } else {
            alert("we could not get your location");
        }
		
        return this;	
	};

    // document ready
    $(function(){
        doc_ready.initialize();
        spark_form.initialize();
        nav.initialize();
    });

    $(window).resize(function(){ 
        win_resize.initialize();
    });

    return {
  		initialize: initialize
  	};
});

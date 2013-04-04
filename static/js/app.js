// Filename: main.js

define([
    'jquery',
    'router', // Request router.js
], function($, Router){
    var initialize = function(){
        Router.initialize(); // Pass in our Router module and call it's initialize function
    }

    return {
        initialize: initialize
    };
});


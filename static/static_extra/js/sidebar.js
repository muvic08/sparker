var sidebarClosed = true;

var closeSidebar = function() {
    $(".sidebar").animate( { left: -0.89*$(window).width() }, 700, 'easeOutQuad', function() { } ); 
    $(".breadcrumb li a").animate( { opacity: 1.0 }, 700, 'easeOutQuad', function() { } ); 
    sidebarClosed = true;
};

var openSidebar = function() {
    $(".sidebar").animate( { left: "0px" }, 700, 'easeOutQuad', function() { } ); 
    $(".breadcrumb li a").animate( { opacity: 0.0 }, 700, 'easeOutQuad', function() { } ); 
    $(".sidebar").css({"min-height": $(window).height() - 2 });
    sidebarClosed = false;
};

jQuery(function(){
    $(".sidebar").css({"left":-0.89*$(window).width() }); // Close the sidebar when the page is loaded/reloaded
    $(".sort-list-desk-tablet").css({"max-height": $(window).height() - $(".logo").height() - 30 });
    $(".fixed-sidebar-desk-tablet").css({"position":"fixed", "width": $(".sidebar").width() });
    //$(".nav-header").css({"position":"fixed"});

    $(".sidebar-toggle").click(function(event) {
        if (sidebarClosed) {                           
            openSidebar();
        } else {                                      
            closeSidebar();
        };
        event.stopPropagation();
    });

    if($(this).width() < 767) {
        $(".breadcrumb li a").animate( { opacity: 1.0 }, 1, 'easeOutQuad', function() { } ); 
    };

    $(".content").click(function(event){
        if (!sidebarClosed) { closeSidebar(); };
        event.stopPropagation();
    }); 

    $(".back").click(function(event){
        if (!sidebarClosed) { closeSidebar(); };
        event.stopPropagation();
    }); 

});

//screen resize
jQuery(window).resize(function(){ 
    $(".sidebar").css({"min-height": $(window).height() - 2 });
    $(".sort-list-desk-tablet").css({"max-height": $(window).height() - $(".logo").height() - 30  });
    
    if (sidebarClosed) {                            // If the sidebar is closed, leave it closed
        $(".sidebar").css({"left":-0.89*$(window).width() });
    } else {                                        // If the sidebar is open, leave it open
        $(".sidebar").css({"left": "0px" });
    };

    if($(this).width() > 760) {
        $(".fixed-sidebar-desk-tablet").css({"position":"fixed", "width": $(".sidebar").width() });
        $(".breadcrumb li a").animate( { opacity: 1.0 }, 1, 'easeOutQuad', function() { } ); 
    } else if ($(this).width() < 759 && !sidebarClosed) {
        $(".breadcrumb li a").animate( { opacity: 0.0 }, 1, 'easeOutQuad', function() { } ); 
    }

    $(".content").click(function(event){
        if (!sidebarClosed) { closeSidebar(); };
        event.stopPropagation();
    }); 

    $(".back").click(function(event){
        if (!sidebarClosed) { closeSidebar(); };
        event.stopPropagation();
    }); 
});
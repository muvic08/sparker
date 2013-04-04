var ModalDemoCtrl = function ($scope, TasksManager, GeoLocation, $timeout) {   
    
    $scope.tagArray = [];

    $scope.open = function () {
        $scope.shouldBeOpen = true;
        $timeout(function () {
            $("#message").focus();  
            $('textarea').autogrow();
        });
    };

    $scope.tagOptions = { 
        tags: $scope.tagArray,
        width: $("#message"),
        maximumInputLength: 3,
        placeholder: "tags",
        tokenSeparators: [",", ".", ":", ";"],
        allowClear: true,
        containerCss: '1formatInput',
    };

    $scope.update = function(result) {
        if(result.length > 0) {
            $("#spark").removeAttr("disabled");
            $("#spark").addClass("btn-primary");
        } else {
            $("#spark").removeClass("btn-primary");
            $("#spark").attr("disabled", "disabled");
        }
    };

    $scope.spark = function (result) {
        var tagArray = [];
        if($scope.result)
        {
            console.log($scope.result);
            angular.forEach($scope.TagsString, function(tag) {
                var tagStr = (tag.text).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                console.log(tagStr);
                tagArray.push(tagStr);
            });
            $scope.tagArray = tagArray;
        }

        TasksManager.addTask($scope.result, $scope.coordinates, $scope.tagArray);
        $scope.result = "";
        $scope.TagsString = [];
        $scope.shouldBeOpen = false;
    };

    $scope.close = function(result) {
        $scope.result = "";
        $scope.shouldBeOpen = false;
    };

    $scope.items = ['item1', 'item2'];

    $scope.opts = {
        backdropFade: true,
        dialogFade:true
    };

};

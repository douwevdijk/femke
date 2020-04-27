const app = angular.module('app', ['ngRoute', 'ngMaterial']);

app.config( function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/_start.html',
            controllerAs: 'vm',
            controller: function ($mdMedia) {
               this.photos=[1,2,3,4,5,6,7,8];
               this.media = $mdMedia;
            }
        });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
});

app.directive('fadeInLoad', function () {
    return {
        link: function(scope, element) {
            element.on('load', function() {

                try {
                    scope.$evalAsync( function () {
                        if (scope.vm && scope.vm.image) {
                            scope.vm.image.loaded = true;
                        }
                    })
                } catch (err) {}

                jQuery(element).css('opacity', 1);
            });
        }
    }
})
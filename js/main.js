const app = angular.module('app', ['ngRoute', 'ngMaterial', 'firebase', 'ngSanitize']);

app.config( function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/_start.html',
            controllerAs: 'vm',
            controller: function ($scope, $firebaseObject, $firebaseArray, $mdMedia) {

                $scope.$on('$destroy', function () {
                    vm.settings.$destroy();
                    vm.photos.$destroy();
                })

                this.photos = $firebaseArray(dbService.child('items'));
                this.media = $mdMedia;

                this.settings = $firebaseObject(dbService.child('settings'));

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
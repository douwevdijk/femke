const app = angular.module('app', ['ngRoute', 'ngMaterial', 'firebase', 'ngSanitize']);

app.config( function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/_start.html',
            controllerAs: 'vm',
            controller: function ($scope, $firebaseObject, $rootScope, $mdMedia) {

                var vm = this;

                $scope.$on('$destroy', function () {
                    vm.media = null;
                })

                this.media = $mdMedia;
                $rootScope.settings = $firebaseObject(dbService.child('settings'));

            }
        })
        .when('/fotos', {
            templateUrl: 'templates/_photos.html',
            controllerAs: 'vm',
            controller: 'itemsCtrl'
        })
        .when('/afscheid', {
            templateUrl: 'templates/_afscheid.html',
            controller: function () {
                var vm = this;
            }
        });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
});

app.controller('itemsCtrl', function ($timeout, $firebaseArray) {

    var grid = new Muuri('.grid', {
        dragEnabled: false,
        layout: {
            fillGaps: true,
            horizontal: false,
            rounding: true
        }
    });

    var vm = this;

    var queue = async.queue( function (obj, cb) {

        let filterOptions = ['red', 'blue', 'green'];
        let element = generateElement(obj.id, generateRandomWord(2),
            getRandomItem(filterOptions),
            getRandomInt(1, 2),
            getRandomInt(1, 2),
            obj.val
        ).then((element)=> { 
            $timeout( function () {
                element.style.display = 'none';
                grid.add(element);
                grid.show(element);
                cb();
            })
        })
    });

    dbService.child('/items').on('child_added', function (snap) {

        let key = snap.key;
        let val = snap.val();

        queue.push({key: key, val: val})
        
    })

    var generateElement = function (id, title, color, width, height, val) {

        return new  Promise(resolve => {

            var img = new Image();
            img.src = val.file;

            img.onload = function () {

                var sizes = calculateAspectRatioFit(this.width, this.height);
                
                var itemElem = document.createElement('div');
                var itemTemplate = '' +
                    '<div style="height: ' + sizes.height + 'px; width: ' + sizes.width + 'px;" class="' + 'item color' + '" data-id="' + id + '" data-color="' + color + '" data-title="' + title + '">' +
                    '<div class="item-content">' +
                        '<div style="display: flex; justify-content: center;" class="card">' +
                        '<img style="height: ' + sizes.height + 'px; width: ' + sizes.width + 'px;" src="' + val.file + '"' + '/>' +
                        '</div>' + ( val.name ? '<div class="info"><div>' + val.name + '</div></div>' : '') +
                    '</div>' +
                    '</div>';

                itemElem.innerHTML = itemTemplate;
                return resolve(itemElem.firstChild);
            }

        });

    }

    function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(250 / srcWidth, 400 / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio };
    }

    function getRandomItem(collection) {
        return collection[Math.floor(Math.random() * collection.length)];
    }

    function getRandomInt(min,max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function generateRandomWord(length) {

        var characters = 'abcdefghijklmnopqrstuvwxyz';

        var ret = '';
        for (var i = 0; i < length; i++) {
        ret += getRandomItem(characters);
        }
        return ret;

    }

})

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
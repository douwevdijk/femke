    var app = angular.module('app', ['ngAnimate', 'ngAria', 'ngMaterial', 'ngRoute', 'firebase', 'templates']);

    app.config( function ($routeProvider, $locationProvider) {
      
      $routeProvider
			  .when('/', {
          templateUrl: '_start.html',
          controllerAs: 'vm',
          resolve: {
            args: function ($location) {
              return $location.path('/start')
            }
          }
        })
        .when('/start', {
          templateUrl: '_start.html',
          controllerAs: 'vm',
          controller: function () {
            this.logOut = function () {
              firebase.auth().signOut();
            }
          }
        })
        .when('/info', {
          templateUrl: '_info.html',
          controllerAs: 'vm',
          controller: function ($scope, $firebaseObject, $location, $mdDialog) {
            var vm = this;
            this.hasChanged = false;

            $scope.$on('$destroy', function () {
              vm.item.$destroy();
              vm.settings.$destroy();
            })

            this.item = $firebaseObject(dbService.child('settings/generalText'));
            this.settings = $firebaseObject(dbService.child('settings'));

            this.updateModel = function (type) {
              vm.settings.$save();
            }

            this.back = function () {

              if (vm.hasChanged) {
                var confirm = $mdDialog.confirm()
                  .title('Save changes?')
                  .ariaLabel('Save')
                  .ok('YES')
                  .cancel('NO');

                $mdDialog.show(confirm).then(function() {
                  vm.settings.generalText = vm.summernote.summernote('code');
                  vm.settings.afscheidText = vm.summernote_2nd.summernote('code');
                  vm.settings.$save();
                  $scope.$evalAsync( function () {
                    $location.path('/start');
                  })
                }, function() {
                  $scope.$evalAsync( function () {
                    $location.path('/start');
                  })
                });

              } else {
                $scope.$evalAsync( function () {
                  $location.path('/start');
                })
              }
            }

            this.save = function () {
              vm.settings.infoText = vm.summernote.summernote('code');
              vm.settings.afscheidText = vm.summernote_2nd.summernote('code');
              vm.hasChanged = false;
              vm.settings.$save();
            }
            
          }
        })
        .when('/items', {
          templateUrl: '_items.html',
          controllerAs: 'vm',
          controller: function ($firebaseArray) {
            this.items = $firebaseArray(dbService.child('/items'));

            this.add = function () {
              var key = dbService.child('/items').push().key;
              dbService.child('/items/' + key).set({id: key});
            }

            this.delete = function (item) {
              this.items.$remove(item);
            }

            this.logOut = function () {
              firebase.auth().signOut();
            }

          }
        })
        .when('/items/:item', {
          templateUrl: '_item.html',
          controllerAs: 'vm',
          controller: function ($scope, $routeParams, $firebaseObject, $location, $timeout, $mdDialog) {
            var id = $routeParams.item;

            $scope.$on('$destroy', function () {
              vm.item.$destroy();
            })

            var vm = this;
            this.item = $firebaseObject(dbService.child('items/' + id));

            this.back = function () {

              if (vm.hasChanged) {
                var confirm = $mdDialog.confirm()
                  .title('Save changes?')
                  .ariaLabel('Save')
                  .ok('YES')
                  .cancel('NO');

                $mdDialog.show(confirm).then(function() {
                  vm.item.$save();
                  $scope.$evalAsync( function () {
                    $location.path('/items');
                  })
                }, function() {
                  $scope.$evalAsync( function () {
                    $location.path('/items');
                  })
                });

              } else {
                $scope.$evalAsync( function () {
                  $location.path('/items');
                })
              }
            }

            this.save = function () {
              vm.item.description = vm.summernote.summernote('code');
              $timeout( function () {
                vm.hasChanged = false;
                vm.item.$save();
              },300);
            }

            $scope.$watch(angular.bind(this, function () {
              return vm.item;
            }), function (newVal, oldVal) {

              if (oldVal.id && ( newVal !== oldVal )) {
                vm.hasChanged = true;
              } else {
                vm.hasChanged = false;
              }
            }, true);

          }
        })

        $locationProvider.html5Mode(true).hashPrefix('!');

    })

    app.run( function ($location, $rootScope, $location) {

      firebase.auth().onAuthStateChanged(function(auth) {

        if (!auth) {
          $rootScope.$evalAsync( function () {
            $rootScope.started = true;
            $rootScope.auth = false;
          })
        } else {
          $rootScope.$evalAsync( function () {
            $rootScope.started = true;
            $rootScope.auth = auth;
          })

        }
      });
    })

    app.controller('loginCtrl', function ($rootScope, $mdToast) {
      this.loginModel = {};

      this.login = function () {
        firebase.auth().signInWithEmailAndPassword(this.loginModel.username, this.loginModel.password).catch( function (err) {
          $mdToast.show(
            $mdToast.simple()
            .textContent('Login failed')
            .theme("error-toast")
            .position('top right')
            .hideDelay(2000)
          )
        })
      }
    });

  app.directive("contenteditable", function () {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            // read is the main handler, invoked here by the blur event

            var variable = attrs.editName;
            var type = attrs.editType;

            if ( variable==='slots') {

              var obj = scope.point.slots;

                var keys = _.map(obj, function (i,key) {
                  return key
                })

                element.html(keys.join())
               
              }

            function read() {
                scope.point[variable] = element.html();

                if (variable==='slots') {
                  var array = scope.point.slots.split(',');
                  var reduce = _.reduce(array, function(acc, item) {
                    if (item) {
                      acc[item] = {};
                      acc[item].tijdstip = Date.now()
                    }
                    return acc;
                  }, {})

                  scope.point.slots = reduce;

                } 

                  if (type==='number') {
                    scope.point[variable] = Number(scope.point[variable]);
                  }

                  scope.save(scope.point);
                  if (variable!='slots') {
                    element.html(scope.point[variable]);
                  }
                
            }

            element.bind("blur", function () {
                read();
            });

            element.bind("paste", function(e){
                e.preventDefault();
                document.execCommand('inserttext', false, e.originalEvent.clipboardData.getData('text/plain'));
            });
        }
    };
  });

  app.directive("fileread", [function () {
    return {
        link: function (scope, element, attributes) {
          element.bind("change", function (changeEvent) {

            var file = changeEvent.target.files[0];

            if (!file) {
              return;
            }

            scope.$apply(function () {
                scope.vm.processing = true;
                ImageTools.resize(changeEvent.target.files[0], {width: 1024, height: 768 }, function (blob) {

                  storage.child(file.name).put(blob).then( function (snapshot) {
                      snapshot.ref.getDownloadURL().then( function (url) {
                        scope.$evalAsync( function () {
                            scope.vm.item.file = url;
                            scope.vm.processing = false;
                        })
                      })
                  }); 

                }, function (err) {
                  console.log(err);
                });
              });
          })
        }
    }
}]);

  app.filter('currency', function () {
    return function (input ) {

        try {
            var formatter = new Intl.NumberFormat('nl-NL', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0
            })
        } catch(err) {
            return input;
        }

        return formatter.format(input);
    };
  });

  app.directive('fadeInLoad', function () {
    return {
        link: function(scope, element) {
            element.on('load', function() {
                jQuery(element).css('opacity', 1);
            });
        }
    }
  });

  app.directive('updateSize', function ($window, $timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {

          var footer = Number(attributes.updateSize);

          function getHeight() {
            var height = $window.innerHeight - (element[0].getBoundingClientRect().top + footer);
            angular.element(element).css('height', height + 'px');
            return height;
          }
          function onResize() {
            //mdVirtualRepeatContainer.setSize_(getHeight());
            angular.element(element).css('height', getHeight() + 'px');
          }
          getHeight();
          angular.element($window).on('resize', onResize);

          $timeout(function () {
            onResize();
          });

        }
      };
    }
  );

  app.filter('toArray', function() {
		return function(input) {

			if(!input) return [];

			if (input instanceof Array) {
				return input;
			}

			return $.map(input, function(val) {
				return val;
			});
		};
	})

  app.directive('summernote', function () {
    return {
      scope: {
        summernote: '=',
        settings: '=',
        hasChanged: '='
      },
      link: function (scope, element) {

        scope.summernote = element.summernote({
          placeholder: 'Type text hier',
          tabsize: 2,
          height: 300,
          fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'fago'],
          fontSizes: ['8', '9', '10', '11', '12', '14', '15', '16', '17', '18' , '22', '30', '40'],
          toolbar: [
            ['insert', ['picture']],
            ['style', ['bold', 'italic', 'underline']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph', 'left', 'center', 'right', 'justify']],
          ],
          callbacks: {
            onChange: function(content) {
              if (content===scope.initValue) {
                return;
              }
              scope.$evalAsync(  function () {
                scope.hasChanged = true;
              })
            }
          }
        });

        scope.$watch('settings', function (value) {
          scope.initValue = value;
          scope.summernote.summernote('code', value);
        })

      }
    }
  })

  app.filter('orderObjectBy', function() {

    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item) {
          filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });

        if(reverse) filtered.reverse();

        return filtered;
    };

  })

  app.filter('orderByObject', function() {

    return function(items, prop) {
        var filtered = [];
        
        angular.forEach(items, function(item) {
          filtered.push(item);
        });

        return _.chain(filtered)
        .sortBy( function (item) {
          var key = Number(item.id.replace("team",""));
          return key;
        })
        .value();
    };

  })

  app.filter('moment', function () {
    return function (input,format ) {
        return moment(input).format('DD-MMM HH:mm');
    };
  });

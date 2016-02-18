
angular.module('app.controllers', ['ionic', 'ngCordova', 'ionic-ratings', 'leaflet-directive', 'google.places'])


    .controller('indexCtrl', function ($scope, $timeout, Orders, CurrentState, $state, $ionicLoading) {


        $scope.answers = '';

        $scope.options = {
            componentRestrictions: { country: 'kg' },
            types: ['geocode']
        };
        $scope.radius=10;
        $scope.lat = '';
        $scope.long = '';
        $scope.from = '';
        $scope.to = '';
        $scope.currentOrderId = CurrentState.getOrderID();
        $scope.newOrders = Orders.newOrders;
        $scope.inProgressOrders = Orders.inProgressOrders;

        $scope.markers = [];
            angular.extend($scope, {
                center: {
                    lat: $scope.lat,
                    lng: $scope.long,
                    zoom: 6
                }
            });
        Orders.newOrders.$watch(function () {
            angular.forEach($scope.newOrders, function (order) {
                console.log($scope.markers);
                $scope.markers.push({
                    lat: order.lat,
                    lng: order.long,
                    message: "Сообщение",
                    focus: true,
                    draggable: false
                });

            });
        });

        function success(position) {
            $scope.lat = position.coords.latitude;
            $scope.long = position.coords.longitude;
            angular.extend($scope, {
                center: {
                    lat: $scope.lat,
                    lng: $scope.long,
                    zoom: 6
                }
            });
        }

        function error() {
            angular.extend($scope, {
                center: {
                    lat: 0,
                    lng: 0,
                    zoom: 6
                }
            });
        }
        navigator.geolocation.getCurrentPosition(success, error);

        $scope.addOrder = function (from, to) {
            console.log(from.formatted_address);
            console.log($scope.long);
            $scope.newOrders.$add({
                "from": from.formatted_address,
                "to": to,
                "lat": $scope.lat,
                "long": $scope.long,
                "status": 0,
                "timeOfCreation": Date.now()
            }).then(function (p) {
                $scope.currentOrderId = p.key();
                CurrentState.setOrderID($scope.currentOrderId);
                $state.go('order');
            });
        };
    })

    .controller('loginCtrl', function ($scope, CurrentState, $cordovaImagePicker, $ionicPlatform) {
        $scope.imageUri = '';
        var options = {
            maximumImagesCount: 1,
            width: 800,
            height: 800,
            quality: 80
        };
        $scope.getImage = function () {
            $ionicPlatform.ready(function () {
                if (ionic.Platform.isAndroid()) {
                    $cordovaImagePicker.getPictures(options)
                        .then(function (results) {
                            $scope.imageUri = results[0];
                            for (var i = 0; i < results.length; i++) {
                                console.log('Image URI: ' + results[i]);
                            }
                        }, function (error) {
                            $scope.imageUri = 'http://lorempixel.com/400/200/';
                        });
                } else $scope.imageUri = 'http://lorempixel.com/400/200/';
            });

        };

    })

    .controller('orderCtrl', function ($scope, $ionicLoading, $timeout, Orders, CurrentState, $ionicPopup) {

        $scope.Orders = Orders.newOrders;
        $scope.currentOrderId = CurrentState.getOrderID();
        $scope.currentOrder = $scope.Orders.$getRecord($scope.currentOrderId);
        $scope.ratingsObject = {
            iconOn: 'ion-ios-star',
            iconOff: 'ion-ios-star-outline',
            iconOnColor: 'rgb(255, 191, 0)',
            iconOffColor: 'rgb(255, 191, 0)',
            rating: 2,
            minRating: 1,
            callback: function (rating) {
                $scope.ratingsCallback(rating);
            }
        };
        $scope.call = function (tel) {

            document.location.href = 'tel:' + tel;
        };
        $scope.loadingShow = function () {
            $ionicLoading.show({
                template: "<ion-spinner icon='dots'></ion-spinner><div>Ведется поиск машин</div>"
            });
            $scope.$watch('currentOrder.state', function (newVal, oldVal, scope) {
                console.log(oldVal);
                console.log(newVal);
                if (newVal != oldVal) {
                    $scope.loadingHide()
                };
            });
        };
        $scope.showPopup = function () {
            $scope.data = {};

            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: '<input type="password" ng-model="data.wifi">',
                title: 'Enter Wi-Fi Password',
                subTitle: 'Please use normal things',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel'
                    },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!$scope.data.wifi) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                return $scope.data.wifi;
                            }
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });

            $timeout(function () {
                myPopup.close(); //close the popup after 3 seconds for some reason
            }, 3000);
        };


        $scope.loadingHide = function () {
            $ionicLoading.hide();
        };
        $scope.cancelOrder = function (currentOrder) {
            $scope.showPopup();

            if (currentOrder) {
                currentOrder.status = 3;
                $scope.Orders.$save(currentOrder);
            } else console.log('Ошибка');
        }

        $scope.ratingsCallback = function (rating) {
            console.log('Selected rating is : ', rating);
        };


    })

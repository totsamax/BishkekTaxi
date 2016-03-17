angular.module('app.controllers', ['ionic', 'ngCordova', 'ionic-ratings', 'leaflet-directive', 'google.places', "angularGeoFire"])


.controller('indexCtrl', function($scope, $timeout, Orders, CurrentState, $state, $ionicLoading, $geofire) {
    $scope.answers = '';

    $scope.options = {
        componentRestrictions: {
            country: 'kg'
        },
        types: ['geocode']
    };
    $scope.radius = 10;
    $scope.lat = 0;
    $scope.long = 0;
    $scope.from = '';
    $scope.to = '';
    $scope.currentOrderId = CurrentState.getOrderID();
    $scope.newOrders = Orders.newOrders;
    $scope.inProgressOrders = Orders.inProgressOrders;
    $scope.ordersGeo = Orders.ordersGeo;


    $scope.markers = [];
    
    angular.extend($scope, {
        center: {
            lat: $scope.lat,
            lng: $scope.long,
            zoom: 6
        },
        markers: {},
        awesomeMarkerIcon: {
            type: 'awesomeMarker',
            icon: 'star',
            markerColor: 'red'
        }
    });
    $scope.markers["you"] = {
        lat: $scope.lat,
        lng: $scope.long,
        focus: true,
        draggable: true,
        icon: {
            type: 'awesomeMarker',
            icon: 'star',
            markerColor: 'red'
        }
    };
    // Orders.newOrders.$watch(function() {
    //     var you = $scope.markers["you"];
    //     $scope.markers = [];
    //     $scope.markers["you"] = you;
    //     angular.forEach($scope.newOrders, function(order) {
    //         console.log(order);
    //         $scope.markers.push({
    //             lat: order.lat,
    //             lng: order.long,
    //             focus: true,
    //             draggable: false,
    //             icon: {
    //                 type: 'awesomeMarker',
    //                 icon: 'star',
    //                 markerColor: 'orange'
    //             }
    //         });

    //     });
    // });

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
        $scope.markers["you"] = {
            lat: $scope.lat,
            lng: $scope.long,
            focus: true,
            draggable: true,
            icon: {
                type: 'awesomeMarker',
                icon: 'star',
                markerColor: 'red'
            }
        };
    }

    function error(e) {
        // angular.extend($scope, {
        //     center: {
        //         lat: $scope.lat,
        //         lng: $scope.long,
        //         zoom: 6
        //     }
        // });
        console.log(e);
    }
    try {
        navigator.geolocation.getCurrentPosition(success, error);
    } catch (e) {

    };
    $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
        $scope.markers.you.lat = args.model.lat;
        $scope.markers.you.lng = args.model.lng;
        console.log(args); //here am getting 12 ,80  every time
        console.log(event); // Here i can see new coordinates

    });

    $scope.addOrder = function(from, to) {
        console.log(from.formatted_address);
        console.log($scope.long);
        $scope.newOrders.$add({
            "from": typeof from.formatted_address !== 'undefined' ? from.formatted_address : from,
            "to": to,
            "lat": $scope.lat,
            "long": $scope.long,
            "status": 0,
            "timeOfCreation": Date.now()
        }).then(function(p) {
            $scope.currentOrderId = p.key();
            CurrentState.setOrderID($scope.currentOrderId);
            $scope.ordersGeo.$set("some_key", [37.771393, -122.447104])
                .catch(function(err) {
                    console.error(err);
                });
            $state.go('order');
        });
    };
})

.controller('loginCtrl', function($scope, CurrentState, $cordovaImagePicker, $ionicPlatform) {
    $scope.imageUri = '';
    var options = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80
    };
    $scope.getImage = function() {
        $ionicPlatform.ready(function() {
            if (ionic.Platform.isAndroid()) {
                $cordovaImagePicker.getPictures(options)
                    .then(function(results) {
                        $scope.imageUri = results[0];
                        for (var i = 0; i < results.length; i++) {
                            console.log('Image URI: ' + results[i]);
                        }
                    }, function(error) {
                        $scope.imageUri = 'http://lorempixel.com/400/200/';
                    });
            } else $scope.imageUri = 'http://lorempixel.com/400/200/';
        });

    };

})

.controller('orderCtrl', function($scope, $ionicLoading, $timeout, Orders, CurrentState, $ionicPopup) {

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
        callback: function(rating) {
            $scope.ratingsCallback(rating);
        }
    };
    $scope.call = function(tel) {

        document.location.href = 'tel:' + tel;
    };
    $scope.loadingShow = function() {
        $ionicLoading.show({
            template: "<ion-spinner icon='dots'></ion-spinner><div>Ведется поиск машин</div>"
        });
        $scope.$watch('currentOrder.state', function(newVal, oldVal, scope) {
            console.log(oldVal);
            console.log(newVal);
            if (newVal != oldVal) {
                $scope.loadingHide()
            };
        });
    };
    $scope.showPopup = function() {
        $scope.data = {};

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="password" ng-model="data.wifi">',
            title: 'Enter Wi-Fi Password',
            subTitle: 'Please use normal things',
            scope: $scope,
            buttons: [{
                text: 'Cancel'
            }, {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.wifi) {
                        //don't allow the user to close unless he enters wifi password
                        e.preventDefault();
                    } else {
                        return $scope.data.wifi;
                    }
                }
            }]
        });

        myPopup.then(function(res) {
            console.log('Tapped!', res);
        });

        $timeout(function() {
            myPopup.close(); //close the popup after 3 seconds for some reason
        }, 3000);
    };


    $scope.loadingHide = function() {
        $ionicLoading.hide();
    };
    $scope.cancelOrder = function(currentOrder) {
        $scope.showPopup();

        if (currentOrder) {
            currentOrder.status = 3;
            $scope.Orders.$save(currentOrder);
        } else console.log('Ошибка');
    }

    $scope.ratingsCallback = function(rating) {
        console.log('Selected rating is : ', rating);
    };


})
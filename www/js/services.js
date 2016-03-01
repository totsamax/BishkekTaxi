angular.module('app.services', ["firebase","angularGeoFire"])
    .factory("Orders", function ($firebaseArray,$geofire) {
        var url = "https://resplendent-torch-8168.firebaseio.com/orders";
        var newOrdersRef = new Firebase("https://resplendent-torch-8168.firebaseio.com/orders" + "/new");
        var inProgressOrdersRef = new Firebase("https://resplendent-torch-8168.firebaseio.com/orders" + "/inprogress");
        var ordersGeo = new Firebase("https://resplendent-torch-8168.firebaseio.com/orders/geo");
        return {
            url: url,
            newOrders: $firebaseArray(newOrdersRef),
            inProgressOrders: $firebaseArray(inProgressOrdersRef),
            ordersGeo:$geofire(ordersGeo)
        }
    })
    .service("CurrentState", function (Orders) {

        var state = this;
        state.sharedObject = {};
        state.getOrderID = function () {
            return state.sharedObject.orderId;
        }

        state.setOrderID = function (value) {
            state.sharedObject.orderId = value;
        }
    });

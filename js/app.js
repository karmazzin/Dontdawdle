'use strict';

(function(){
    var app = angular.module('dontdawdle', []);

    app.controller('PopupController', function($scope, Chrome) {
        var vm = this;

        vm.url = '';
        Chrome.tabs().then(function(data) {
            vm.url = data.url;
        });

        vm.lockCurrentUrl = function() {
            console.log(vm.url);

        };
    });

    app.factory('Chrome', function($q) {
        return {
            tabs: function() {
                var deferred = $q.defer();

                chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
                    deferred.resolve(tabs[0]);
                });

                return deferred.promise;
            }
        };
    });

})();
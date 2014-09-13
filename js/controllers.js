'use strict';

(function() {
    var app = angular.module('dontdawdle');

    app.controller('PopupController', function(ChromeService, Helper, Storage, Blocker) {
        var vm = this;
        var tab = {};

        ChromeService.tabs().then(function(data) {
            tab = data;
            vm.domain = Helper.getDomain(tab.url);
        });

        vm.lockCurrentUrl = function() {
            Blocker.addBlock(vm.domain);
            Storage.put('last_domain', vm.domain);
            chrome.tabs.update(tab.id, {"url" : "blocked.html"});
        };
    });

    app.controller('LockController', function(ChromeService, Storage, Blocker) {
        var vm = this;
        var tab = {};

        ChromeService.tabs().then(function(data) {
            tab = data;
        });

        vm.unlockLastDomain = function() {
            var last_domian = Storage.get('last_domain');
            Blocker.removeBlock(last_domian);
            chrome.tabs.update(tab.id, {"url" : last_domian});
        };

        vm.redirectToList = function($window) {
            chrome.tabs.update(tab.id, {"url" : "options.html"});
            $window.close();
        };

    });

    app.controller('ListController', function(Blocker) {
        var vm = this;

        vm.domains = Blocker.getAllBlocked();//@TODO переделать сторадж

        vm.unlockDomain = function(domain) {
            Blocker.removeBlock(domain);
            delete vm.domains[domain];
        };
    });
})();
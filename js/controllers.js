'use strict';

(function() {
    var app = angular.module('dontdawdle');

    app.controller('PopupController', function(ChromeService, Helper, ChromeStorage, Blocker) {
        var vm = this;
        var tab = {};

        ChromeService.tabsPromise().then(function(data) {
            tab = data;
            vm.domain = Helper.getDomain(tab.url);
        });

        vm.lockCurrentUrl = function() {
            Blocker.addBlock(vm.domain);
            ChromeStorage.put('last_domain', vm.domain);
            chrome.tabs.update(tab.id, {"url" : "blocked.html"});
        };
    });

    app.controller('LockController', function(ChromeService, ChromeStorage, Blocker) {
        var vm = this;
        var tab = {};

        ChromeService.tabsPromise().then(function(data) {
            tab = data;
        });

        vm.unlockLastDomain = function() {
            ChromeStorage.getPromise('last_domain').then(function(last_domain) {
                Blocker.removeBlock(last_domain);
                chrome.tabs.update(tab.id, {"url" : last_domain});
            });
        };

        vm.redirectToList = function($window) {
            chrome.tabs.update(tab.id, {"url" : "options.html"});
            $window.close();
        };

    });

    app.controller('ListController', function(Blocker) {
        var vm = this;

        Blocker.getAllBlockedPromise().then(function(blockedList) {
            vm.domains = blockedList;
        });

        vm.unlockDomain = function(domain) {
            Blocker.removeBlock(domain);
            vm.domains.splice(vm.domains.indexOf(domain), 1);
        };
    });
})();
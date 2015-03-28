'use strict';

(function() {
    var app = angular.module('dontdawdle');

    app.controller('PopupController', function(ChromeService, Helper, ChromeStorage, Blocker, $window) {
        var vm = this;
        var tab = {};

        ChromeService.tabsPromise().then(function(data) {
            tab = data;
            vm.domain = Helper.getDomain(tab.url);
        });

        vm.lockCurrentUrl = function() {
            _gaq.push(['_trackEvent', 'Block', 'Block domain ' + vm.domain]);

            Blocker.addBlockPromise(vm.domain).then(function() {
                ChromeStorage.put('last_domain', vm.domain);
                chrome.tabs.update(tab.id, {"url" : "blocked.html"});
                $window.close();
            });
        };
    });

    app.controller('LockController', function(ChromeService, ChromeStorage, Blocker, $timeout) {
        var vm = this;
        var tab = {};

        ChromeService.tabsPromise().then(function(data) {
            tab = data;
        });

        vm.unlockLastDomain = function() {
            ChromeStorage.getPromise('last_domain').then(function (last_domain) {
                _gaq.push(['_trackEvent', 'Unlock last', 'Unlock last domain ' + last_domain]);

                $timeout(function () {
                    Blocker.removeBlock(last_domain);
                    chrome.tabs.update(tab.id, {"url": last_domain});
                }, 50)
            });
        };

        vm.redirectToList = function() {
            chrome.tabs.update(tab.id, {"url" : "options.html"});
        };

    });

    app.controller('ListController', function(Blocker) {
        var vm = this;

        Blocker.getAllBlockedPromise().then(function(blockedList) {
            vm.domains = blockedList;
        });

        vm.unlockDomain = function(domain) {
            _gaq.push(['_trackEvent', 'Unlock', 'Unlock domain ' + domain]);

            Blocker.removeBlock(domain);
            vm.domains.splice(vm.domains.indexOf(domain), 1);
        };
    });
})();
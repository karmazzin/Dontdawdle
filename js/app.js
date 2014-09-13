'use strict';

(function(){
    var app = angular.module('dontdawdle', []);

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

    app.factory('ChromeService', function($q) {
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

    app.factory('Helper', function() {
        var self = {};

        self.getDomain = function(url) {
            var m = url.match(/^(http|https):\/\/[^/]+/);//@TODO сделать чекер на допустимые урлы
            return m ? m[0] : '';
        };

        return self;
    });

    app.factory('Storage', function() {
        var self = {};

        self.get = function (key) {
            return localStorage.getItem(key);
        };
        self.put = function (key, value) {
            return localStorage.setItem(key, value);
        };
        self.del = function (key) {
            return localStorage.removeItem(key);
        };

        return self;
    });

    app.factory('Blocker', function(Storage) {
        function _setAllBlocked(list) {
            Storage.put('blocklist',  JSON.stringify(list));
        }

        self.isBlocked = function(domain) {
            var blockedList = self.getAllBlocked();
            return (domain in blockedList);
        }

        self.addBlock = function(domain) {
            if (!self.isBlocked(domain)) {
                var blockedList = self.getAllBlocked();
                blockedList[domain] = true;
                _setAllBlocked(blockedList);
            }
        }

        self.removeBlock = function(domain) {
            if (self.isBlocked(domain)) {
                var blockedList = self.getAllBlocked();
                delete blockedList[domain];
                _setAllBlocked(blockedList);
            }
        }

        self.getAllBlocked = function() {
            return JSON.parse(Storage.get('blocklist'));
        }

        if (!self.getAllBlocked()) {
            _setAllBlocked({});
        }

        return self;
    });

})();
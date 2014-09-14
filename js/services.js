'use strict';

(function() {
    var app = angular.module('dontdawdle');

    app.factory('ChromeService', function($q) {
        return {
            tabsPromise: function() {
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

    app.factory('Blocker', function(ChromeStorage, $q) {
        var self = {};

        function _setAllBlocked(list) {
            ChromeStorage.put('blocklist', list);
        }

        self.isBlocked = function(domain) {
            return self.getAllBlockedPromise().then(function(blockedList) {
                return blockedList.indexOf(domain) >= 0;
            });
        };

        self.addBlockPromise = function(domain) {
            var deferred = $q.defer();

            self.isBlocked(domain).then(function(is_block) {
                if (is_block) {
                    return;
                }

                self.getAllBlockedPromise().then(function(blockedList) {
                    blockedList.push(domain);
                    _setAllBlocked(blockedList);

                    deferred.resolve();
                });
            });

            return deferred.promise;
        };

        self.removeBlock = function(domain) {
            self.isBlocked(domain).then(function(is_block) {
                if (!is_block) {
                    return;
                }
                self.getAllBlockedPromise().then(function(blockedList) {
                    blockedList.splice(blockedList.indexOf(domain), 1);
                    _setAllBlocked(blockedList);
                });
            });
        };

        self.getAllBlockedPromise = function() {
            return ChromeStorage.getPromise('blocklist').then(function(blockedList) {
                return blockedList;
            });
        };


        self.getAllBlockedPromise().then(function(blockedList) {
            if (blockedList instanceof Array && blockedList.length) {
                return;
            }

            _setAllBlocked([]);
        });

        return self;
    });

    app.factory('ChromeStorage', function($q) {
        var self = {};

        self.getPromise = function(key) {
            var deferred = $q.defer();

            chrome.storage.sync.get(key, function (object) {
                deferred.resolve(object[key]);
            });

            return deferred.promise;
        };

        self.put = function(key, value) {
            var object = {};
            object[key] = value;
            chrome.storage.sync.set(object);
        };

        return self;
    });
})();
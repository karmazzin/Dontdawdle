'use strict';

(function() {
    var app = angular.module('dontdawdle');

    app.run(function(Storage, Blocker, Helper) {
        chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {
            var domain = Helper.getDomain(tab.url);

            if (Blocker.isBlocked(domain)) {
                Storage.put('last_domain', domain);
                chrome.tabs.update(tabId, {"url" : "blocked.html"});
            }

        });
    });

})();
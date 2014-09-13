'use strict';

(function() {
    var app = angular.module('dontdawdle');

    app.run(function(ChromeStorage, Blocker, Helper) {
        chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {
            var domain = Helper.getDomain(tab.url);

            Blocker.isBlocked(domain).then(function(is_block) {
                console.log(domain);
                console.log(is_block);
                if (!is_block) {
                    return;
                }
                ChromeStorage.put('last_domain', domain);
                chrome.tabs.update(tabId, {"url" : "blocked.html"});
            });

        });
    });

})();
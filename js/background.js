'use strict';

(function() {
    var app = angular.module('dontdawdle');

    app.run(function(ChromeStorage, Blocker, Helper, $timeout) {
        chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {
            var domain = Helper.getDomain(tab.url);

            Blocker.isBlocked(domain).then(function(is_block) {
                if (!is_block) {
                    return;
                }

                _gaq.push(['_trackEvent', 'Attempt', 'Attempt to open blocked domain ' + domain]);

                $timeout(function () {
                    ChromeStorage.put('last_domain', domain);
                    chrome.tabs.update(tabId, {"url" : "blocked.html"});
                }, 50)
            });

        });
    });

})();
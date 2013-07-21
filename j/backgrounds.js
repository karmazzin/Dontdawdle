chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {

    chrome.pageAction.show(tabId);

    if (SB.isBlocked(HJS.getDomain(tab.url))) {
        chrome.tabs.update(tabId, {
            "url" : "popup.html"},
            function () {});
    }
});


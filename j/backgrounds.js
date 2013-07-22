chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {

	if (SB.isBlocked(HJS.getDomain(tab.url))) {
		chrome.tabs.update(tabId, {"url" : "blocked.html"});
	}

	if (tab.url.slice(0,6) !== 'chrome') {
        chrome.pageAction.show(tabId);
	}
});


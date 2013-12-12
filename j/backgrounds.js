chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {

	var domain = HJS.getDomain(tab.url);

	if (SB.isBlocked(domain)) {
		SM.put('last_domain', domain);
		chrome.tabs.update(tabId, {"url" : "blocked.html"});
	}

	if (tab.url.slice(0,6) !== 'chrome') {
        chrome.pageAction.show(tabId);
	}
});


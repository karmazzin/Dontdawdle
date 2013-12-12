$(document).ready(function(){
	chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {

		$('#unlock_action').on('click', function() {
			SB.removeBlock(SM.get('last_domain'));
			chrome.tabs.update(tabId, {"url" : SM.get('last_domain')});
		});

		$('#to-list_action').on('click', function() {
			chrome.tabs.update(tabId, {"url" : "options.html"});
		});
	});
});

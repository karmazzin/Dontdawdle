chrome.windows.getCurrent(function(w) {
    chrome.tabs.getSelected(w.id, function(t) {

        $(document).ready(function(){
	        var domain = HJS.getDomain(t.url);
            $('#add_action').click(function(){

                SB.addBlock(domain);
	            SM.put('last_domain', domain);
                chrome.tabs.update(t.id, {"url" : "blocked.html"});
                return false;
            });
        });

    });
});


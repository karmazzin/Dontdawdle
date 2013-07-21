chrome.windows.getCurrent(function(w) {
    chrome.tabs.getSelected(w.id, function(t) {

        $(document).ready(function(){
            $('#add').click(function(){

                SB.addBlock(HJS.getDomain(t.url))
                return false;
            });
        });

    });
});


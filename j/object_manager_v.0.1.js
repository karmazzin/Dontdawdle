/**
 * StorageManager
 * @copyright Duane O'Brien 2013
 */
var SM = (function () {

    var self = {};

    self.get = function (key) {
        return localStorage.getItem(key);
    };
    self.put = function (key, value) {
        return localStorage.setItem(key, value);
    };
    self.delete = function (key) {
        return localStorage.removeItem(key);
    };

    return self;

}());

/**
 * SiteBlocker
 * @copyright Duane O'Brien 2013
 */
var SB = (function() {

	function _setAllBlocked(list) {
		SM.put('blocklist',  JSON.stringify(list));
	}

    self.isBlocked = function(domain) {
        var blockedList = self.getAllBlocked();
        return (domain in blockedList);
    }

    self.addBlock = function(domain) {
        if (!self.isBlocked(domain)) {
            var blockedList = self.getAllBlocked();
            blockedList[domain] = true;
            _setAllBlocked(blockedList);
        }
    }

    self.removeBlock = function(domain) {
        if (self.isBlocked(domain)) {
            var blockedList = self.getAllBlocked();
            delete blockedList[domain];
            _setAllBlocked(blockedList);
        }
    }

	self.getAllBlocked = function() {
		return JSON.parse(SM.get('blocklist'));
	}

	if (!self.getAllBlocked()) {
		_setAllBlocked({});
	}

    return self;
})(SM);
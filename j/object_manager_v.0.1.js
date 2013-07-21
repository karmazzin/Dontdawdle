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
    var self = {};

    if (!_getAllBlocked()) {
        _setAllBlocked({});
    } else {
        _blockedList = _getAllBlocked();
    }

    function _getAllBlocked() {
        return JSON.parse(SM.get('blocklist'));
    };

    function _setAllBlocked(list) {
        SM.put('blocklist',  JSON.stringify(list));
    }

    self.isBlocked = function(domain) {
        _blockedList = _getAllBlocked();
        return (domain in _blockedList);
    }

    self.addBlock = function(domain) {
        _blockedList = _getAllBlocked();
        if (!self.isBlocked(domain)) {
            _blockedList[domain] = true;
            _setAllBlocked(_blockedList);
        }
    }

    self.removeBlock = function(domain) {
        _blockedList = _getAllBlocked();
        if (self.isBlocked(domain)) {
            delete _blockedList[domain];
            _setAllBlocked(_blockedList);
        }
    }

    return self;
})(SM);
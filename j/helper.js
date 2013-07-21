/**
 * Helper JS
 * @copyright Народ
 */
var HJS = (function(){
    var self = {};

    self.getDomain = function(url) {
        var m = url.match(/^(http|https):\/\/[^/]+/);
        return m ? m[0] : null;
    }

    return self;
})();
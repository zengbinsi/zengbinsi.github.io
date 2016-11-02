(function () {
    "use strict";

    var CPath;
    CPath = function () {
        var self = this;

        self.imgPath = "res/BlogGameRes/img/";
        self.sndPath = "res/BlogGameRes/snd/";

        self.getImagePath = function (path) {
            return (path && path !== "") ? self.imgPath  + path : self.imgPath;
        };

        self.setImagePath = function (path) {
            self.imgPath = path || self.imgPath;
        };

        self.getSoundPath = function (path) {
            return (path && path !== "") ? self.sndPath  + path : self.sndPath;
        };

        self.setSoundPath = function (path) {
            self.sndPath = path || self.sndPath;
        };
    };

    c.path = new CPath();
}());
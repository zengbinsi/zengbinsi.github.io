(function () {
   "use strict";

    var GameObject;
    GameObject = cc.Sprite.extend({
        ctor : function (params) {
            var self = this;
            self._super();


            self.components = {};
        }
    });

    c.GameObject = GameObject;
}());


(function () {
    "use strict";

    var CFunction;
    CFunction = function () {
        var self = this;

        /**
         * 空函数
         */
        self.fnEmpty = function () {
            return;
        };

        /**
         * 包装匿名函数
         * @param method：要被调用的方法对象
         * @param target：调用者
         * @returns {m}：包装后的匿名方法
         */
        self.handler = function (method, target) {
            var m = function () {
                method.call(target);
            };

            return m;
        };

        /**
         * 处理node中指定位置是否处于可见区域中
         * @param node node
         * @param pointScreen 屏幕位置
         * @param [size] node内区域
         * @returns {boolean} 是否在可见区域中
         */
        self.isPointAtViewArea = function (node, pointScreen, size) {
            "use strict";

            var pos = node.convertToNodeSpace(pointScreen);
            if (size === undefined) {
                size = node.getContentSize();
            }
            if (!cc.rectContainsPoint(cc.rect(0, 0, size.width, size.height), pos)) {
                return false;
            }

            while (node !== null && !(node instanceof cc.Scene)) {
                if (!node.isVisible()) {
                    return false;
                }
                if (node.getViewSize !== undefined) {
                    pos = node.convertToNodeSpace(pointScreen);
                    if (!cc.rectContainsPoint(cc.rect(0, 0, size.width, size.height), pos)) {
                        return false;
                    }
                }
                node = node.getParent();
            }

            return true;
        };
    };

    c.fn = new CFunction();
}());
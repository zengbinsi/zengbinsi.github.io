(function () {

    "use strict";

    var CNetwork;

    CNetwork = function () {
        var self = this;

        /**
         * 打开一个URL链接
         * @param url：URL链接
         * @param isNewWindow：是否在新窗口中打开
         */
        self.openURL = function (url, isNewWindow) {
            url = url === "" ? "http://www.baidu.com" : url;

            if (isNewWindow) {
                // 新建窗口打开网页
                window.open(url);
            } else {
                // 在当前窗口打开网页
                window.location.href = url;
            }
//        window.open("res/BlogPages/IT/01_Unity3D/05_Unity脚本调试/05_Unity脚本调试.html");
        };
    };

    c.net = new CNetwork();
}());
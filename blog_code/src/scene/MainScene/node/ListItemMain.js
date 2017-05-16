(function () {
    "use strict";
    var ListItemMain;

    ListItemMain = function () {
        var self = this;

        self.show = function (info) {
            var view = self.createView();

            self.loadDateTime(view, info.date.toString(), info.time.toString());

            var subtitle = self.loadSubtitle(view, info.name);

            self.loadReadRate(info.fileName);

            self.loadLine(view);

            self.bindTouch(subtitle, info.path);

            return view;
        };

        /**
         * 加载视图对象
         * @returns {cc.LayerColor}
         */
        self.createView = function () {
            var view = new cc.LayerColor(cc.color(255, 255, 255, 255), cc.winSize.width, 100);
            return view;
        };

        /**
         * 显示时间
         * @param view
         * @param date
         * @param time
         */
        self.loadDateTime = function (view, date, time) {
            var year = date.substring(0, 4);
            var moon = date.substring(4, 6);
            var day = date.substring(6);

            var hour = time.substring(0, 2);
            var minute = time.substring(2, 4);
            var second = time.substring(4);


            var dateLabel = new cc.LabelTTF(year + "年" + moon + "月" + day + "日", "MarkerFelt-Thin", 5);

            dateLabel.setColor(cc.color(130, 130, 130));
            dateLabel.setAnchorPoint(0, 0);
            dateLabel.setPosition(30, 70);
            view.addChild(dateLabel);


            var timeLabel = new cc.LabelTTF(hour + " : " + minute + " : " + second, "MarkerFelt-Thin", 5);

            timeLabel.setColor(cc.color(130, 130, 130));
            timeLabel.setAnchorPoint(0, 0);
            timeLabel.setPosition(130, 70);
            view.addChild(timeLabel);
        };

        /**
         * 加载标题
         * @param view
         * @param context
         */
        self.loadSubtitle = function (view, context) {
            var subtitle = new cc.LabelTTF(context, null, 20);
            subtitle.getTexture().setAliasTexParameters();
            subtitle.setColor(cc.color(0, 0, 0));
            subtitle.setAnchorPoint(0, 0.5);
            subtitle.setPosition(30, 50);
            view.addChild(subtitle);

            return subtitle;
        };

        /**
         * 加载阅读量
         * @param fileName
         */
        self.loadReadRate = function (fileName) {
            var rate = cc.sys.localStorage.getItem(fileName);

        };

        /**
         * 加载分割线
         * @param view
         */
        self.loadLine = function (view) {
            var line = new cc.Sprite(c.path.getImagePath("main/contentPanel/line.png"));
            line.setAnchorPoint(0, 0);
            line.setPosition(30, 0);
            view.addChild(line);

            view.line = line;
        };

        /**
         * 打开URL
         * @param subtitle
         * @param url
         */
        self.bindTouch = function (subtitle, url) {
            var isTouchThis = false;
            var listener = cc.EventListener.create({
                event: cc.EventListener.MOUSE,
                target: subtitle,
                onMouseDown: function (event) {
                    var point = event.getLocation();

                    if (!c.fn.isPointAtViewArea(subtitle, point)) {
                        return;
                    }

                    self.isMoveScrollView = false;
                    self.touchPoint = point;
                    isTouchThis = true;
                },
                onMouseMove : function (event) {
                    var point = event.getLocation();
                    var distance = cc.pDistance(self.touchPoint, point);

                    if (distance > 20) {
                        self.isMoveScrollView = true;
                    }

                },
                onMouseUp : function (event) {
                    if (self.isMoveScrollView || !c.fn.isPointAtViewArea(subtitle, event.getLocation())) {
                        return;
                    }

                    if (isTouchThis && event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                        c.net.openURL(url, true);
                    }
                }
            });

            cc.eventManager.addListener(listener, subtitle);
        };

    };

    c.view.listItemMain = new ListItemMain();
}());
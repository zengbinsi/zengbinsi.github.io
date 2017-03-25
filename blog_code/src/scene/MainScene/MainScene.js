(function () {
    "use strict";

    var MainScene;
    MainScene = function () {
        var self = this;

        self.show = function () {
            self.loadScene();
            self.playMusic();
        };

        self.loadScene = function () {
            var scene = new cc.LayerColor(cc.color(245, 245, 245, 255), cc.winSize.width, cc.winSize.height);
            c.ui.runScene(scene);

            // 采用简书主页排版方式
            // 左边工具栏
            self.loadToolBar(scene);
            // 左侧个人信息
            self.loadZbsPanel(scene);
            // 加载内容面板
            self.loadContentPanel(scene);
        };

        /**
         * 左边工具栏
         * @param {cc.Layer} scene:场景对象
         */
        self.loadToolBar = function (scene) {
            var toolBar = new cc.LayerColor(cc.color(42, 42, 42, 255), 45, cc.winSize.height);
            scene.addChild(toolBar, 10000);
        };

        /**
         * 左侧个人信息
         * @param {cc.Layer} scene:场景对象
         */
        self.loadZbsPanel = function (scene) {
            var zbsPanel = new cc.LayerColor(cc.color(192, 192, 192, 255), 300, cc.winSize.height);
            scene.addChild(zbsPanel);

            var zbsPanelBg = new cc.Sprite(c.path.getImagePath("main/zbsPanel/1.jpg"));
            zbsPanelBg.setAnchorPoint(0, 0);
            zbsPanel.addChild(zbsPanelBg);

            var title = new cc.LabelTTF(zengbinsi.blogName, null, 32);
            title.setPosition(70, 150);
            title.setAnchorPoint(0, 0);
            zbsPanel.addChild(title, 100);

            var sign = new cc.LabelTTF(zengbinsi.sign, null, 15);
            sign.setPosition(70, 110);
            sign.setAnchorPoint(0, 0);
            zbsPanel.addChild(sign, 100);

            var btn = new cc.Sprite(res.mainScene_zbsPanel_btnBg_1);
            btn.setAnchorPoint(0, 0);
            btn.setPosition(70, 50);
            zbsPanel.addChild(btn);
            self.bindTouchBtn(btn, "/../others/resume/曾彬思的简历.html");

            var resume = new cc.LabelTTF("简历", null, 24);
            resume.setPosition(60, 20);
            btn.addChild(resume, 100);
        };

        /**
         * 打开URL
         * @param subtitle
         * @param url
         */
        self.bindTouchBtn = function (btn, url) {
            var listener = cc.EventListener.create({
                event: cc.EventListener.MOUSE,
                target: btn,
                onMouseDown: function (event) {
                    var point = event.getLocation();

                    if (!c.fn.isPointAtViewArea(btn, point)) {
                        return;
                    }
                },
                onMouseUp : function (event) {
                    c.net.openURL(url, true);
                }
            });

            cc.eventManager.addListener(listener, btn);
        };

        /**
         * 加载内容面板
         * @param {cc.Layer} scene:场景对象
         */
        self.loadContentPanel = function (scene) {
            var contentPanel = new cc.LayerColor(cc.color(255, 255, 255, 255), cc.winSize.width, cc.winSize.height);
            contentPanel.setPosition(300, 0);
            scene.addChild(contentPanel, 1000);

            self.loadTopToolBar(contentPanel);

            var scrollView = self.loadScrollView(contentPanel, (BlogPagesPath.length - 1) * 100);
            var blogList = self.reorderBlogList(BlogPagesPath);
            self.loadBlogsList(scrollView, blogList);
        };

        /**
         * 加载内容面板顶部的工具栏
         * @param parent
         */
        self.loadTopToolBar = function (parent) {
            var topToolBar = new cc.LayerColor(cc.color(210, 210, 210, 255), cc.winSize.width, 50);
            topToolBar.setContentSize(cc.winSize.width, 40);
            topToolBar.setPosition(0, cc.winSize.height - 40);
            parent.addChild(topToolBar, 1000);
        };

        /**
         * 加载滚动视图
         * @param parent
         */
        self.loadScrollView = function (parent, innerContainerHeight) {
            var scrollView = new ccui.ScrollView();
            scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
            scrollView.setTouchEnabled(true);
            scrollView.setBounceEnabled(true);
            scrollView.setContentSize(550, cc.winSize.height - 40);
            scrollView.setInnerContainerSize(cc.size(550, innerContainerHeight || 960));
            parent.addChild(scrollView, 500);

            return scrollView;
        };

        /**
         * 重新排序博客列表
         * @param infos
         * @returns {Array}
         */
        self.reorderBlogList = function (infos) {
            var blogList = [];
            var index;
            for (index in infos) {
                if (infos[index].name) {
                    var date = infos[index].name.substring(0, 8);
                    var time = infos[index].name.substring(9, 15);

                    infos[index].date       = date;
                    infos[index].time       = time;
                    infos[index].fileName   = infos[index].name;
                    infos[index].name       = infos[index].name.substring(16);

                    blogList[date] = blogList[date] || [];
                    blogList[date][time] = infos[index];
                }
            }
            return blogList;
        };

        /**
         * 加载博客列表
         * @param parent
         */
        self.loadBlogsList = function (parent, infos) {
            var date, time, index = 0;

            for (date in infos) {
                var info = infos[date];
                for (time in info) {
                    if (info[time].name) {
                        var view = c.view.listItemMain.show(info[time]);
                        view.setAnchorPoint(0, 0);
                        view.setPosition(0, 100 * index++);

                        if (index === 1) {
                            view.line.setVisible(false);
                        }
                        
                        parent.addChild(view);
                    }
                }
            }
        };

        /**
         * 播放背景音乐
         */
        self.playMusic = function () {
            cc.loader.load("res/BlogGameRes/snd/music/zcx_dtdmm.mp3", function () {
                cc.audioEngine.playMusic("res/BlogGameRes/snd/music/zcx_dtdmm.mp3");
            });
        };
    };


    c.view.mainScene = new MainScene();
}());
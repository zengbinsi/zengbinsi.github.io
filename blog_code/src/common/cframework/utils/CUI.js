(function () {
    "use strict";
    var CUI;
    CUI = function () {
        var self = this;
        var stage = null,
            currentScene = null;

        /**
         * 初始化舞台对象【场景】
         * @returns {cc.Scene}
         */
        self.initStage = function () {
            if (stage === null) {
                stage = new cc.Scene();
            }

            cc.director.runScene(stage);

            return stage;
        };

        /**
         * 获取舞台对象【场景】
         * @returns {cc.Scene}
         */
        self.getStage = function () {
            return stage;
        };

        /**
         * 运行场景
         * @param scene：场景对象
         * @param localZOrder：层级
         * @returns {cc.Layer}
         */
        self.runScene = function (scene, localZOrder) {
            if (currentScene !== null) {
                stage.removeChild(currentScene);
            }

            stage.addChild(scene, localZOrder || 0);
            currentScene = scene;

            return scene;
        };

        /**
         * 获取当前正在运行的场景
         * @returns {cc.Layer}
         */
        self.getRunningScene = function () {
            return currentScene;
        };
    };



    c.ui = new CUI();
}());
﻿(function () {
    "use strict";

    var AnimationKeyFrames = {
        // 弹出（从边缘）
        Flyout: new (function Flyout() {
            if (this._instance) { return this._instance; }
            this._instance = this;
            // 向顶端
            this.toTop = "WinJS-showFlyoutTop";
            // 向底端
            this.toBottom = "WinJS-showFlyoutBottom";
            // 向左
            this.toLeft = "WinJS-showFlyoutLeft";
            // 向右
            this.toRight = "WinJS-showFlyoutRight";
            // 从底端（别名，向顶端）
            this.fromBottom = this.toTop;
            // 从顶端（别名，向底端）
            this.fromTop = this.toBottom;
            // 从左侧
            this.fromLeft = this.toRight;
            // 从右侧
            this.fromRight = this.toLeft;
        })(),
        // WinJS 内部使用，建议不用这个
        Progress: {
            fadeOut: "win-progress-fade-out"
        },
        // WinJS 内部使用，对于搜索框弹出搜索推荐
        SearchBox: {
            // 显示搜索推荐
            showPopup: {
                flyoutBelow: "WinJS-flyoutBelowSearchBox-showPopup",
                flyoutAbove: "WinJS-flyoutAboveSearchBox-showPopup"
            }
        },
        // 渐变
        Opacity: {
            // 显示
            visible: "WinJS-opacity-in",
            // 消失
            hidden: "WinJS-opacity-out"
        },
        // 缩放
        Scale: {
            // 放大一点
            up: "WinJS-scale-up",
            // 缩小一点
            down: "WinJS-scale-down"
        },
        // 默认分类
        Default: {
            // 从右返回
            remove: "WinJS-default-remove",
            // 从左返回
            removertl: "WinJS-default-remove-rtl",
            // 向右移动
            apply: "WinJS-default-apply",
            // 向左移动
            applyrtl: "WinJS-default-apply-rtl"
        },
        // 从边缘
        Edge: {
            // 从顶部
            show: "WinJS-showEdgeUI",
            // 到顶部
            hide: "WinJS-hideEdgeUI"
        },
        Panel: {
            // 从右侧
            show: "WinJS-showPanel",
            // 从左侧
            showrtl: "WinJS-showPanel-rtl",
            // 到右侧
            hide: "WinJS-hidePanel",
            // 到左侧
            hidertl: "WinJS-hidePanel-rtl"
        },
        Popup: {
            show: "WinJS-showPopup"
        },
        // 对元素的拖放
        Drag: {
            // 从右复位
            sourceEnd: "WinJS-dragSourceEnd",
            // 从左复位
            sourceEndRtl: "WinJS-dragSourceEnd-rtl"
        },
        // 进入内容
        Content: {
            // 从右进入
            enter: "WinJS-enterContent",
            // 从左进入
            enterrtl: "WinJS-enterContent-rtl"
        },
        Page: {
            // 从右进入
            enter: "WinJS-enterPage",
            // 从左进入
            enterrtl: "WinJS-enterPage-rtl"
        },
        Exit: "WinJS-exit",
        UpdateBadge: "WinJS-updateBadge"
    };
    extern({ AnimationKeyFrames: AnimationKeyFrames });
    Object.freeze(AnimationKeyFrames);
    /**
     * 生成用于 element.style.animation 的字符串
     * @param {string} swKeyFrames - 动画关键帧名称
     * @param {number} uMillisecond - 动画持续时间（毫秒）
     * @param {string} [swTimingFunc] - 缓动函数，默认 cubic-bezier(0.1, 0.9, 0.2, 1)
     * @param {number} [uDelayMs] - 延迟时间（毫秒），默认 0
     * @param {string} [swIteration] - 播放次数，默认 "1"
     * @param {string} [swDirection] - 播放方向，默认 "normal"
     * @param {string} [swFillMode] - 填充模式，默认 "forwards"
     * @param {string} [swPlayState] - 播放状态，默认 ""
     * @returns {string} 可直接赋给 element.style.animation
     */
    function generateAnimeString(swKeyFrames, uMillisecond, swTimingFunc, uDelayMs, swIteration, swDirection, swFillMode, swPlayState) {
        // 默认参数
        if (!swTimingFunc) { swTimingFunc = "cubic-bezier(0.1, 0.9, 0.2, 1)"; }
        if (!uDelayMs) { uDelayMs = 0; }
        if (!swIteration) { swIteration = "1"; }
        if (!swDirection) { swDirection = "normal"; }
        if (!swFillMode) { swFillMode = "forwards"; }
        if (!swPlayState) { swPlayState = ""; }
        if (!uMillisecond) { uMillisecond = 500; }
        if (!swKeyFrames) { swKeyFrames = AnimationKeyFrames.Flyout.toLeft; }
        // 毫秒转秒
        var swDuration = (uMillisecond * 0.001) + "s";
        var swDelay = (uDelayMs * 0.001) + "s";
        // 拼接函数
        function buildOne(name) {
            return name + " " +
                swDuration + " " +
                swTimingFunc + " " +
                swDelay + " " +
                swIteration + " " +
                swDirection + " " +
                swFillMode +
                (swPlayState ? (" " + swPlayState) : "");
        }
        var swResult = "";
        if (typeof swKeyFrames === "string") {
            swResult = buildOne(swKeyFrames);
        } else if (swKeyFrames instanceof Array) {
            var parts = [];
            for (var i = 0; i < swKeyFrames.length; i++) {
                parts.push(buildOne(swKeyFrames[i]));
            }
            swResult = parts.join(", ");
        }
        return swResult;
    }

    extern({
        generateAnimeString: generateAnimeString
    });
})();